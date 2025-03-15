package org.openpin.app

import android.Manifest
import android.media.MediaPlayer
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import org.openpin.app.backend.BackendHandler
import org.openpin.app.daemonbridge.DaemonReceiver
import org.openpin.app.daemonbridge.GestureEvent
import org.openpin.app.daemonbridge.GestureListener
import org.openpin.app.daemonbridge.GestureType.*
import org.openpin.app.daemonbridge.ProcessRunner
import org.openpin.app.util.AudioRecorder
import org.openpin.app.util.ImageCapturer
import java.io.File

class MainActivity : ComponentActivity() {
    private lateinit var processRunner: ProcessRunner
    private lateinit var gestureListener: GestureListener
    private lateinit var audioRecorder: AudioRecorder
    private lateinit var backendHandler: BackendHandler
    private lateinit var audioFile: File
    private lateinit var imageCapturer: ImageCapturer

    // Holds the captured image file if one exists.
    private var capturedImageFile: File? = null

    // MediaPlayer instance for audio playback.
    private var mediaPlayer: MediaPlayer? = null

    // Launcher for requesting RECORD_AUDIO and CAMERA permissions.
    private lateinit var permissionsLauncher: ActivityResultLauncher<Array<String>>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(View(this))
        permissionsLauncher = registerForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions()
        ) { permissions ->
            val micGranted = permissions[Manifest.permission.RECORD_AUDIO] ?: false
            val cameraGranted = permissions[Manifest.permission.CAMERA] ?: false
            if (micGranted && cameraGranted) {
                initializeApp()
            } else {
                Log.e("MainActivity", "Required permissions not granted: Mic: $micGranted, Camera: $cameraGranted")
            }
        }
        permissionsLauncher.launch(arrayOf(Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA))
    }

    private fun initializeApp() {
        processRunner = ProcessRunner(this)
        processRunner.init()

        audioFile = processRunner.createAuxFile("audio.m4a")
        audioRecorder = AudioRecorder(audioFile)
        imageCapturer = ImageCapturer(this)
        backendHandler = BackendHandler(processRunner)

        gestureListener = GestureListener(this)
        gestureListener.subscribeGesture(1, LONG_PRESS_DOWN, ::onLongPressDown)
        gestureListener.subscribeGesture(1, LONG_PRESS_UP, ::onLongPressUp)
        gestureListener.subscribeGesture(1, TAP, ::onTap)
    }

    // Helper function to play a sound effect.
    private fun playSound(soundResId: Int) {
        MediaPlayer.create(this, soundResId).apply {
            setOnCompletionListener { release() }
            start()
        }
    }

    private fun onLongPressDown(event: GestureEvent) {
        Log.i("MainActivity", "Long press down detected. Starting audio recording.")
        playSound(R.raw.record_start)
        audioRecorder.startRecording()
    }

    private fun onLongPressUp(event: GestureEvent) {
        Log.i("MainActivity", "Long press up detected. Stopping audio recording.")
        audioRecorder.stopRecording()
        playSound(R.raw.record_end)

        // Instead of transcription and chat request, send the combined request.
        lifecycleScope.launch {
            val mp3ResponseFile = backendHandler.sendRequest(audioFile, capturedImageFile)
            if (mp3ResponseFile != null) {
                playAudio(mp3ResponseFile)
            }
            // Clear the captured image file after processing.
            capturedImageFile = null
        }
    }

    /**
     * Tap gesture callback.
     * If an audio response is playing, stop playback; otherwise, capture an image.
     */
    private fun onTap(event: GestureEvent) {
        if (mediaPlayer?.isPlaying == true) {
            Log.i("MainActivity", "Tap detected while audio is playing. Stopping playback.")
            stopAudioPlayback()
        } else {
            Log.i("MainActivity", "Tap detected. Capturing image.")
            val imageFile = processRunner.createAuxFile("image.jpeg")
            playSound(R.raw.shutter)
            imageCapturer.captureImage(imageFile) { success ->
                if (success) {
                    Log.i("MainActivity", "Image capture successful.")
                    capturedImageFile = imageFile
                } else {
                    Log.e("MainActivity", "Image capture failed.")
                }
            }
        }
    }

    /**
     * Plays the given audio file using Android's MediaPlayer.
     */
    private fun playAudio(audioFile: File) {
        mediaPlayer?.release() // Release any existing player.
        mediaPlayer = MediaPlayer().apply {
            setDataSource(audioFile.absolutePath)
            prepare()
            start()
        }
    }

    /**
     * Stops any ongoing audio playback.
     */
    private fun stopAudioPlayback() {
        mediaPlayer?.let { mp ->
            if (mp.isPlaying) {
                mp.stop()
            }
            mp.release()
        }
        mediaPlayer = null
    }

    override fun onDestroy() {
        super.onDestroy()
        stopAudioPlayback()
        imageCapturer.release()
        DaemonReceiver.unregister(this)
    }
}
