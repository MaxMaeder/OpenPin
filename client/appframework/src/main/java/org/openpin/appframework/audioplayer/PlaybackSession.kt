package org.openpin.appframework.audioplayer

import android.media.MediaPlayer

class PlaybackSession(private val mediaPlayer: MediaPlayer) {
    init {
        mediaPlayer.setOnCompletionListener { it.release() }
    }

    fun play() {
        if (!mediaPlayer.isPlaying) {
            mediaPlayer.start()
        }
    }

    fun pause() {
        if (mediaPlayer.isPlaying) {
            mediaPlayer.pause()
        }
    }

    fun stop() {
        if (mediaPlayer.isPlaying) {
            mediaPlayer.stop()
            mediaPlayer.release()
        }
    }

    fun setVolume(volume: Float) {
        mediaPlayer.setVolume(volume, volume)
    }
}