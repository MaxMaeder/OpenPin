package org.openpin.app.util

import android.media.MediaRecorder
import android.util.Log
import java.io.File

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
