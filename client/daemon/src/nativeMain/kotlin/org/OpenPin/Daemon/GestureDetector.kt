package org.OpenPin.Daemon

import kotlin.math.abs
import kotlin.math.sqrt
import kotlinx.coroutines.*

enum class GestureType {
    TAP, LONG_PRESS_DOWN, LONG_PRESS_UP, DRAG_UP, DRAG_DOWN, DRAG_LEFT, DRAG_RIGHT
}

data class GestureEvent(val fingerCount: Int, val type: GestureType)

class GestureDetector(
    private val longPressThreshold: Long = 300L,
    private val swipeThreshold: Int = 20,
    private val gestureCallback: (GestureEvent) -> Unit
) {
    private var touchActive = false
    private var dragStarted = false
    private var longPressFired = false
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

    // Use an internal CoroutineScope instead of GlobalScope.
    private val coroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private var longPressJob: Job? = null

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
                    // Each time a new multi–touch slot is reported, record its slot.
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

    private fun onTouchDown() {
        touchActive = true
        dragStarted = false
        longPressFired = false
        touchStartTime = SystemUtils.getMillis()
        startX = null
        startY = null
        lastX = null
        lastY = null
        lastDragX = 0
        lastDragY = 0
        observedSlots.clear()

        // Launch a coroutine to trigger LONG_PRESS_DOWN after longPressThreshold ms.
        longPressJob = coroutineScope.launch {
            delay(longPressThreshold)
            if (touchActive && !dragStarted) {
                gestureCallback(GestureEvent(getFingerCount(), GestureType.LONG_PRESS_DOWN))
                longPressFired = true
            }
        }
    }

    private fun onTouchUp() {
        if (!touchActive) return
        longPressJob?.cancel()
        longPressJob = null

        // If a long press was fired, finish with LONG_PRESS_UP.
        if (longPressFired) {
            gestureCallback(GestureEvent(getFingerCount(), GestureType.LONG_PRESS_UP))
        } else if (!dragStarted) {
            gestureCallback(GestureEvent(getFingerCount(), GestureType.TAP))
        }
        // Reset gesture state.
        touchActive = false
        dragStarted = false
        longPressFired = false
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

    // onSynReport() now handles drag (swipe) detection only if long press hasn't fired.
    private fun onSynReport() {
        if (!touchActive || longPressFired) return

        // Check if movement exceeds threshold (only if long press hasn't already fired).
        if (!dragStarted &&
            startX != null && startY != null && lastX != null && lastY != null
        ) {
            val totalDeltaX = lastX!! - startX!!
            val totalDeltaY = lastY!! - startY!!
            val totalDistance = sqrt((totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY).toDouble())
            if (totalDistance >= swipeThreshold) {
                dragStarted = true
                lastDragX = startX!!
                lastDragY = startY!!
                longPressJob?.cancel()
                longPressJob = null
            }
        }

        // Process drag events only if in drag mode and long press hasn’t fired.
        if (dragStarted && lastX != null && lastY != null) {
            var diffX = lastX!! - lastDragX
            var diffY = lastY!! - lastDragY
            while (true) {
                if (abs(diffX) < swipeThreshold && abs(diffY) < swipeThreshold) break

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
