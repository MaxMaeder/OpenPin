package org.openpin.appframework.sensors.microphone

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.media.MediaRecorder
import android.net.Uri
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CompletableDeferred
import org.openpin.appframework.sensors.CaptureResult
import org.openpin.appframework.sensors.CaptureSession
import java.io.File

class MicrophoneManager(
    private val context: Context,
    private val microphoneConfig: MicrophoneConfig = MicrophoneConfig()
) {
    private val mainHandler = Handler(Looper.getMainLooper())
    private var isInitialized = false

    fun initialize() {
        if (ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.RECORD_AUDIO
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            throw IllegalStateException("Microphone permission not granted")
        }
        isInitialized = true
    }

    fun captureAudio(
        outputFile: File,
        duration: Long? = null,
        captureConfig: AudioCaptureConfig? = null
    ): CaptureSession<Uri> {
        ensureInitialized() // Ensure initialization before starting capture
        val config = captureConfig ?: microphoneConfig.defaultAudioCaptureConfig
        val recorder = MediaRecorder(context)
        val deferred = CompletableDeferred<CaptureResult<Uri>>()

        try {
            recorder.setAudioSource(config.audioSource)
            recorder.setOutputFormat(config.outputFormat)
            recorder.setAudioEncoder(config.audioEncoder)
            recorder.setAudioEncodingBitRate(config.bitRate)
            recorder.setAudioSamplingRate(config.sampleRate)
            recorder.setOutputFile(outputFile.absolutePath)

            recorder.prepare()
            recorder.start()
        } catch (e: Exception) {
            recorder.release()
            deferred.complete(CaptureResult.Failure(e))
            return CaptureSessionImpl(deferred) {}
        }

        // Schedule auto-stop if a duration is specified
        duration?.let {
            mainHandler.postDelayed({
                stopRecorderSafely(recorder, outputFile, deferred)
            }, it)
        }

        return CaptureSessionImpl(deferred) {
            stopRecorderSafely(recorder, outputFile, deferred)
        }
    }

    private fun stopRecorderSafely(
        recorder: MediaRecorder,
        outputFile: File,
        deferred: CompletableDeferred<CaptureResult<Uri>>
    ) {
        try {
            recorder.stop()
            recorder.release()
            if (!deferred.isCompleted) {
                deferred.complete(CaptureResult.Success(Uri.fromFile(outputFile)))
            }
        } catch (e: Exception) {
            recorder.release()
            if (!deferred.isCompleted) {
                deferred.complete(CaptureResult.Failure(e))
            }
        }
    }

    // Helper to ensure that initialize() has been called.
    private fun ensureInitialized() {
        if (!isInitialized) {
            throw IllegalStateException("MicrophoneManager not initialized. Call initialize() first.")
        }
    }
}

/**
 * Internal implementation of CaptureSession.
 */
private class CaptureSessionImpl<T>(
    private val deferred: CompletableDeferred<CaptureResult<T>>,
    private val stopCallback: () -> Unit
) : CaptureSession<T> {
    override suspend fun waitForResult(): CaptureResult<T> = deferred.await()
    override fun stop() = stopCallback()
}
