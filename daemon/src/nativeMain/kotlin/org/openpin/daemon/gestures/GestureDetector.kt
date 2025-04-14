package org.openpin.daemon.gestures

import kotlin.math.abs
import kotlinx.coroutines.*
import org.openpin.daemon.input.InputEvent
import org.openpin.daemon.util.SystemUtils

class GestureDetector(
    private val longPressThreshold: Long = 300L,
    private val dragThreshold: Int = 20,
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

    // Track finger slots observed during the gesture.
    private val observedSlots = mutableSetOf<Int>()

    // Use an internal CoroutineScope.
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
                    // Record the slot for multi-touch.
                    "ABS_MT_SLOT" -> {
                        val slot = parseCoordinate(event.value)
                        observedSlots.add(slot)
                    }
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

        observedSlots.clear()

        // Launch a coroutine to trigger LONG_PRESS_DOWN after the threshold.
        longPressJob = coroutineScope.launch {
            delay(longPressThreshold)
            if (touchActive && !dragStarted) {
                longPressFired = true
                gestureCallback(GestureEvent(getFingerCount(), GestureType.LONG_PRESS_DOWN))
            }
        }
    }

    private fun onTouchUp() {
        if (!touchActive) return

        longPressJob?.cancel()
        longPressJob = null

        if (longPressFired) {
            gestureCallback(GestureEvent(getFingerCount(), GestureType.LONG_PRESS_UP))
        } else if (!dragStarted) {
            gestureCallback(GestureEvent(getFingerCount(), GestureType.TAP))
        }

        touchActive = false
        dragStarted = false
        longPressFired = false
    }

    private fun onXUpdate(x: Int) {
        if (touchActive) {
            if (startX == null) startX = x
            lastX = x
            updateDragDetection()
        }
    }

    private fun onYUpdate(y: Int) {
        if (touchActive) {
            if (startY == null) startY = y
            lastY = y
            updateDragDetection()
        }
    }

    // This function is called on each x or y update to check for drag threshold crossings.
    private fun updateDragDetection() {
        if (!touchActive || longPressFired) return

        if (lastX == null || lastY == null) return

        val diffX = lastX!! - startX!!
        val diffY = lastY!! - startY!!
        
        if (abs(diffX) >= dragThreshold || abs(diffY) >= dragThreshold) {

            dragStarted = true

            longPressJob?.cancel()
            longPressJob = null

            if (abs(diffX) >= abs(diffY)) {
                if (diffX > 0) {
                    gestureCallback(GestureEvent(getFingerCount(), GestureType.DRAG_RIGHT))
                } else {
                    gestureCallback(GestureEvent(getFingerCount(), GestureType.DRAG_LEFT))
                }
            } else {
                if (diffY > 0) {
                    gestureCallback(GestureEvent(getFingerCount(), GestureType.DRAG_DOWN))
                } else {
                    gestureCallback(GestureEvent(getFingerCount(), GestureType.DRAG_UP))
                }
            }

            startX = lastX!!
            startY = lastY!!
        }
    }

    private fun getFingerCount(): Int = observedSlots.size.takeIf { it > 0 } ?: 1

    private fun parseCoordinate(value: String): Int {
        return try {
            value.trim().toInt(16)
        } catch (e: NumberFormatException) {
            0
        }
    }
}
