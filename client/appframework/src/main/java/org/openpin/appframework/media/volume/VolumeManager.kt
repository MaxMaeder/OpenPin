package org.openpin.appframework.media.volume

import SoundPlayer
import android.content.Context
import android.media.AudioManager
import org.openpin.appframework.daemonbridge.gesture.GestureHandler
import org.openpin.appframework.daemonbridge.gesture.GestureType
import org.openpin.appframework.media.AudioSource
import org.openpin.appframework.media.AudioType
import org.openpin.appframework.media.soundplayer.SystemSound

/**
 * VolumeManager manages the master volume across various audio sources.
 * It applies the relative volume multiplier for each AudioType and integrates with
 * a GestureHandler to adjust the volume via gestures.
 */
class VolumeManager(
    private val context: Context,
    private val config: VolumeConfig,
    private val gestureHandler: GestureHandler,

    // Map of AudioType to AudioSource instance (e.g., SpeechPlayer)
    private val audioSources: Map<AudioType, AudioSource>,
) {
    private var masterVolume: Float = config.masterVolume

    init {
        // Override the system volume if the config requires it.
        if (config.overrideSystemVolume) {
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            audioManager.setStreamVolume(
                AudioManager.STREAM_MUSIC,
                audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC),
                0
            )
        }

        // Subscribe to gesture events if volume gestures are enabled.
        if (config.enableVolumeGestures) {
            // Note: Touchpad is vertically flipped.
            gestureHandler.subscribeGesture(1, GestureType.DRAG_UP) {
                changeMasterVolume(-config.volumeGestureStepSize)
            }
            gestureHandler.subscribeGesture(1, GestureType.DRAG_DOWN) {
                changeMasterVolume(config.volumeGestureStepSize)
            }
        }

        // Apply the initial volume to all audio sources.
        updateAudioSourcesVolume()
    }

    /**
     * Sets the master volume and updates all associated AudioSources.
     *
     * The effective volume for each AudioSource is computed as:
     *    effectiveVolume = masterVolume * relativeVolume
     */
    fun setMasterVolume(volume: Float) {
        masterVolume = volume.coerceIn(0.0f, 1.0f)
        updateAudioSourcesVolume()

        if (config.enableVolumeFeedback) {
            val soundPlayer = audioSources[AudioType.SOUND] as? SoundPlayer
            soundPlayer?.play(SystemSound.VOLUME_CHANGE.key)
        }
    }

    /**
     * Changes the master volume by the given step.
     */
    fun changeMasterVolume(step: Float) {
        setMasterVolume(masterVolume + step)
    }

    /**
     * Updates the volume on each AudioSource by applying its relative volume multiplier.
     */
    private fun updateAudioSourcesVolume() {
        audioSources.forEach { (audioType, audioSource) ->
            val relative = config.relativeVolumes[audioType] ?: 1.0f
            audioSource.setVolume(masterVolume * relative)
        }
    }
}