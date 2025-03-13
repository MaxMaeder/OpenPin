package org.OpenPin.Daemon

fun main() {
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
