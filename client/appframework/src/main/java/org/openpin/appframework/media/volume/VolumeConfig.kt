package org.openpin.appframework.media.volume

import org.openpin.appframework.media.AudioSource
import org.openpin.appframework.media.AudioType

data class VolumeConfig(
    val overrideSystemVolume: Boolean = true,

    val enableVolumeGestures: Boolean = true,
    val enableVolumeFeedback: Boolean = true,
    val volumeGestureStepSize: Float = 0.1f,

    val masterVolume: Float = 1.0f,

    // Map of AudioType to its relative volume multiplier.
    val relativeVolumes: Map<AudioType, Float> = mapOf(
        AudioType.SOUND   to 1.0f,
        AudioType.MEDIA   to 1.0f,
        AudioType.SPEECH  to 1.0f,
        AudioType.GENERIC to 1.0f,
    )
)