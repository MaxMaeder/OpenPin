package org.openpin.appframework.audioplayer

import android.content.Context
import android.content.Context.AUDIO_SERVICE
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import org.openpin.appframework.R
import java.io.File
import java.io.FileInputStream

class AudioPlayer(
    private val context: Context,
    private val config: AudioPlayerConfig
) {
    private var masterVolume = config.masterVolume

    init {
        if (config.overrideSystemVolume) {
            val audioManager = context.getSystemService(AUDIO_SERVICE) as AudioManager
            audioManager.setStreamVolume(
                AudioManager.STREAM_MUSIC,
                audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC),
                0
            )
        }
    }

    /**
     * Plays audio from a given File.
     */
    fun play(file: File, type: AudioType, start: Boolean = true): PlaybackSession {
        val mediaPlayer = MediaPlayer()
        val fis = FileInputStream(file)
        mediaPlayer.setDataSource(fis.fd)
        fis.close()
        configureAndPrepare(mediaPlayer)
        applyVolume(mediaPlayer, type)
        val session = PlaybackSession(mediaPlayer)
        if (start) {
            session.play()
        }
        return session
    }

    /**
     * Plays audio from a given resource ID.
     */
    fun play(resource: Int, type: AudioType, start: Boolean = true): PlaybackSession {
        val mediaPlayer = MediaPlayer.create(context, resource)
            ?: throw IllegalArgumentException("Could not create MediaPlayer for resource id: $resource")
        // MediaPlayer.create() already prepares the player.
        applyVolume(mediaPlayer, type)
        val session = PlaybackSession(mediaPlayer)
        if (start) {
            session.play()
        }
        return session
    }

    /**
     * Configures audio attributes and prepares the MediaPlayer.
     */
    private fun configureAndPrepare(mediaPlayer: MediaPlayer) {
        val attributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .build()
        mediaPlayer.setAudioAttributes(attributes)
        mediaPlayer.prepare()
    }

    /**
     * Applies the effective volume to the MediaPlayer based on the audio type.
     */
    private fun applyVolume(mediaPlayer: MediaPlayer, type: AudioType) {
        val effectiveVolume = when (type) {
            AudioType.SPEECH -> masterVolume * config.speechVolume
            AudioType.MEDIA -> masterVolume * config.mediaVolume
            AudioType.SOUND -> masterVolume * config.soundVolume
            AudioType.GENERIC -> masterVolume
        }
        mediaPlayer.setVolume(effectiveVolume, effectiveVolume)
    }

    /**
     * Adjusts the master volume.
     */
    fun setMasterVolume(volume: Float) {
        masterVolume = volume.coerceIn(0.0f, 1.0f)

        if (config.enableVolumeFeedback) {
            play(R.raw.volume_change, AudioType.GENERIC)
        }
    }

    /**
     * Changes the master volume by the given step.
     */
    fun changeMasterVolume(step: Float) {
        setMasterVolume(masterVolume + step)
    }
}