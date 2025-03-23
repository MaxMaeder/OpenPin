package org.openpin.appframework.sensors.microphone

import android.content.Context
import android.media.MediaRecorder
import java.io.File

class MicrophoneManager(
    private val context: Context,
    private val microphoneConfig: MicrophoneConfig = MicrophoneConfig()
) {
    fun recordAudio(
        outputFile: File,
        captureConfig: AudioCaptureConfig? = null
    ): RecordSession {
        val config = captureConfig ?: microphoneConfig.defaultAudioCaptureConfig
        val recorder = MediaRecorder(context)

        recorder.setAudioSource(config.audioSource)
        recorder.setOutputFormat(config.outputFormat)
        recorder.setAudioEncoder(config.audioEncoder)
        recorder.setAudioEncodingBitRate(config.bitRate)
        recorder.setAudioSamplingRate(config.sampleRate)
        recorder.setOutputFile(outputFile.absolutePath)

        outputFile.parentFile?.let { parent ->
            if (!parent.exists()) {
                parent.mkdirs()
            }
        }

        recorder.prepare()
        recorder.start()

        return object : RecordSession {
            private var isStopped = false

            override fun stop() {
                if (!isStopped) {
                    try {
                        recorder.stop()
                    } catch (_: Exception) {
                        // Ignore stop failure if already stopped
                    } finally {
                        recorder.release()
                        isStopped = true
                    }
                }
            }

            override val result: File
                get() = outputFile
        }
    }
}