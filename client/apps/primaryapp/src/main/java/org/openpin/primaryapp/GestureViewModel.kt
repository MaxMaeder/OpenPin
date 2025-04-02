package org.openpin.primaryapp

import SoundPlayer
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.openpin.appframework.media.speechplayer.SpeechPlayer
import org.openpin.appframework.daemonbridge.gesture.GestureHandler
import org.openpin.appframework.daemonbridge.gesture.GestureSubscription
import org.openpin.appframework.daemonbridge.gesture.GestureType
import org.openpin.appframework.daemonbridge.process.ProcessHandler
import org.openpin.appframework.media.soundplayer.SystemSound
import org.openpin.appframework.sensors.camera.CameraManager
import org.openpin.appframework.sensors.camera.ImageCaptureConfig
import org.openpin.appframework.sensors.camera.PostProcessConfig
import org.openpin.appframework.sensors.microphone.MicrophoneManager
import org.openpin.appframework.sensors.microphone.RecordSession
import org.openpin.appframework.media.soundplayer.withLoadingSounds
import org.openpin.primaryapp.backend.BackendManager
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

    private val subscriptions = mutableListOf<GestureSubscription>()

    private var isTranslating = false;

    private var imgFile: File? = null
    private var speechCapture: RecordSession? = null

    fun addListeners() {
        subscriptions += gestureHandler.subscribeGesture(1, GestureType.TAP) {
            viewModelScope.launch {
                handleTap()
            }
        }
        subscriptions += gestureHandler.subscribeGesture(1, GestureType.LONG_PRESS_DOWN) {
            handleLongPressDown(1)
        }
        subscriptions += gestureHandler.subscribeGesture(2, GestureType.LONG_PRESS_DOWN) {
            handleLongPressDown(2)
        }
        subscriptions += gestureHandler.subscribeGesture(1, GestureType.LONG_PRESS_UP) {
            viewModelScope.launch {
                handleLongPressUp()
            }
        }
        subscriptions += gestureHandler.subscribeGesture(2, GestureType.LONG_PRESS_UP) {
            viewModelScope.launch {
                handleLongPressUp()
            }
        }
    }

    private suspend fun handleTap() {
        imgFile?.delete()

        imgFile = processHandler.createTempFile("jpg")
        cameraManager.captureImage(imgFile!!, visionCameraConfig)

        soundPlayer.play(SystemSound.SHUTTER.key)
    }

    private fun handleLongPressDown(fingers: Int) {
        discardSpeech()
        isTranslating = fingers == 2

        soundPlayer.play(SystemSound.RECORD_START.key)

        val speechFile = processHandler.createTempFile("ogg")
        speechCapture = microphoneManager.recordAudio(speechFile)
    }

    private suspend fun handleLongPressUp() {
        speechCapture?.stop()
        soundPlayer.play(SystemSound.RECORD_END.key)

        if (isTranslating) {
            discardImg()
        }

        val endpoint = if (isTranslating) "translate" else "handle"

        speechCapture?.let { capture ->
            val res = withLoadingSounds(soundPlayer) {
                backendManager.sendVoiceRequest(endpoint, capture.result, imgFile)
            }
            res?.let { speechPlayer.play(it) }

            discardImg()
            discardSpeech()
        }
    }

    private fun discardImg() {
        imgFile?.let {
            it.delete()
            imgFile = null
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

        subscriptions.forEach { gestureHandler.unsubscribe(it) }
        subscriptions.clear()

        discardImg()
        discardSpeech()
    }
}