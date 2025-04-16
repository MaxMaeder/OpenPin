package org.openpin.daemon.power

import kotlinx.coroutines.*
import org.openpin.daemon.util.SystemUtils
import org.openpin.daemon.util.SystemUtils.readFile

class SleepManager(
    private val directory: String,
    private val sleepAfter: Long = 45 * 1000L,
    private val onWake: () -> Unit = {}
) {
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    private var timerJob: Job? = null
    private var isProbablyAwake: Boolean = false

    private val wakelockFile = "$directory/wakelock.txt"

    fun awaken() {
        resetSleepTimer()

        if (!isProbablyAwake) {
            println("Waking device...")
        }

        wakeDevice()
    }

    private fun resetSleepTimer() {
        timerJob?.cancel()
        timerJob = scope.launch {
            delay(sleepAfter)
            sleepDevice()
        }
    }

    private fun hasWakelock(): Boolean {
        try {
            val status = readFile(wakelockFile)

            return status.trim() == "true"
        } catch (e: Exception) {
            println("Can't read Wakelock file, assuming disabled")
            return false
        }
    }

    private fun wakeDevice() {
        SystemUtils.executeCommand("cmd power disable-humane-display-controller")
        SystemUtils.executeCommand("input keyevent KEYCODE_WAKEUP")
        SystemUtils.executeCommand("settings put system screen_off_timeout $sleepAfter")

        if (!isProbablyAwake) onWake()
        isProbablyAwake = true
    }

    private fun sleepDevice() {
        println("Putting device to sleep...")

        if (hasWakelock()) {
            println("Wakelock enabled, skipping")
            resetSleepTimer()
            return
        }

        SystemUtils.executeCommand("cmd power enable-humane-display-controller")
        println("Sleeping")

        isProbablyAwake = false
    }
}
