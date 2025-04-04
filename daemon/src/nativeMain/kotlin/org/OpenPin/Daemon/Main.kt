package org.openpin.daemon

import org.openpin.daemon.gestures.GestureDetector
import org.openpin.daemon.gestures.GestureEvent
import org.openpin.daemon.input.InputEventReader
import org.openpin.daemon.intents.IntentManager
import org.openpin.daemon.power.SleepManager
import org.openpin.daemon.processes.ProcessCallback
import org.openpin.daemon.processes.ProcessManager
import org.openpin.daemon.util.SystemUtils

private val config = DaemonConfig()

private class IntentProcessCallback : ProcessCallback {
    override fun onProcessFinished(uuid: String) {
        IntentManager.sendBroadcast(
            IntentManager.BroadcastType.PROCESS_DONE_ACTION,
            mapOf("pid" to uuid)
        )
        println("Process with uuid $uuid finished.")
    }
}

private val processManager = ProcessManager(
    directory = config.processHandlerDir,
    updateInterval = config.processUpdateInterval,
    callback = IntentProcessCallback()
)

private fun handleDeviceWake() {
    if (config.clientActivity.isNullOrBlank())
        return

    val checkCmd = "[[ \"\$(dumpsys activity activities | grep topResumedActivity= | awk '{ print \$3 }')\" == \"${config.clientActivity}\" ]]"
    val isActivityActive = SystemUtils.executeCommand(checkCmd) == 0

    if (!isActivityActive) {
        println("Client activity is not active, launching...")

        val launchCmd = "am start -n ${config.clientActivity}"
        SystemUtils.executeCommand(launchCmd)
    }
}

private val sleepManager = SleepManager(
    sleepAfter = config.sleepAfter,
    onWake = { handleDeviceWake() }
)

private fun handleGestureDetected(event: GestureEvent) {
    sleepManager.awaken()

    IntentManager.sendBroadcast(
        IntentManager.BroadcastType.GESTURE_ACTION,
        mapOf("fingerCount" to event.fingerCount,
            "type" to event.type)
    )
}

private val eventReader = InputEventReader()
private val gestureDetector = GestureDetector(
    gestureCallback = { event -> handleGestureDetected(event) }
)

fun main() {
    println("Listening for processes to run...")
    processManager.start()

    println("Listening for input events...")
    for (event in eventReader.readEvents()) {
        gestureDetector.processEvent(event)
    }

    println("Launching client...")
    handleDeviceWake() // Make sure client running
}
