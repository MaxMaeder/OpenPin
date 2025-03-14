package org.OpenPin.Daemon

import platform.posix.popen
import platform.posix.pclose

object IntentManager {

    enum class BroadcastType(val action: String) {
        GESTURE_ACTION("org.openpin.GESTURE_ACTION"),
        PROCESS_DONE_ACTION("org.openpin.PROCESS_DONE_ACTION"),
    }

    @OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
    fun sendBroadcast(broadcastType: BroadcastType, data: Map<String, Any>) {
        // Build the adb command string.
        val command = buildString {
            append("am broadcast -a ${broadcastType.action}")
            data.forEach { (key, value) ->
                when (value) {
                    is String -> append(" --es \"$key\" \"$value\"")
                    is Int -> append(" --ei \"$key\" $value")
                    is Enum<*> -> append(" --es \"$key\" \"${value}\"")
                    else -> throw IllegalArgumentException("Unsupported type for key '$key': ${value::class.simpleName}")
                }
            }
        }

        println("Sending broadcast: $command")

        // Open a process with the built command.
        val process = popen(command, "r")
            ?: throw RuntimeException("Failed to execute command: $command")

        pclose(process)
    }
}
