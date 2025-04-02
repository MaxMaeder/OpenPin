package org.openpin.appframework.media.speechplayer

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import org.openpin.appframework.media.AudioSource
import java.io.Closeable

/**
 * A SpeechPlayer that plays audio data (speech) from a byte array.
 * It maintains a single MediaPlayer instance for extreme reliability and low latency.
 */
class SpeechPlayer(private val context: Context) : Closeable, AudioSource {

    private val mediaPlayer: MediaPlayer = MediaPlayer().apply {
        // Set audio attributes tailored for speech.
        val attributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
            .build()
        setAudioAttributes(attributes)
    }

    // Current volume level (0.0f to 1.0f).
    private var currentVolume: Float = 1.0f

    /**
     * Sets the volume for speech playback.
     */
    override fun setVolume(volume: Float) {
        currentVolume = volume.coerceIn(0.0f, 1.0f)
        mediaPlayer.setVolume(currentVolume, currentVolume)
    }

    /**
     * Plays the provided audio data (speech) with low latency.
     * Any ongoing playback is stopped before starting the new audio.
     */
    fun play(audioData: ByteArray) {
        stop()

        // Reset the MediaPlayer to its uninitialized state.
        mediaPlayer.reset()
        // Set the new data source from the byte array.
        mediaPlayer.setDataSource(ByteArrayMediaDataSource(audioData))
        // Synchronously prepare the player to minimize latency.
        mediaPlayer.prepare()
        // Start playback immediately.
        mediaPlayer.start()
    }

    /**
     * Stops the currently playing speech, if any.
     */
    fun stop() {
        if (mediaPlayer.isPlaying) {
            mediaPlayer.stop()
        }
    }

    /**
     * Closes this SpeechPlayer and releases its resources.
     */
    override fun close() {
        stop()
        mediaPlayer.release()
    }
}