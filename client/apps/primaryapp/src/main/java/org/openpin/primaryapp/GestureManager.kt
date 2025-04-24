package org.openpin.primaryapp

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import org.openpin.primaryapp.gestureinterpreter.GestureInterpreter
import org.openpin.appframework.media.soundplayer.SoundPlayer
import android.net.Uri
import android.util.Log
import androidx.annotation.OptIn
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.ProgressiveMediaSource
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.openpin.appframework.media.speechplayer.SpeechPlayer
import org.openpin.appframework.daemonbridge.gesture.GestureHandler
import org.openpin.appframework.daemonbridge.process.ProcessHandler
import org.openpin.appframework.daemonbridge.streaming.ChunkDataSource
import org.openpin.appframework.daemonbridge.streaming.FileChunkChannel
import org.openpin.appframework.daemonbridge.streaming.StreamProcess
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
import java.io.InputStream
import kotlin.concurrent.thread

class GestureManager(
    private val context: Context,
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

    private var settingsToggled = false
    private var onSettingsToggle: ((Boolean) -> Unit)? = null

    private enum class State {
        IDLE,
        PHOTO_CAPTURE,
        VIDEO_CAPTURE,
        VOICE_INPUT,
        VOICE_THINKING,
        VOICE_RESPONDING,
        SETTINGS_TOGGLE
    }
    private var state = State.IDLE

    class CaptureException(s: String) : Exception(s)

    private val gestureInterpreter = GestureInterpreter(
        gestureHandler = gestureHandler,
        onCapturePhoto = {
            Log.w("org.openpin.primaryapp.gestureinterpreter.GestureInterpreter", "onTakePhoto")
            viewModelScope.launch {
                handleCapturePhoto()
            }
        },
        onCaptureVideoStart = {
            Log.w("org.openpin.primaryapp.gestureinterpreter.GestureInterpreter", "onTakeVideoStart")
            viewModelScope.launch {
                handleCaptureVideo()
            }
        },
        onAssistantStartAction = { useVision ->
            Log.w("org.openpin.primaryapp.gestureinterpreter.GestureInterpreter", "onStartAssistantVoiceInput: $useVision")
            viewModelScope.launch {
                handleStartVoiceInput(isTranslating = false)
            }
        },
        onAssistantStopAction = { useVision ->
            Log.w("org.openpin.primaryapp.gestureinterpreter.GestureInterpreter", "onStopAssistantVoiceInput: $useVision")
            viewModelScope.launch {
                handleEndVoiceInput(isTranslating = false, useVision = useVision)
            }
        },
        onTranslateStartAction = {
            Log.w("org.openpin.primaryapp.gestureinterpreter.GestureInterpreter", "onStartTranslateVoiceInput")
            viewModelScope.launch {
                handleStartVoiceInput(isTranslating = true)
            }
        },
        onTranslateStopAction = {
            Log.w("org.openpin.primaryapp.gestureinterpreter.GestureInterpreter", "onStopTranslateVoiceInput")
            viewModelScope.launch {
                handleEndVoiceInput(isTranslating = true, useVision = false)
            }
        },
        onCancelAction = {
            Log.w("org.openpin.primaryapp.gestureinterpreter.GestureInterpreter", "onCancelAction")
            viewModelScope.launch {
                handleCancel()
            }
        },
        scope = viewModelScope
    )

    fun addListeners() {
        gestureInterpreter.subscribeGestures()
    }

    fun enableSettingsToggle(onToggle: (Boolean) -> Unit) {
        gestureInterpreter.setMode(InterpreterMode.CANCELABLE)
        state = State.SETTINGS_TOGGLE

        settingsToggled = false
        onSettingsToggle = onToggle
    }

    fun disableSettingsToggle() {
        gestureInterpreter.setMode(InterpreterMode.NORMAL)
        state = State.IDLE
        onSettingsToggle = null
    }

    private suspend fun handleCapturePhoto() {
        runIfPaired {
            gestureInterpreter.setMode(InterpreterMode.DISABLED)
            state = State.PHOTO_CAPTURE

            val imgFile = processHandler.createTempFile("jpeg")
            try {
                // Capture image
                val result = cameraManager.captureImage(imgFile)

                when (result) {
                    is CaptureResult.Success -> {
                        soundPlayer.play(SystemSound.SHUTTER.key)
                    }
                    else -> {
                        soundPlayer.play(SystemSound.CAPTURE_FAILED.key)
                        throw CaptureException("Image capture failed")
                    }
                }

                // Upload image
                backendManager.sendUploadRequest(imgFile)

            } catch (err: Exception) {
                Log.e("Assistant", "Failed to complete image capture: ${err.message}")

                if (err !is CaptureException) {
                    soundPlayer.play(SystemSound.FAILED.key)
                }
            } finally {
                imgFile.delete()

                gestureInterpreter.setMode(InterpreterMode.NORMAL)
                state = State.IDLE
            }
        }
    }

    private suspend fun handleCaptureVideo() {
        runIfPaired {
            gestureInterpreter.setMode(InterpreterMode.CANCELABLE)
            state = State.VIDEO_CAPTURE

            soundPlayer.play(SystemSound.VIDEO_START.key)

            val videoFile = processHandler.createTempFile("mp4")
            try {
                // Start video capture with a 15-second maximum
                videoCaptureSession = cameraManager.captureVideo(
                    outputFile = videoFile,
                    duration = 15000L,
                    captureConfig = null
                )

                // Wait for the video capture to complete (even if stopped early)
                val result = videoCaptureSession?.waitForResult()

                when (result) {
                    is CaptureResult.Success -> {
                        soundPlayer.play(SystemSound.VIDEO_END.key)
                    }
                    else -> {
                        soundPlayer.play(SystemSound.CAPTURE_FAILED.key)
                        throw CaptureException("Image capture failed")
                    }
                }

                // Upload video
                backendManager.sendUploadRequest(videoFile)

            } catch (err: Exception) {
                Log.e("Assistant", "Failed to complete video capture: ${err.message}")

                if (err !is CaptureException) {
                    soundPlayer.play(SystemSound.FAILED.key)
                }
            } finally {
                videoCaptureSession = null
                videoFile.delete()

                gestureInterpreter.setMode(InterpreterMode.NORMAL)
                state = State.IDLE
            }
        }
    }

    @OptIn(UnstableApi::class)
    private suspend fun testPodcast() {
        val streamDir = processHandler.fileSystem.get("/podcast_stream")
        File(streamDir, "pacing.txt").writeText("0\n")

        // 1) start native streamer (returns instantly, stores PID)
        val streamProc = StreamProcess(
            url = "http://192.168.1.192:8080/api/dev/podcast",
            outDir = streamDir.path,
            //useUdp = false          // flip to true if you really need UDP
        )
        processHandler.execute(streamProc)
        Log.e("OUT", streamProc.output)
        Log.e("ERR", streamProc.error)

        // 2) build player
//        val channel = FileChunkChannel(streamDir)
//        val mediaSource = ProgressiveMediaSource.Factory { ChunkDataSource(channel) }
//            .createMediaSource(MediaItem.fromUri("file://dummy"))   // URI is ignored
//        val player = ExoPlayer.Builder(context).build().apply {
//            setMediaSource(mediaSource)
//            prepare()
//        }
//
//        // 3) play
//        player.play()

        //val streamDir = processHandler.fileSystem.get("/tmp/podcast_stream")
        // ensure pacing.txt starts at 0


        val channel = FileChunkChannel(streamDir)
        val dataSource = ChunkDataSource(channel)
        val mediaSource = ProgressiveMediaSource.Factory { dataSource }
            .createMediaSource(MediaItem.fromUri("file://dummy"))
        val player = ExoPlayer.Builder(context).build().apply {
            setMediaSource(mediaSource); prepare()
        }

        // now we’ve signaled “I’m ready for chunk 0,1,2”:
//        processHandler.execute(StreamProcess("http://…", streamDir.path))
        player.play()

//
//        val dir = processHandler.fileSystem.get("/tmp/podcast_stream")
//        playRawPcm(dir, sampleRate = 44100, channels = 2)
    }

    fun playRawPcm(
        streamDir: File,
        sampleRate: Int,
        channels: Int,
        bitDepth: Int = 16
    ) {

        Log.e("PLAYER", "PLAYING")
        // 1) Configure the AudioTrack
        val encoding = if (bitDepth == 16)
            AudioFormat.ENCODING_PCM_16BIT else AudioFormat.ENCODING_PCM_8BIT

        val channelMask = if (channels == 1)
            AudioFormat.CHANNEL_OUT_MONO else AudioFormat.CHANNEL_OUT_STEREO

        val audioFormat = AudioFormat.Builder()
            .setEncoding(encoding)
            .setSampleRate(sampleRate)
            .setChannelMask(channelMask)
            .build()

        val minBuf = AudioTrack.getMinBufferSize(
            sampleRate, channelMask, encoding
        )

        val track = AudioTrack.Builder()
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build()
            )
            .setAudioFormat(audioFormat)
            .setBufferSizeInBytes(minBuf)
            .setTransferMode(AudioTrack.MODE_STREAM)
            .build()

        track.play()

        // 2) Feed it your FileChunkChannel
        val channel = FileChunkChannel(streamDir)
        thread(start = true) {
            for (stream: InputStream in channel.readerSequence()) {
                val buf = ByteArray(4096)
                var read: Int
                while (stream.read(buf).also { read = it } > 0) {
                    track.write(buf, 0, read)
                }
                stream.close()
            }
            track.stop()
            track.release()
        }
    }

    private suspend fun handleStartVoiceInput(isTranslating: Boolean) {
        testPodcast()
        return

//        runIfPaired {
//            gestureInterpreter.setMode(InterpreterMode.DISABLED)
//            state = State.VOICE_INPUT
//
//            voiceInputStart = System.currentTimeMillis()
//
//            if (isTranslating) {
//                soundPlayer.play(SystemSound.TRANSLATE_START.key)
//            } else {
//                soundPlayer.play(SystemSound.ASSISTANT_START.key)
//            }
//
//            val speechFile = processHandler.createTempFile("ogg")
//            speechCapture = microphoneManager.recordAudio(speechFile)
//        }
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
            State.SETTINGS_TOGGLE -> {
                settingsToggled = !settingsToggled
                onSettingsToggle?.invoke(settingsToggled)
            }

            else -> Unit
        }
    }

    private inline fun runIfPaired(action: () -> Unit) {
        if (backendManager.isPaired) {
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