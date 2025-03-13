package org.OpenPin.Daemon

import kotlinx.cinterop.*
import platform.posix.*
import kotlin.math.sqrt
import kotlin.system.getTimeMillis

// Represents a parsed input event.
data class InputEvent(val device: String, val type: String, val code: String, val value: String)

// Parses a log line into an InputEvent.
fun parseEventLine(line: String): InputEvent? {
    val parts = line.split(":")
    if (parts.size < 2) return null
    val device = parts[0].trim()
    val tokens = parts[1].trim().split(Regex("\\s+"))
    if (tokens.size < 3) return null
    return InputEvent(device, tokens[0], tokens[1], tokens[2])
}

// Lazily reads events from "getevent -l".
@OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
fun readEvents(): Sequence<String> = sequence {
    val process = popen("getevent -l", "r") ?: error("Failed to start process")
    try {
        memScoped {
            val buffer = ByteArray(1024)
            while (fgets(buffer.refTo(0), buffer.size, process) != null) {
                yield(buffer.toKString())
            }
        }
    } finally {
        pclose(process)
    }
}

// Stub for sending gesture events (currently just prints).
fun sendGestureEvent(gesture: String) {
    println("Gesture detected: $gesture")
}

// GestureDetector aggregates events and detects gestures.
class GestureDetector {
    private var touchActive = false
    private var touchStartTime: Long = 0
    private var startX: Int? = null
    private var startY: Int? = null
    private var lastX: Int? = null
    private var lastY: Int? = null
    private var longPressTriggered = false

    // Set to track observed finger slots during a gesture.
    private val observedSlots = mutableSetOf<Int>()

    // Thresholds – adjust as needed.
    private val longPressThreshold = 500L  // in milliseconds
    private val swipeThreshold = 20        // coordinate units

    // Returns a label based on how many unique slots were observed.
    private fun getFingerLabel(): String =
        if (observedSlots.size >= 2) "two finger" else "one finger"

    // Process an input event.
    fun processEvent(event: InputEvent) {
        when (event.type) {
            "EV_KEY" -> {
                if (event.code == "BTN_TOUCH") {
                    when (event.value.trim()) {
                        "DOWN" -> onTouchDown()
                        "UP" -> onTouchUp()
                    }
                }
            }
            "EV_ABS" -> {
                when (event.code) {
                    "ABS_X" -> {
                        val x = parseCoordinate(event.value)
                        onXUpdate(x)
                    }
                    "ABS_Y" -> {
                        val y = parseCoordinate(event.value)
                        onYUpdate(y)
                    }
                    // Record the slot id whenever an ABS_MT_SLOT event occurs.
                    "ABS_MT_SLOT" -> {
                        val slot = parseCoordinate(event.value)
                        observedSlots.add(slot)
                    }
                    // Optionally, you can handle ABS_MT_POSITION_X/Y here.
                }
            }
            "EV_SYN" -> {
                if (event.code == "SYN_REPORT") {
                    onSynReport()
                }
            }
        }
    }

    // Called on BTN_TOUCH DOWN.
    private fun onTouchDown() {
        touchActive = true
        longPressTriggered = false
        touchStartTime = getTimeMillis()
        startX = null
        startY = null
        lastX = null
        lastY = null
        observedSlots.clear() // Clear any previous finger slot data.
    }

    // Called on BTN_TOUCH UP.
    private fun onTouchUp() {
        if (!touchActive) return
        val now = getTimeMillis()
        val duration = now - touchStartTime

        // If a long press down was triggered, always finalize as a long press up.
        if (longPressTriggered) {
            sendGestureEvent("${getFingerLabel()} long press up")
            touchActive = false
            return
        }

        if (startX != null && startY != null && lastX != null && lastY != null) {
            val deltaX = lastX!! - startX!!
            val deltaY = lastY!! - startY!!
            val distance = sqrt((deltaX * deltaX + deltaY * deltaY).toDouble())

            if (distance < swipeThreshold) {
                if (duration < longPressThreshold) {
                    sendGestureEvent("${getFingerLabel()} tap")
                } else {
                    sendGestureEvent("${getFingerLabel()} long press up")
                }
            } else {
                if (duration >= longPressThreshold) {
                    sendGestureEvent("${getFingerLabel()} long press up")
                } else {
                    if (kotlin.math.abs(deltaX) > kotlin.math.abs(deltaY)) {
                        if (deltaX > 0) sendGestureEvent("${getFingerLabel()} swipe right")
                        else sendGestureEvent("${getFingerLabel()} swipe left")
                    } else {
                        if (deltaY > 0) sendGestureEvent("${getFingerLabel()} swipe down")
                        else sendGestureEvent("${getFingerLabel()} swipe up")
                    }
                }
            }
        } else {
            // Fallback in case coordinate events are missing.
            sendGestureEvent("${getFingerLabel()} tap")
        }
        touchActive = false
    }

    // Update coordinate data.
    private fun onXUpdate(x: Int) {
        if (touchActive) {
            if (startX == null) startX = x
            lastX = x
        }
    }

    private fun onYUpdate(y: Int) {
        if (touchActive) {
            if (startY == null) startY = y
            lastY = y
        }
    }

    // Checks for long press on each SYN_REPORT.
    private fun onSynReport() {
        if (touchActive && !longPressTriggered) {
            val now = getTimeMillis()
            val duration = now - touchStartTime
            if (duration >= longPressThreshold) {
                sendGestureEvent("${getFingerLabel()} long press down")
                longPressTriggered = true
            }
        }
    }

    // Converts a hexadecimal string to an integer.
    private fun parseCoordinate(value: String): Int {
        return try {
            value.trim().toInt(16)
        } catch (e: NumberFormatException) {
            0
        }
    }
}

fun main() {
    println("Listening for input events...")
    val gestureDetector = GestureDetector()
    for (line in readEvents()) {
        parseEventLine(line)?.let { event ->
            gestureDetector.processEvent(event)
        }
    }
}
