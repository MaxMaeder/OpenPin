package org.openpin.appframework.media.speechplayer

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import kotlinx.coroutines.suspendCancellableCoroutine
import org.openpin.appframework.media.AudioSource
import java.io.Closeable
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * A SpeechPlayer that plays audio data (speech) from a byte array.
 * It maintains a single MediaPlayer instance for extreme reliability and low latency.
 */
class SpeechPlayer(private val context: Context) : Closeable, AudioSource {

    private val mediaPlayer: MediaPlayer = MediaPlayer().apply {
        val attributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
            .build()
        setAudioAttributes(attributes)
    }

    // Current volume level (0.0f to 1.0f).
    private var currentVolume: Float = 1.0f

    // Holds the current waiting continuation, if any.
    @Volatile
    private var playbackContinuation: kotlinx.coroutines.CancellableContinuation<Unit>? = null

    /**
     * Sets the volume for speech playback.
     */
    override fun setVolume(volume: Float) {
        currentVolume = volume.coerceIn(0.0f, 1.0f)
        mediaPlayer.setVolume(currentVolume, currentVolume)
    }

    /**
     * Starts playback of the provided audio data.
     */
    fun play(audioData: ByteArray) {
        mediaPlayer.reset()
        mediaPlayer.setDataSource(ByteArrayMediaDataSource(audioData))
        mediaPlayer.prepare()
        mediaPlayer.setVolume(currentVolume, currentVolume)
        mediaPlayer.start()
    }

    /**
     * Suspends until playback completes naturally or is stopped externally.
     *
     * This function does not start playback; it simply awaits completion.
     */
    suspend fun awaitPlaybackCompletion() = suspendCancellableCoroutine { cont ->
        // Store the continuation so that stop() can resume it.
        playbackContinuation = cont

        // Set the listener to resume the coroutine when playback finishes naturally.
        mediaPlayer.setOnCompletionListener {
            playbackContinuation?.let { cont.resume(Unit) }
            playbackContinuation = null
            mediaPlayer.setOnCompletionListener(null)
        }

        // If the coroutine is cancelled, stop playback.
        cont.invokeOnCancellation {
            stop()
        }
    }

    /**
     * Stops playback. If there's a pending await, it resumes immediately.
     */
    fun stop() {
        if (mediaPlayer.isPlaying) {
            mediaPlayer.stop()
        }
        // Resume the waiting coroutine (if any) so that awaitPlaybackCompletion doesn't hang.
        playbackContinuation?.let { cont ->
            if (cont.isActive) {
                cont.resume(Unit)
            }
        }
        playbackContinuation = null
    }

    /**
     * Releases MediaPlayer resources.
     */
    override fun close() {
        stop()
        mediaPlayer.release()
    }
}
