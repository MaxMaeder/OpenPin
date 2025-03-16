package org.openpin.app.daemonbridge

import android.content.Context
import android.content.Intent

/**
 * Enum representing the different gesture types.
 */
enum class GestureType {
    TAP,
    LONG_PRESS_DOWN,
    LONG_PRESS_UP,
    DRAG_UP,
    DRAG_DOWN,
    DRAG_LEFT,
    DRAG_RIGHT
}

/**
 * Data class representing a gesture event.
 */
data class GestureEvent(val fingerCount: Int, val type: GestureType)

/**
 * GestureListener leverages DaemonReceiver to listen for gesture events.
 * It offers two subscription methods:
 * - subscribeAll: receives every gesture event.
 * - subscribeGesture: receives only gestures matching a given finger count and type.
 */
class GestureListener(private val context: Context) {

    // Store registered callback functions for gesture events.
    private val gestureCallbacks = mutableListOf<(Intent) -> Unit>()

    fun subscribeAll(callback: (GestureEvent) -> Unit) {
        val intentCallback: (Intent) -> Unit = { intent ->
            parseGestureEvent(intent)?.let { event ->
                callback(event)
            }
        }
        gestureCallbacks.add(intentCallback)
        DaemonReceiver.registerCallback(
            intentType = DaemonIntentType.GESTURE,
            filter = emptyMap(),
            once = false,
            callback = intentCallback
        )
    }

    fun subscribeGesture(fingerCount: Int, type: GestureType, callback: (GestureEvent) -> Unit) {
        val filter = mapOf(
            "fingerCount" to fingerCount,
            "type" to type.name
        )
        val intentCallback: (Intent) -> Unit = { intent ->
            parseGestureEvent(intent)?.let { event ->
                callback(event)
            }
        }
        gestureCallbacks.add(intentCallback)
        DaemonReceiver.registerCallback(
            intentType = DaemonIntentType.GESTURE,
            filter = filter,
            once = false,
            callback = intentCallback
        )
    }

    /**
     * Unsubscribes from all gesture events by unregistering all stored callbacks.
     */
    fun unsubscribeAll() {
        for (callback in gestureCallbacks) {
            DaemonReceiver.unregisterCallback(callback)
        }
        gestureCallbacks.clear()
    }

    private fun parseGestureEvent(intent: Intent): GestureEvent? {
        val extras = intent.extras ?: return null
        val fingerCount = extras.getInt("fingerCount", -1)
        val typeString = extras.getString("type") ?: return null
        val gestureType = try {
            GestureType.valueOf(typeString)
        } catch (e: Exception) {
            return null
        }
        return GestureEvent(fingerCount, gestureType)
    }
}