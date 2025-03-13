package org.OpenPin.Daemon

// A simple callback implementation that prints the uuid.
class PrintCallback : ProcessCallback {
    override fun onProcessFinished(uuid: String) {
        println("Process with uuid $uuid finished.")
    }
}

fun main() {
    // Set the base directory (adjust to your environment).
    val directory = "/storage/emulated/0/daemon-channel"
    val manager = ProcessManager(directory, 50, PrintCallback())

    // Start the monitoring process.
    manager.start()

    println("Listening for input events...")
    val eventReader = InputEventReader()
    // Instantiate GestureDetector with custom thresholds and a gesture callback.
    val gestureDetector = GestureDetector(
        gestureCallback = { event ->
            println("Gesture detected: ${event.fingerCount} finger ${event.type}")
        }
    )

    // Process events as they arrive.
    for (event in eventReader.readEvents()) {
        gestureDetector.processEvent(event)
    }
}
