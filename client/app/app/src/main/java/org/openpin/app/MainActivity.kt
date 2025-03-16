package org.openpin.app

import android.Manifest
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Bundle
import android.util.Log
import android.util.Size
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.openpin.app.backend.BackendHandler
import org.openpin.app.daemonbridge.DaemonReceiver
import org.openpin.app.daemonbridge.GestureEvent
import org.openpin.app.daemonbridge.GestureListener
import org.openpin.app.daemonbridge.GestureType.LONG_PRESS_DOWN
import org.openpin.app.daemonbridge.GestureType.LONG_PRESS_UP
import org.openpin.app.daemonbridge.GestureType.TAP
import org.openpin.app.daemonbridge.ProcessRunner
import org.openpin.app.util.AudioRecorder
import org.openpin.app.util.DeviceIdentity
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

    // Flag to disable touch events while backend request is running.
    private var isRequestInProgress: Boolean = false

    // Launcher for requesting RECORD_AUDIO and CAMERA permissions.
    private lateinit var permissionsLauncher: ActivityResultLauncher<Array<String>>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(View(this))

        DeviceIdentity.initialize(this)

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

        val audioManager = getSystemService(AUDIO_SERVICE) as AudioManager
        audioManager.setStreamVolume(
            AudioManager.STREAM_MUSIC,
            audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC),
            0
        )
    }

    // Helper function to play a sound effect.
    private fun playSound(soundResId: Int) {
        MediaPlayer.create(this, soundResId).apply {
            setOnCompletionListener { release() }
            start()
        }
    }

    private fun onLongPressDown(event: GestureEvent) {
        if (isRequestInProgress) return

        if (mediaPlayer?.isPlaying == true) {
            Log.i("MainActivity", "Long press down detected while audio is playing. Stopping playback.")
            stopAudioPlayback()
            return
        }

        Log.i("MainActivity", "Long press down detected. Starting audio recording.")
        playSound(R.raw.record_start)
        audioRecorder.startRecording()
    }

    private fun onLongPressUp(event: GestureEvent) {
        if (isRequestInProgress) return

        Log.i("MainActivity", "Long press up detected. Stopping audio recording.")
        audioRecorder.stopRecording()
        playSound(R.raw.record_end)

        lifecycleScope.launch {
            // List of loading sound resources.
            val loadingSounds = listOf(
                R.raw.loading1,
                R.raw.loading2,
                R.raw.loading3,
                R.raw.loading4,
                R.raw.loading5
            )

            // Launch a coroutine to play the loading sounds sequentially.
            val loadingJob = launch {
                var index = 0
                delay(2000L)
                while (isActive) {
                    playSound(loadingSounds[index])
                    index = (index + 1) % loadingSounds.size
                    delay(2000L)
                }
            }

            try {
                isRequestInProgress = true
                // Execute the backend request while the loading sound is playing.
                val mp3ResponseFile = backendHandler.sendRequest(audioFile, capturedImageFile)
                loadingJob.cancel()
                if (mp3ResponseFile != null) {
                    playAudio(mp3ResponseFile)
                }
                // Clear the captured image file after processing.
                if (capturedImageFile != null) {
                    processRunner.deleteAuxFile(capturedImageFile!!)
                    capturedImageFile = null
                }
            } finally {
                isRequestInProgress = false
            }
        }
    }

    /**
     * Tap gesture callback.
     * If an audio response is playing, stop playback; otherwise, capture an image.
     */
    private fun onTap(event: GestureEvent) {
        if (isRequestInProgress) return

        if (mediaPlayer?.isPlaying == true) {
            Log.i("MainActivity", "Tap detected while audio is playing. Stopping playback.")
            stopAudioPlayback()
        } else {
            Log.i("MainActivity", "Tap detected. Capturing image.")
            val imageFile = processRunner.createAuxFile("image.jpeg")
            playSound(R.raw.shutter)
            imageCapturer.captureImage(
                cameraId = "0",
                resolution = Size(1280, 720),
                jpegQuality = 40,
                convergeDelayMs = 500L,
                outputFile = imageFile
            ) { success ->
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
        gestureListener.unsubscribeAll()
        DaemonReceiver.unregister(this)
    }
}
