package org.openpin.appframework.utils

import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.openpin.appframework.R
import org.openpin.appframework.audioplayer.AudioPlayer
import org.openpin.appframework.audioplayer.AudioType

suspend fun <T> withLoadingSounds(
    audioPlayer: AudioPlayer,
    loadingSounds: List<Int> = listOf(
        R.raw.loading1,
        R.raw.loading2,
        R.raw.loading3,
        R.raw.loading4,
        R.raw.loading5
    ),
    delayMillis: Long = 2000L,
    block: suspend () -> T
): T = coroutineScope {
    val loadingJob = launch {
        delay(delayMillis)
        var index = 0
        while (isActive) {
            audioPlayer.play(loadingSounds[index], AudioType.SOUND)
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