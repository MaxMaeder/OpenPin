package org.openpin.appframework.media.soundplayer

data class SoundPlayerConfig(
    val soundResources: Map<String, Int> = SystemSound.asMap,
    val maxStreams: Int = soundResources.size
)
