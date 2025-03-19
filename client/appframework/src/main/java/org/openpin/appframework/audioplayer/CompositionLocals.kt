package org.openpin.appframework.audioplayer

import androidx.compose.runtime.staticCompositionLocalOf

val LocalAudioPlayer = staticCompositionLocalOf<AudioPlayer> {
    error("No audio player provided")
}