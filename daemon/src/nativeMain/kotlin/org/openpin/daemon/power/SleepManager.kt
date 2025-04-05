package org.openpin.daemon.power

import kotlinx.coroutines.*
import org.openpin.daemon.util.SystemUtils

class SleepManager(
    private val sleepAfter: Long = 45 * 1000L,
    private val onWake: () -> Unit = {}
) {
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    private var timerJob: Job? = null
    private var isProbablyAwake: Boolean = false

    // Public method that awakens the device and starts the timer to "sleep" it later.
    fun awaken() {
        timerJob?.cancel()

        if (!isProbablyAwake) {
            println("Waking device...")
        }

        wakeDevice()

        timerJob = scope.launch {
            delay(sleepAfter)
            sleepDevice()
        }
    }

    private fun wakeDevice() {
        SystemUtils.executeCommand("input keyevent KEYCODE_WAKEUP")
        SystemUtils.executeCommand("settings put system screen_off_timeout $sleepAfter")

        if (!isProbablyAwake) onWake()
        isProbablyAwake = true
    }

    private fun sleepDevice() {
        println("Putting device to sleep...")
        SystemUtils.executeCommand("settings put system screen_off_timeout 1000")

        isProbablyAwake = false
    }
}
