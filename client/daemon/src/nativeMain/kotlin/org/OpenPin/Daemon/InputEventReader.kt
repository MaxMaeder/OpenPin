package org.OpenPin.Daemon

import kotlinx.cinterop.memScoped
import kotlinx.cinterop.refTo
import kotlinx.cinterop.toKString
import platform.posix.fgets
import platform.posix.pclose
import platform.posix.popen

// Data class representing an input event.
data class InputEvent(val device: String, val type: String, val code: String, val value: String)

// Encapsulates the logic to parse log lines and read events.
class InputEventReader {
    // Parses a single log line into an InputEvent.
    fun parseEventLine(line: String): InputEvent? {
        val parts = line.split(":")
        if (parts.size < 2) return null
        val device = parts[0].trim()
        val tokens = parts[1].trim().split(Regex("\\s+"))
        if (tokens.size < 3) return null
        return InputEvent(device, tokens[0], tokens[1], tokens[2])
    }

    // Lazily reads events from "getevent -l" and yields InputEvent objects.
    @OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
    fun readEvents(): Sequence<InputEvent> = sequence {
        val process = popen("getevent -l", "r") ?: error("Failed to start process")
        try {
            memScoped {
                val buffer = ByteArray(1024)
                while (fgets(buffer.refTo(0), buffer.size, process) != null) {
                    val line = buffer.toKString()
                    parseEventLine(line)?.let { yield(it) }
                }
            }
        } finally {
            pclose(process)
        }
    }
}