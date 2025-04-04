package org.openpin.daemon.util

import kotlinx.cinterop.addressOf
import kotlinx.cinterop.convert
import kotlinx.cinterop.usePinned
import platform.posix.*
import kotlin.system.getTimeMillis

object SystemUtils {
    @Suppress("DEPRECATION")
    fun getMillis(): Long = getTimeMillis()

    // Execute a command via popen() and return its exit code.
    @OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
    fun executeCommand(command: String): Int {
        val fp = popen(command, "r") ?: throw Exception("popen() failed for command: $command")
        val exitCode = pclose(fp)
        if (exitCode == -1) {
            throw Exception("Error while closing command: $command")
        }
        return (exitCode shr 8) and 0xFF
    }

    // Read the entire text content of a file.
    @OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
    fun readFile(path: String): String {
        // Open the file for reading.
        val file = fopen(path, "r") ?: throw Exception("Could not open file: $path")

        try {
            // Move to the end of the file to get its size.
            if (fseek(file, 0, SEEK_END) != 0) {
                throw Exception("fseek failed on file: $path")
            }


            val size = ftell(file)
            if (size < 0) {
                throw Exception("ftell failed on file: $path")
            }
            rewind(file)

            // If the file is empty, return an empty string.
            if (size == 0L) {
                return ""
            }

            // Create a buffer to hold the file content.
            val byteCount = size.toInt()
            val bytes = ByteArray(byteCount)
            bytes.usePinned { pinned ->
                val readBytes = fread(pinned.addressOf(0), 1.convert(), size.convert(), file)
                if (readBytes.toLong() != size) {
                    throw Exception("Failed to read entire file: $path")
                }
            }
            return bytes.decodeToString()
        } finally {
            fclose(file)
        }
    }

    fun deleteFile(path: String): Boolean {
        return remove(path) == 0
    }
}