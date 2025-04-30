package org.openpin.appframework.daemonbridge.power

import android.os.Bundle
import org.openpin.appframework.daemonbridge.manager.DaemonFileSystem
import org.openpin.appframework.daemonbridge.manager.DaemonIntentReceiver
import java.io.Closeable
import java.io.File

class PowerHandler : DaemonIntentReceiver, Closeable {

    private lateinit var fileSystem: DaemonFileSystem
    private lateinit var wakelockFile: File

    private val subscriptions = mutableSetOf<PowerSubscription>()

    override fun setFileSystem(fileSystem: DaemonFileSystem) {
        this.fileSystem = fileSystem
        wakelockFile = fileSystem.get("wakelock.txt")
    }

    override fun onReceive(extras: Bundle?) {
        val event = parsePowerEvent(extras) ?: return

        subscriptions.forEach { sub ->
            sub.callback(event)
        }
    }

    fun setWakelock(enabled: Boolean) {
        // Ensure the file exists
        if (!wakelockFile.exists()) {
            wakelockFile.createNewFile()
        }

        // Write "true" or "false" based on the parameter
        wakelockFile.writeText(enabled.toString())
    }

    /**
     * Subscribe to all power events get back a handle for unsubscribing later.
     */
    fun subscribePowerEvents(
        callback: (PowerEvent) -> Unit
    ): PowerSubscription {
        val sub = PowerSubscription(callback)
        subscriptions.add(sub)
        return sub
    }

    /**
     * Unsubscribe using the handle returned from subscribeGesture.
     */
    fun unsubscribe(sub: PowerSubscription) {
        subscriptions.remove(sub)
    }

    override fun close() {
        subscriptions.clear()
    }

    private fun parsePowerEvent(extras: Bundle?): PowerEvent? {
        extras ?: return null
        val sleeping = extras.getBoolean("sleeping")
        return PowerEvent(sleeping)
    }
}