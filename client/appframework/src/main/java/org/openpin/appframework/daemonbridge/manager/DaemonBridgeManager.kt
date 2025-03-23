package org.openpin.appframework.daemonbridge.manager

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import java.io.Closeable

class DaemonBridgeManager(
    private val context: Context,
    private val receiverMap: Map<DaemonIntentType, DaemonIntentReceiver>,
) : Closeable {

    private val fileSystem = DaemonFileSystem()

    private val internalReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context?, intent: Intent?) {
            intent?.action?.let { action ->
                DaemonIntentType.fromAction(action)?.let { type ->
                    receiverMap[type]?.onReceive(intent.extras)
                }
            }
        }
    }

    init {
        // Set filesystem in each receiver
        receiverMap.values.forEach { it.setFileSystem(fileSystem) }

        // Register for all intent types
        val filter = IntentFilter().apply {
            DaemonIntentType.entries.forEach { addAction(it.action) }
        }

        context.registerReceiver(internalReceiver, filter)
    }

    override fun close() {
        context.unregisterReceiver(internalReceiver)
    }
}