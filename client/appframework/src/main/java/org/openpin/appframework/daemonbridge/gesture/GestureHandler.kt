package org.openpin.appframework.daemonbridge.gesture

import android.os.Bundle
import org.openpin.appframework.daemonbridge.manager.DaemonFileSystem
import org.openpin.appframework.daemonbridge.manager.DaemonIntentReceiver
import java.io.Closeable

class GestureHandler : DaemonIntentReceiver, Closeable {

    private val subscriptions = mutableSetOf<GestureSubscription>()

    override fun setFileSystem(fileSystem: DaemonFileSystem) {
        // We don't need the file system here
    }

    override fun onReceive(extras: Bundle?) {
        val event = parseGestureEvent(extras) ?: return

        // Call matching subscriptions
        subscriptions.forEach { sub ->
            if (sub.fingerCount == event.fingerCount && sub.type == event.type) {
                sub.callback(event)
            }
        }
    }

    /**
     * Subscribe to a specific gesture and get back a handle for unsubscribing later.
     */
    fun subscribeGesture(
        fingerCount: Int,
        type: GestureType,
        callback: (GestureEvent) -> Unit
    ): GestureSubscription {
        val sub = GestureSubscription(fingerCount, type, callback)
        subscriptions.add(sub)
        return sub
    }

    /**
     * Unsubscribe using the handle returned from subscribeGesture.
     */
    fun unsubscribe(sub: GestureSubscription) {
        subscriptions.remove(sub)
    }

    override fun close() {
        subscriptions.clear()
    }

    private fun parseGestureEvent(extras: Bundle?): GestureEvent? {
        extras ?: return null
        val fingerCount = extras.getInt("fingerCount", -1)
        val typeString = extras.getString("type") ?: return null
        val gestureType = runCatching { GestureType.valueOf(typeString) }.getOrNull() ?: return null
        return GestureEvent(fingerCount, gestureType)
    }
}
