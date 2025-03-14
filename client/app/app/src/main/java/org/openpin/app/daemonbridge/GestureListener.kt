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

    /**
     * Subscribes to all gesture events.
     */
    fun subscribeAll(callback: (GestureEvent) -> Unit) {
        DaemonReceiver.registerCallback(
            intentType = DaemonIntentType.GESTURE,
            filter = emptyMap(),
            once = false
        ) { intent ->
            parseGestureEvent(intent)?.let { event ->
                callback(event)
            }
        }
    }

    /**
     * Subscribes only to gesture events that match the specified fingerCount and type.
     */
    fun subscribeGesture(fingerCount: Int, type: GestureType, callback: (GestureEvent) -> Unit) {
        val filter = mapOf(
            "fingerCount" to fingerCount,
            "type" to type.name // Assumes the intent sends the gesture type as a string matching the enum name.
        )
        DaemonReceiver.registerCallback(
            intentType = DaemonIntentType.GESTURE,
            filter = filter,
            once = false
        ) { intent ->
            parseGestureEvent(intent)?.let { event ->
                callback(event)
            }
        }
    }

    /**
     * Converts an Intent into a GestureEvent, if possible.
     */
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