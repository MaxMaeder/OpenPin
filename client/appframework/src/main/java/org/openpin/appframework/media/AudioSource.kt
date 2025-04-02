package org.openpin.appframework.media

/**
 * Defines an audio source that allows volume adjustment.
 */
interface AudioSource {
    fun setVolume(volume: Float)
}