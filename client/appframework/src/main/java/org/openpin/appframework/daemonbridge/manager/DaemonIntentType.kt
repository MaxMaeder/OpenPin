package org.openpin.appframework.daemonbridge.manager

/**
 * Enumerates the types of intents sent by the daemon.
 */
enum class DaemonIntentType(val action: String) {
    PROCESS_DONE("org.openpin.PROCESS_DONE_ACTION"),
    GESTURE("org.openpin.GESTURE_ACTION");

    companion object {
        fun fromAction(action: String?): DaemonIntentType? {
            return entries.firstOrNull { it.action == action }
        }
    }
}