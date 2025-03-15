package org.openpin.app

import android.Manifest
import android.media.MediaPlayer
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.util.Log
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import org.json.JSONObject
import org.openpin.app.daemonbridge.DaemonReceiver
import org.openpin.app.daemonbridge.GestureEvent
import org.openpin.app.daemonbridge.GestureListener
import org.openpin.app.daemonbridge.GestureType.*
import org.openpin.app.daemonbridge.ProcessRunner
import org.openpin.app.secrets.Grok
import org.openpin.app.util.AudioRecorder
import org.openpin.app.util.ImageCapturer
import java.io.File
import java.util.Locale

class MainActivity : ComponentActivity() {
    private lateinit var processRunner: ProcessRunner
    private lateinit var gestureListener: GestureListener
    private lateinit var audioRecorder: AudioRecorder
    private lateinit var textToSpeech: TextToSpeech
    private lateinit var audioFile: File
    private lateinit var imageCapturer: ImageCapturer

    // Launcher for requesting both RECORD_AUDIO and CAMERA permissions.
    private lateinit var permissionsLauncher: ActivityResultLauncher<Array<String>>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Remove any UI by setting an empty view.
        setContentView(View(this))

        // Request both microphone and camera permissions.
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
        // Initialize ProcessRunner and create the auxiliary audio file.
        processRunner = ProcessRunner(this)
        processRunner.init()

        audioFile = processRunner.createAuxFile("audio.m4a")
        audioRecorder = AudioRecorder(audioFile)

        // Initialize the image capturer.
        imageCapturer = ImageCapturer(this)

        // Initialize GestureListener with separate callbacks.
        gestureListener = GestureListener(this)
        gestureListener.subscribeGesture(1, LONG_PRESS_DOWN, ::onLongPressDown)
        gestureListener.subscribeGesture(1, LONG_PRESS_UP, ::onLongPressUp)
        // Add a TAP gesture listener.
        gestureListener.subscribeGesture(1, TAP, ::onTap)

        // Initialize Android's TextToSpeech.
        textToSpeech = TextToSpeech(this) { status ->
            if (status != TextToSpeech.ERROR) {
                textToSpeech.language = Locale.getDefault()
            } else {
                Log.e("MainActivity", "Error initializing TTS")
            }
        }
    }

    // Helper function to play a sound.
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

        lifecycleScope.launch {
            // Get the transcription from the recorded audio.
            val transcription = performTranscription(audioFile)

            // Use the transcription as a message for the chat API.
            val chatResponse = performChatRequest(transcription)

            // Only speak the chat response.
            textToSpeech.speak(chatResponse, TextToSpeech.QUEUE_FLUSH, null, null)
        }
    }

    /**
     * Tap gesture callback.
     * If TTS is speaking, it stops it; otherwise, it silently captures an image.
     */
    private fun onTap(event: GestureEvent) {
        if (textToSpeech.isSpeaking) {
            Log.i("MainActivity", "Tap gesture detected while TTS is speaking. Stopping TTS.")
            textToSpeech.stop()
        } else {
            Log.i("MainActivity", "Tap gesture detected. Capturing image.")
            val imageFile = processRunner.createAuxFile("image.jpeg")
            playSound(R.raw.shutter)
            imageCapturer.captureImage(imageFile) { success ->
                if (success) {
                    Log.i("MainActivity", "Image capture successful.")
                } else {
                    Log.e("MainActivity", "Image capture failed.")
                }
            }
        }
    }

    /**
     * Runs the transcription process using a ShellProcess.
     */
    private suspend fun performTranscription(audioFile: File): String {
        val shellProcess = processRunner.generateProcess { ShellProcess() }
        val command = """curl "https://api.groq.com/openai/v1/audio/transcriptions" \
-H "Authorization: Bearer ${Grok.GROK_KEY}" \
-F "model=whisper-large-v3-turbo" \
-F "file=@${audioFile.absolutePath}" \
-F "response_format=verbose_json" \
-X POST"""
        shellProcess.command = command

        val resultProcess = shellProcess.execute()
        if (resultProcess.error.isNotBlank()) {
            Log.e("MainActivity", "Transcription err: ${resultProcess.error}")
            resultProcess.release()
            return "No text recognized"
        }

        val output = resultProcess.output
        Log.i("MainActivity", "Transcription result: $output")
        resultProcess.release()

        return try {
            val json = JSONObject(output)
            json.optString("text", "No text recognized")
        } catch (e: Exception) {
            Log.e("MainActivity", "Error parsing transcription result", e)
            "No text recognized"
        }
    }

    /**
     * Sends the detected message to the chat completions API and returns the response.
     */
    private suspend fun performChatRequest(message: String): String {
        val shellProcess = processRunner.generateProcess { ShellProcess() }

        // Build the JSON payload using the detected message.
        val payload = """
            {
              "messages": [
                {
                  "role": "user",
                  "content": "$message"
                }
              ],
              "model": "llama-3.1-8b-instant",
              "temperature": 1,
              "max_completion_tokens": 1024,
              "top_p": 1,
              "stream": false,
              "stop": null
            }
        """.trimIndent()

        val command = """curl "https://api.groq.com/openai/v1/chat/completions" \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Bearer ${Grok.GROK_KEY}" \
-d '$payload'"""
        shellProcess.command = command

        val resultProcess = shellProcess.execute()
        val output = resultProcess.output
        Log.i("MainActivity", "Chat response: $output")
        resultProcess.release()

        return try {
            val json = JSONObject(output)
            val choices = json.getJSONArray("choices")
            if (choices.length() > 0) {
                val firstChoice = choices.getJSONObject(0)
                val messageObj = firstChoice.getJSONObject("message")
                messageObj.getString("content")
            } else {
                "No response"
            }
        } catch (e: Exception) {
            Log.e("MainActivity", "Error parsing chat response", e)
            "No response"
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        textToSpeech.shutdown()
        imageCapturer.release() // Release camera resources if needed.
        DaemonReceiver.unregister(this)
    }
}
