package org.openpin.daemon.input

import kotlinx.cinterop.memScoped
import kotlinx.cinterop.refTo
import kotlinx.cinterop.toKString
import platform.posix.fgets
import platform.posix.pclose
import platform.posix.popen

// Encapsulates the logic to parse log lines and read events.
class InputEventReader(private val inputDevice: String = "/dev/input/event1") {

    // Parses a single log line into an InputEvent.
    fun parseEventLine(line: String): InputEvent? {
        val tokens = line.trim().split(Regex("\\s+"))
        if (tokens.size < 3) return null
        return InputEvent(tokens[0], tokens[1], tokens[2])
    }

    // Lazily reads events from getevent -l using the specified device and yields InputEvent objects.
    @OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
    fun readEvents(): Sequence<InputEvent> = sequence {
        val command = "getevent -l $inputDevice"
        val process = popen(command, "r") ?: error("Failed to start process")
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
