package org.openpin.app

import android.Manifest
import android.content.pm.PackageManager
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.util.Log
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import org.json.JSONObject
import org.openpin.app.daemonbridge.GestureEvent
import org.openpin.app.daemonbridge.GestureListener
import org.openpin.app.daemonbridge.GestureType.*
import org.openpin.app.daemonbridge.ProcessRunner
import java.io.File
import java.util.Locale

class MainActivity : ComponentActivity() {
    private lateinit var processRunner: ProcessRunner
    private lateinit var gestureListener: GestureListener
    private lateinit var audioRecorder: AudioRecorder
    private lateinit var textToSpeech: TextToSpeech
    private lateinit var audioFile: File

    val GROQ_API_KEY = "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"

    // Activity Result launcher for requesting RECORD_AUDIO permission.
    private val micPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            initializeApp()
        } else {
            Log.e("MainActivity", "Microphone permission is required")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Remove any UI by setting an empty view.
        setContentView(View(this))

        // Check if microphone permission is already granted.
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            == PackageManager.PERMISSION_GRANTED
        ) {
            initializeApp()
        } else {
            // Request microphone permission using the Activity Result API.
            micPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    private fun initializeApp() {
        // Initialize ProcessRunner and create the auxiliary audio file.
        processRunner = ProcessRunner(this)
        processRunner.init()
        audioFile = processRunner.createAuxFile("audio.m4a")
        audioRecorder = AudioRecorder(audioFile)

        // Initialize GestureListener with separate callbacks.
        gestureListener = GestureListener(this)
        gestureListener.subscribeGesture(1, LONG_PRESS_DOWN, ::onLongPressDown)
        gestureListener.subscribeGesture(1, LONG_PRESS_UP, ::onLongPressUp)

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
        Log.e("MainActivity", "Long press down detected. Starting audio recording.")
        audioRecorder.startRecording()
        playSound(R.raw.record_start)
    }

    private fun onLongPressUp(event: GestureEvent) {
        Log.e("MainActivity", "Long press up detected. Stopping audio recording.")
        audioRecorder.stopRecording()
        playSound(R.raw.record_end)

        lifecycleScope.launch {
            // Get the transcription from the recorded audio.
            val transcription = performTranscription(audioFile)
            Log.e("MainActivity", "Detected transcription: $transcription")

            // Use the transcription as a message for the chat API.
            val chatResponse = performChatRequest(transcription)
            Log.e("MainActivity", "Chat response: $chatResponse")

            // Only speak the chat response.
            textToSpeech.speak(chatResponse, TextToSpeech.QUEUE_FLUSH, null, null)

            // Clean up the auxiliary file.
            processRunner.deleteAuxFile(audioFile)
        }
    }

    /**
     * Runs the transcription process using a ShellProcess.
     */
    private suspend fun performTranscription(audioFile: File): String {
        val shellProcess = processRunner.generateProcess { ShellProcess() }
        val command = """curl "https://api.groq.com/openai/v1/audio/transcriptions" \
-H "Authorization: Bearer $GROQ_API_KEY" \
-F "model=whisper-large-v3-turbo" \
-F "file=@${audioFile.absolutePath}" \
-F "response_format=verbose_json" \
-X POST"""
        shellProcess.command = command

        val resultProcess = shellProcess.execute()
        val output = resultProcess.output
        Log.e("MainActivity", "Transcription result: $output")
        Log.e("MainActivity", "Transcription err: ${resultProcess.error}")
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
-H "Authorization: Bearer $GROQ_API_KEY" \
-d '$payload'"""
        shellProcess.command = command

        val resultProcess = shellProcess.execute()
        val output = resultProcess.output
        Log.e("MainActivity", "Chat response: $output")
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
        // Uncomment if you decide to unregister gestureListener.
        // gestureListener.unregister()
    }
}

/**
 * Simple helper class for audio recording using MediaRecorder.
 */
class AudioRecorder(private val outputFile: File) {
    private var recorder: MediaRecorder? = null

    fun startRecording() {
        try {
            recorder = MediaRecorder().apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setOutputFile(outputFile.absolutePath)
                prepare()
                start()
            }
        } catch (e: Exception) {
            Log.e("AudioRecorder", "Error starting audio recording", e)
        }
    }

    fun stopRecording() {
        try {
            recorder?.apply {
                stop()
                release()
            }
        } catch (e: Exception) {
            Log.e("AudioRecorder", "Error stopping audio recording", e)
        } finally {
            recorder = null
        }
    }
}
