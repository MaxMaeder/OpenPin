package org.openpin.appframework.audioplayer

data class AudioPlayerConfig(
    val overrideSystemVolume: Boolean = true,

    val enableVolumeGestures: Boolean = true,
    val enableVolumeFeedback: Boolean = true,

    val masterVolume: Float = 1.0f,

    val speechVolume: Float = 1.0f,
    val mediaVolume: Float = 1.0f,
    val soundVolume: Float = 1.0f
)