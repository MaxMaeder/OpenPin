package org.OpenPin.Daemon

import kotlin.math.abs
import kotlin.math.sqrt

// Gesture type definitions.
enum class GestureType {
    TAP, LONG_PRESS_DOWN, LONG_PRESS_UP, DRAG_UP, DRAG_DOWN, DRAG_LEFT, DRAG_RIGHT
}

data class GestureEvent(val fingerCount: Int, val type: GestureType)

// GestureDetector aggregates input events and detects gestures.
// It is configurable via its constructor.
class GestureDetector(
    private val longPressThreshold: Long = 300L,
    private val swipeThreshold: Int = 20,
    private val gestureCallback: (GestureEvent) -> Unit
) {
    private var touchActive = false
    private var dragStarted = false
    private var longPressTriggered = false
    private var touchStartTime: Long = 0
    private var startX: Int? = null
    private var startY: Int? = null
    private var lastX: Int? = null
    private var lastY: Int? = null
    // For drag events: record the coordinates where the last drag event was fired.
    private var lastDragX: Int = 0
    private var lastDragY: Int = 0
    // Track finger slots observed during the gesture.
    private val observedSlots = mutableSetOf<Int>()

    // Process a new input event.
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
                    "ABS_X" -> onXUpdate(parseCoordinate(event.value))
                    "ABS_Y" -> onYUpdate(parseCoordinate(event.value))
                    // Each time a new multi‑touch slot is reported, add it.
                    "ABS_MT_SLOT" -> {
                        val slot = parseCoordinate(event.value)
                        observedSlots.add(slot)
                    }
                }
            }
            "EV_SYN" -> {
                if (event.code == "SYN_REPORT") {
                    onSynReport()
                }
            }
        }
    }

    // Called when a touch starts.
    private fun onTouchDown() {
        touchActive = true
        dragStarted = false
        longPressTriggered = false
        touchStartTime = SystemUtils.getMillis()
        startX = null
        startY = null
        lastX = null
        lastY = null
        lastDragX = 0
        lastDragY = 0
        observedSlots.clear()
    }

    // Called when a touch ends.
    private fun onTouchUp() {
        if (!touchActive) return
        // If no drag occurred, then decide between tap and long press up.
        if (!dragStarted) {
            val now = SystemUtils.getMillis()
            val duration = now - touchStartTime
            if (duration < longPressThreshold) {
                gestureCallback(GestureEvent(getFingerCount(), GestureType.TAP))
            } else {
                gestureCallback(GestureEvent(getFingerCount(), GestureType.LONG_PRESS_UP))
            }
        }
        // Reset the gesture state.
        touchActive = false
        dragStarted = false
        longPressTriggered = false
    }

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

    // Called on each SYN_REPORT; handles long press detection and drag events.
    private fun onSynReport() {
        if (!touchActive) return
        val now = SystemUtils.getMillis()
        val duration = now - touchStartTime

        // If not yet dragging, check if movement from start exceeds swipeThreshold.
        if (!dragStarted && startX != null && startY != null && lastX != null && lastY != null) {
            val totalDeltaX = lastX!! - startX!!
            val totalDeltaY = lastY!! - startY!!
            val totalDistance = sqrt((totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY).toDouble())
            if (totalDistance >= swipeThreshold) {
                dragStarted = true
                // Initialize drag base coordinate to the start.
                lastDragX = startX!!
                lastDragY = startY!!
                // Cancel long press if a drag is detected.
                longPressTriggered = true
            }
        }

        // If in drag mode, check if accumulated movement crosses another swipeThreshold.
        if (dragStarted && lastX != null && lastY != null) {
            var diffX = lastX!! - lastDragX
            var diffY = lastY!! - lastDragY
            // Process as many threshold crossings as available.
            while (true) {
                if (abs(diffX) < swipeThreshold && abs(diffY) < swipeThreshold) break

                // Determine the dominant axis of movement.
                if (abs(diffX) >= abs(diffY)) {
                    if (diffX > 0) {
                        gestureCallback(GestureEvent(getFingerCount(), GestureType.DRAG_RIGHT))
                        lastDragX += swipeThreshold
                    } else {
                        gestureCallback(GestureEvent(getFingerCount(), GestureType.DRAG_LEFT))
                        lastDragX -= swipeThreshold
                    }
                } else {
                    if (diffY > 0) {
                        gestureCallback(GestureEvent(getFingerCount(), GestureType.DRAG_DOWN))
                        lastDragY += swipeThreshold
                    } else {
                        gestureCallback(GestureEvent(getFingerCount(), GestureType.DRAG_UP))
                        lastDragY -= swipeThreshold
                    }
                }
                diffX = lastX!! - lastDragX
                diffY = lastY!! - lastDragY
            }
        }

        // If not dragging and long press not yet triggered, check for long press.
        if (!dragStarted && !longPressTriggered && duration >= longPressThreshold) {
            gestureCallback(GestureEvent(getFingerCount(), GestureType.LONG_PRESS_DOWN))
            longPressTriggered = true
        }
    }

    // Returns the number of unique finger slots observed.
    private fun getFingerCount(): Int = observedSlots.size.takeIf { it > 0 } ?: 1

    // Parses a hexadecimal coordinate value.
    private fun parseCoordinate(value: String): Int {
        return try {
            value.trim().toInt(16)
        } catch (e: NumberFormatException) {
            0
        }
    }
}
