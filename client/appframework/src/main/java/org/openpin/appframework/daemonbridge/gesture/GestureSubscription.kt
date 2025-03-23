package org.openpin.appframework.daemonbridge.gesture

data class GestureSubscription(
    val fingerCount: Int,
    val type: GestureType,
    val callback: (GestureEvent) -> Unit
)