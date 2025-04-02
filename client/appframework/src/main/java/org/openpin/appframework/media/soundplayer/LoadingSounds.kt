package org.openpin.appframework.media.soundplayer

import SoundPlayer
import android.util.Log
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.openpin.appframework.R
import org.openpin.appframework.media.speechplayer.SpeechPlayer
import org.openpin.appframework.media.AudioType

suspend fun <T> withLoadingSounds(
    soundPlayer: SoundPlayer,
    loadingSounds: List<String> = listOf(
        SystemSound.LOADING1.key,
        SystemSound.LOADING2.key,
        SystemSound.LOADING3.key,
        SystemSound.LOADING4.key,
        SystemSound.LOADING5.key
    ),
    delayMillis: Long = 2000L,
    block: suspend () -> T
): T = coroutineScope {
    val loadingJob = launch {
        delay(delayMillis)
        var index = 0
        while (isActive) {
            soundPlayer.play(loadingSounds[index])
            index = (index + 1) % loadingSounds.size
            delay(delayMillis)
        }
    }

    try {
        block()
    } catch (e: Throwable) {
        // Cancel loading sounds before bubbling up the error
        loadingJob.cancel()
        throw e
    }.also {
        // Cancel loading sounds after success
        loadingJob.cancel()
    }
}