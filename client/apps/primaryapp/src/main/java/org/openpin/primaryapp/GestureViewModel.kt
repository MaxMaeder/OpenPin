package org.openpin.primaryapp

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.openpin.appframework.audioplayer.AudioPlayer
import org.openpin.appframework.audioplayer.AudioType
import org.openpin.appframework.daemonbridge.gesture.GestureHandler
import org.openpin.appframework.daemonbridge.gesture.GestureSubscription
import org.openpin.appframework.daemonbridge.gesture.GestureType
import org.openpin.appframework.daemonbridge.process.ProcessHandler
import org.openpin.appframework.sensors.camera.CameraManager
import org.openpin.appframework.sensors.microphone.MicrophoneManager
import org.openpin.appframework.sensors.microphone.RecordSession
import org.openpin.appframework.utils.withLoadingSounds
import org.openpin.primaryapp.backend.BackendManager
import java.io.File

class GestureViewModel(
    private val processHandler: ProcessHandler,
    private val gestureHandler: GestureHandler,
    private val cameraManager: CameraManager,
    private val microphoneManager: MicrophoneManager,
    private val audioPlayer: AudioPlayer,
    private val backendManager: BackendManager
) : ViewModel() {
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
        cameraManager.captureImage(imgFile!!)

        audioPlayer.play(R.raw.shutter, AudioType.SOUND)
    }

    private fun handleLongPressDown(fingers: Int) {
        discardSpeech()
        isTranslating = fingers == 2

        audioPlayer.play(R.raw.record_start, AudioType.SOUND)

        val speechFile = processHandler.createTempFile("ogg")
        speechCapture = microphoneManager.recordAudio(speechFile)
    }

    private suspend fun handleLongPressUp() {
        speechCapture?.stop()
        audioPlayer.play(R.raw.record_end, AudioType.SOUND)

        if (isTranslating) {
            discardImg()
        }

        val endpoint = if (isTranslating) "translate" else "handle"

        speechCapture?.let { capture ->
            val res = withLoadingSounds(audioPlayer) {
                backendManager.sendVoiceRequest(endpoint, capture.result, imgFile)
            }
            res?.let { audioPlayer.play(it, AudioType.SPEECH) }

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