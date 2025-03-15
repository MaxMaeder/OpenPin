package org.openpin.app.daemonbridge

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import android.util.Log

/**
 * Enumerates the types of intents sent by the daemon.
 */
enum class DaemonIntentType(val action: String) {
    PROCESS_DONE("org.openpin.PROCESS_DONE_ACTION"),
    GESTURE("org.openpin.GESTURE_ACTION")
}

/**
 * Represents a callback registration, including a filter map and a flag if it is one-shot.
 */
data class CallbackRegistration(
    val intentType: DaemonIntentType,
    val filter: Map<String, Any>,
    val once: Boolean,
    val callback: (Intent) -> Unit
)

/**
 * DaemonReceiver is a centralized BroadcastReceiver that registers generic callbacks.
 * A callback is invoked when the received intent’s action matches its IntentType and
 * the intent’s extras contain all key/value pairs from the registration’s filter.
 */
object DaemonReceiver {
    private val registrations = mutableListOf<CallbackRegistration>()
    private var isRegistered = false
    private lateinit var appContext: Context

    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context?, intent: Intent?) {
            if (intent == null) return
            val action = intent.action ?: return
            val intentType = DaemonIntentType.values().find { it.action == action } ?: return

            // Iterate over a copy of the list to avoid concurrent modification.
            val toRemove = mutableListOf<CallbackRegistration>()
            for (registration in registrations.toList()) {
                if (registration.intentType == intentType && matchesFilter(intent, registration.filter)) {
                    registration.callback(intent)
                    if (registration.once) {
                        toRemove.add(registration)
                    }
                }
            }
            if (toRemove.isNotEmpty()) {
                registrations.removeAll(toRemove)
            }
        }
    }

    /**
     * Returns true if every key/value pair in [filter] exists in the intent’s extras.
     */
    private fun matchesFilter(intent: Intent, filter: Map<String, Any>): Boolean {
        if (filter.isEmpty()) return true
        val extras: Bundle = intent.extras ?: return false
        for ((key, value) in filter) {
            if (!extras.containsKey(key)) return false
            val extraValue = extras.get(key)
            if (extraValue != value) return false
        }
        return true
    }

    /**
     * Registers a callback for a given IntentType and filter.
     *
     * @param once If true, the callback is automatically unregistered after the first call.
     */
    fun registerCallback(intentType: DaemonIntentType, filter: Map<String, Any>, once: Boolean = false, callback: (Intent) -> Unit) {
        registrations.add(CallbackRegistration(intentType, filter, once, callback))
    }

    /**
     * Unregisters callbacks matching the provided callback reference.
     */
    fun unregisterCallback(callback: (Intent) -> Unit) {
        registrations.removeAll { it.callback == callback }
    }

    /**
     * Call this once (after permissions are granted) to register the broadcast receiver.
     */
    fun register(context: Context) {
        if (isRegistered) return

        appContext = context.applicationContext
        val filter = IntentFilter().apply {
            DaemonIntentType.values().forEach { addAction(it.action) }
        }
        appContext.registerReceiver(receiver, filter)
        isRegistered = true
    }

    fun unregister(context: Context) {
        if (isRegistered) {
            try {
                context.unregisterReceiver(receiver)
            } catch (e: Exception) {
                Log.e("DaemonReceiver", "Error unregistering receiver", e)
            }
            isRegistered = false
        }
    }
}
