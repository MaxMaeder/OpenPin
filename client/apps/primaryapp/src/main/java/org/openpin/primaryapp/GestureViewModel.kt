package org.openpin.primaryapp

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.json.JSONObject
import org.openpin.appframework.audioplayer.AudioPlayer
import org.openpin.appframework.audioplayer.AudioType
import org.openpin.appframework.daemonbridge.gesture.GestureHandler
import org.openpin.appframework.daemonbridge.gesture.GestureSubscription
import org.openpin.appframework.daemonbridge.gesture.GestureType
import org.openpin.appframework.daemonbridge.process.ProcessHandler
import org.openpin.appframework.daemonbridge.process.RequestProcess
import org.openpin.appframework.sensors.camera.CameraManager
import org.openpin.appframework.sensors.microphone.MicrophoneManager
import org.openpin.appframework.sensors.microphone.RecordSession
import java.io.File

class GestureViewModel(
    private val processHandler: ProcessHandler,
    private val gestureHandler: GestureHandler,
    private val cameraManager: CameraManager,
    private val microphoneManager: MicrophoneManager,
    private val audioPlayer: AudioPlayer
) : ViewModel() {
    private val subscriptions = mutableListOf<GestureSubscription>()

    private var imgFile: File? = null
    private var speechCapture: RecordSession? = null

    fun addListeners() {
        subscriptions += gestureHandler.subscribeGesture(1, GestureType.TAP) {
            viewModelScope.launch {
                handleTap()
            }
        }
        subscriptions += gestureHandler.subscribeGesture(1, GestureType.LONG_PRESS_DOWN) {
            handleLongPressDown()
        }
        subscriptions += gestureHandler.subscribeGesture(1, GestureType.LONG_PRESS_UP) {
            viewModelScope.launch {
                handleLongPressUp()
            }
        }
    }

    private suspend fun handleTap() {
        Log.e("HI", "There")

        imgFile?.delete()

        imgFile = processHandler.createTempFile("jpg")
        cameraManager.captureImage(imgFile!!)

        audioPlayer.play(R.raw.shutter, AudioType.SOUND)
    }

    private fun handleLongPressDown() {
        speechCapture?.apply {
            stop()
            result.delete()
        }

        audioPlayer.play(R.raw.record_start, AudioType.SOUND)

        val speechFile = processHandler.createTempFile("m4a")
        speechCapture = microphoneManager.recordAudio(speechFile)
    }

    private suspend fun handleLongPressUp() {
        speechCapture?.stop()

        audioPlayer.play(R.raw.record_end, AudioType.SOUND)

        val res = sendRequest(speechCapture!!.result, imgFile)
        res?.let { audioPlayer.play(it, AudioType.SPEECH) }
    }

    suspend fun sendRequest(audioFile: File, imageFile: File?): File? {
        // Build JSON header payload.
        val headerJson = JSONObject().apply {
            put("audioSize", audioFile.length())
            put("audioFormat", "m4a")
            put("imageSize", imageFile?.length() ?: 0)
            put("deviceId", "0")
            put("audioBitrate", "64k")
        }

        // Prepare the multipart binary request body.
        val headerString = headerJson.toString() + "\u0000"
        val headerBytes = headerString.toByteArray(Charsets.UTF_8)
        val paddedHeader = ByteArray(512)
        val copyLength = headerBytes.size.coerceAtMost(512)
        System.arraycopy(headerBytes, 0, paddedHeader, 0, copyLength)

        // Compose binary payload in a single file.
        val requestFile = processHandler.createTempFile("request.dat")
        requestFile.outputStream().use { os ->
            os.write(paddedHeader)
            imageFile?.inputStream()?.use { it.copyTo(os) }
            audioFile.inputStream().use { it.copyTo(os) }
        }

        // Prepare output file for response.
        val responseFile = processHandler.createTempFile("response.raw")

        // Build the new RequestProcess (replaces the manual ShellProcess)
        val requestProcess = RequestProcess(
            url = "https://openpin.center/api/dev/handle",
            method = "POST",
            payloadType = RequestProcess.PayloadType.BINARY,
            payload = "@${requestFile.absolutePath}",
            outputFile = responseFile.absolutePath
        )

        val resultProcess = processHandler.execute(requestProcess)
        if (resultProcess.error.isNotBlank()) {
            Log.e("BackendHandler", "Error sending request: ${resultProcess.error}")
            //processHandler.release(resultProcess)
            return null
        }
        //processHandler.release(resultProcess)

        // Strip 512-byte header and return audio portion.
        val mp3ResponseFile = processHandler.createTempFile("response.mp3")
        responseFile.inputStream().use { input ->
            mp3ResponseFile.outputStream().use { output ->
                input.skip(512)
                input.copyTo(output)
            }
        }

        return mp3ResponseFile
    }



    override fun onCleared() {
        super.onCleared()

        subscriptions.forEach { gestureHandler.unsubscribe(it) }
        subscriptions.clear()

        imgFile?.let {
            it.delete()
            imgFile = null
        }

        speechCapture?.let {
            it.stop()
            it.result.delete()
            speechCapture = null
        }
    }
}