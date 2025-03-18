package org.OpenPin.Daemon

// A simple callback implementation that prints the uuid.
class PrintCallback : ProcessCallback {
    override fun onProcessFinished(uuid: String) {
        IntentManager.sendBroadcast(
            IntentManager.BroadcastType.PROCESS_DONE_ACTION,
            mapOf("pid" to uuid)
        )
        println("Process with uuid $uuid finished.")
    }
}

fun main() {
    // Set the base directory (adjust to your environment).
    val directory = "/storage/emulated/0/Documents/daemon-channel"
    val manager = ProcessManager(directory, 50, PrintCallback())

    // Start the monitoring process.
    manager.start()

    println("Listening for input events...")
    val eventReader = InputEventReader()
    // Instantiate GestureDetector with custom thresholds and a gesture callback.
    val gestureDetector = GestureDetector(
        gestureCallback = { event ->
            //println("Gesture detected: ${event.fingerCount} finger ${event.type}")
            IntentManager.sendBroadcast(
                IntentManager.BroadcastType.GESTURE_ACTION,
                mapOf("fingerCount" to event.fingerCount,
                    "type" to event.type)
            )
        }
    )

    // Process events as they arrive.
    for (event in eventReader.readEvents()) {
        gestureDetector.processEvent(event)
    }
}
