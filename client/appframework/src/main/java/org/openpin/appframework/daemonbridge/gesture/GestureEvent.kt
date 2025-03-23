package org.openpin.appframework.daemonbridge.gesture

/**
 * Data class representing a gesture event.
 */
data class GestureEvent(val fingerCount: Int, val type: GestureType)