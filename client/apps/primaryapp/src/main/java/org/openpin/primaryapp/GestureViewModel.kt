package org.openpin.primaryapp

import GestureInterpreter
import SoundPlayer
import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.openpin.appframework.media.speechplayer.SpeechPlayer
import org.openpin.appframework.daemonbridge.gesture.GestureHandler
import org.openpin.appframework.daemonbridge.process.ProcessHandler
import org.openpin.appframework.media.soundplayer.SystemSound
import org.openpin.appframework.sensors.camera.CameraManager
import org.openpin.appframework.sensors.camera.ImageCaptureConfig
import org.openpin.appframework.sensors.camera.PostProcessConfig
import org.openpin.appframework.sensors.microphone.MicrophoneManager
import org.openpin.appframework.sensors.microphone.RecordSession
import org.openpin.appframework.media.soundplayer.withLoadingSounds
import org.openpin.appframework.sensors.camera.CaptureResult
import org.openpin.appframework.sensors.camera.CaptureSession
import org.openpin.primaryapp.backend.BackendManager
import org.openpin.primaryapp.gestureinterpreter.InterpreterMode
import java.io.File

class GestureViewModel(
    private val processHandler: ProcessHandler,
    private val gestureHandler: GestureHandler,
    private val cameraManager: CameraManager,
    private val microphoneManager: MicrophoneManager,
    private val speechPlayer: SpeechPlayer,
    private val soundPlayer: SoundPlayer,
    private val backendManager: BackendManager
) : ViewModel() {
    private val visionCameraConfig = ImageCaptureConfig(
        jpegQuality = 20,
        postProcessConfig = PostProcessConfig(
            newWidth = 960,
            newHeight = 720,
        )
    )
    private val minVoiceInputLen = 1000

    private var speechCapture: RecordSession? = null
    private var videoCaptureSession: CaptureSession<Uri>? = null

    private var voiceInputStart: Long = 0

    private enum class State {
        IDLE,
        PHOTO_CAPTURE,
        VIDEO_CAPTURE,
        VOICE_INPUT,
        VOICE_THINKING,
        VOICE_RESPONDING
    }
    private var state = State.IDLE

    private val gestureInterpreter = GestureInterpreter(
        gestureHandler = gestureHandler,
        onCapturePhoto = {
            Log.w("GestureInterpreter", "onTakePhoto")
            viewModelScope.launch {
                handleCapturePhoto()
            }
        },
        onCaptureVideoStart = {
            Log.w("GestureInterpreter", "onTakeVideoStart")
            viewModelScope.launch {
                handleCaptureVideo()
            }
        },
        onAssistantStartAction = { useVision ->
            Log.w("GestureInterpreter", "onStartAssistantVoiceInput: $useVision")
            viewModelScope.launch {
                handleStartVoiceInput(isTranslating = false)
            }
        },
        onAssistantStopAction = { useVision ->
            Log.w("GestureInterpreter", "onStopAssistantVoiceInput: $useVision")
            viewModelScope.launch {
                handleEndVoiceInput(isTranslating = false, useVision = useVision)
            }
        },
        onTranslateStartAction = {
            Log.w("GestureInterpreter", "onStartTranslateVoiceInput")
            viewModelScope.launch {
                handleStartVoiceInput(isTranslating = true)
            }
        },
        onTranslateStopAction = {
            Log.w("GestureInterpreter", "onStopTranslateVoiceInput")
            viewModelScope.launch {
                handleEndVoiceInput(isTranslating = true, useVision = false)
            }
        },
        onCancelAction = {
            Log.w("GestureInterpreter", "onCancelAction")
            viewModelScope.launch {
                handleCancel()
            }
        },
        scope = viewModelScope
    )

    fun addListeners() {
        gestureInterpreter.subscribeGestures()
    }

    private suspend fun handleCapturePhoto() {
        runIfPaired {
            gestureInterpreter.setMode(InterpreterMode.DISABLED)
            state = State.PHOTO_CAPTURE

            // Capture image
            val imgFile = processHandler.createTempFile("jpeg")
            val result = cameraManager.captureImage(imgFile)

            when (result) {
                is CaptureResult.Success -> {
                    soundPlayer.play(SystemSound.SHUTTER.key)
                    backendManager.sendUploadRequest(imgFile)
                }

                else -> {
                    soundPlayer.play(SystemSound.CAPTURE_FAILED.key)
                }
            }

            imgFile.delete()

            gestureInterpreter.setMode(InterpreterMode.NORMAL)
            state = State.IDLE
        }
    }

    private suspend fun handleCaptureVideo() {
        runIfPaired {
            gestureInterpreter.setMode(InterpreterMode.CANCELABLE)
            state = State.VIDEO_CAPTURE

            soundPlayer.play(SystemSound.VIDEO_START.key)

            // Start video capture with a 15-second maximum.
            val videoFile = processHandler.createTempFile("mp4")
            videoCaptureSession = cameraManager.captureVideo(
                outputFile = videoFile,
                duration = 15000L,
                captureConfig = null
            )

            // Wait for the video capture to complete (even if stopped early).
            val result = videoCaptureSession?.waitForResult()

            when (result) {
                is CaptureResult.Success -> {
                    soundPlayer.play(SystemSound.VIDEO_END.key)
                    backendManager.sendUploadRequest(videoFile)
                }

                else -> {
                    soundPlayer.play(SystemSound.CAPTURE_FAILED.key)
                }
            }

            videoCaptureSession = null
            videoFile.delete()

            gestureInterpreter.setMode(InterpreterMode.NORMAL)
            state = State.IDLE
        }
    }

    private fun handleStartVoiceInput(isTranslating: Boolean) {
        runIfPaired {
            gestureInterpreter.setMode(InterpreterMode.DISABLED)
            state = State.VOICE_INPUT

            voiceInputStart = System.currentTimeMillis()

            if (isTranslating) {
                soundPlayer.play(SystemSound.TRANSLATE_START.key)
            } else {
                soundPlayer.play(SystemSound.ASSISTANT_START.key)
            }

            val speechFile = processHandler.createTempFile("ogg")
            speechCapture = microphoneManager.recordAudio(speechFile)
        }
    }

    private suspend fun handleEndVoiceInput(isTranslating: Boolean, useVision: Boolean) {
        // We need to check this for edge cases
        // Ex: if not paired voice input will not start, but this will still get called
        if (state != State.VOICE_INPUT)
            return

        speechCapture?.stop()
        soundPlayer.play(SystemSound.INPUT_END.key)

        if (System.currentTimeMillis() - voiceInputStart < minVoiceInputLen) {
            discardSpeech()
            gestureInterpreter.setMode(InterpreterMode.NORMAL)
            state = State.IDLE
            return
        }

        state = State.VOICE_THINKING

        var imgFile: File? = null
        if (useVision) {
            delay(300)
            soundPlayer.play(SystemSound.VISION.key)

            imgFile = processHandler.createTempFile("jpg")
            cameraManager.captureImage(imgFile, visionCameraConfig)
        }

        val endpoint = if (isTranslating) "translate" else "handle"

        speechCapture?.let { capture ->
            try {
                val res = withLoadingSounds(soundPlayer) {
                    backendManager.sendVoiceRequest(endpoint, capture.result, imgFile)
                }

                res?.let {
                    gestureInterpreter.setMode(InterpreterMode.CANCELABLE)
                    state = State.VOICE_RESPONDING

                    speechPlayer.play(it)
                    speechPlayer.awaitPlaybackCompletion()
                }
            } catch (err: Exception) {
                Log.e("Assistant", "Failed to complete voice request: ${err.message}")
                soundPlayer.play(SystemSound.FAILED.key)
            } finally {
                imgFile?.delete()
                discardSpeech()
            }
        }

        gestureInterpreter.setMode(InterpreterMode.NORMAL)
        state = State.IDLE
    }

    private fun handleCancel() {
        when (state) {
            State.VIDEO_CAPTURE -> {
                videoCaptureSession?.stop()
            }
            State.VOICE_RESPONDING -> {
                speechPlayer.stop()
            }

            else -> Unit
        }
    }

    private inline fun runIfPaired(action: () -> Unit) {
        if (backendManager.isPaired()) {
            action()
        } else {
            soundPlayer.play(SystemSound.FAILED.key)
        }
    }

    private fun discardSpeech() {
        speechCapture?.let {
            it.stop()
            it.result.delete()
            speechCapture = null
        }
    }

    override fun onCleared() {
        super.onCleared()

        gestureInterpreter.clear()
        discardSpeech()
    }
}