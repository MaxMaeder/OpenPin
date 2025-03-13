package org.OpenPin.Daemon

import kotlinx.coroutines.*
import platform.posix.*

// Callback interface for process completion.
interface ProcessCallback {
    fun onProcessFinished(uuid: String)
}

// The ProcessManager monitors the active-processes file and manages process tasks.
class ProcessManager(
    private val directory: String,
    private val checkIntervalMillis: Long = 50,
    private val callback: ProcessCallback
) {
    // Set of currently active UUIDs.
    private val activeProcesses = mutableSetOf<String>()
    // Create a CoroutineScope for launching tasks.
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    // Derived paths.
    private val processesDir = "$directory/processes"
    private val activeProcessesFile = "$directory/active-processes.txt"

    // Start the monitoring loop.
    fun start() {
        scope.launch {
            while (isActive) {
                val startTime = SystemUtils.getMillis()
                try {
                    // Read the current set of active process uuids.
                    val uuids = readActiveProcesses()

                    // For each new uuid, start processing it.
                    for (uuid in uuids) {
                        if (!activeProcesses.contains(uuid)) {
                            activeProcesses.add(uuid)
                            processUuid(uuid)
                        }
                    }

                    // For uuids no longer present, clean up their files.
                    val removed = activeProcesses.filter { it !in uuids }
                    for (uuid in removed) {
                        cleanupProcess(uuid)
                        activeProcesses.remove(uuid)
                    }
                } catch (e: Exception) {
                    println("Error while monitoring: ${e.message}")
                }
                val elapsed = SystemUtils.getMillis() - startTime
                if (elapsed < checkIntervalMillis) {
                    delay(checkIntervalMillis - elapsed)
                }
            }
        }
    }

    // Launch a coroutine to process a single uuid.
    private fun processUuid(uuid: String) = scope.launch(Dispatchers.IO) {
        val cmdFilePath = "$processesDir/${uuid}-cmd.txt"
        val outFilePath = "$processesDir/${uuid}-out.txt"
        val errFilePath = "$processesDir/${uuid}-err.txt"
        try {
            // Read the command from the file.
            val command = SystemUtils.readFile(cmdFilePath).trim()
            // Append redirection to capture stdout and stderr into separate files.
            val fullCommand = "$command > \"$outFilePath\" 2> \"$errFilePath\""
            println("Executing command for uuid $uuid: $fullCommand")
            // Execute the command using popen() and wait for it to finish.
            val exitCode = executeCommand(fullCommand)
            println("Command for uuid $uuid finished with exit code $exitCode")
        } catch (e: Exception) {
            println("Error processing uuid $uuid: ${e.message}")
        } finally {
            // Notify via the callback that processing is finished.
            callback.onProcessFinished(uuid)
        }
    }

    // Clean up the command, output, and error files for a given uuid.
    private fun cleanupProcess(uuid: String) {
        try {
            SystemUtils.deleteFile("$processesDir/${uuid}-cmd.txt")
            SystemUtils.deleteFile("$processesDir/${uuid}-out.txt")
            SystemUtils.deleteFile("$processesDir/${uuid}-err.txt")
            println("Cleaned up files for uuid $uuid")
        } catch (e: Exception) {
            println("Error cleaning up uuid $uuid: ${e.message}")
        }
    }

    // Reads active-processes.txt and returns a set of UUIDs.
    private fun readActiveProcesses(): Set<String> {
        val content = SystemUtils.readFile(activeProcessesFile)
        return content.lines().filter { it.isNotBlank() }.toSet()
    }

    // Execute a command via popen() and return its exit code.
    @OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
    private fun executeCommand(command: String): Int {
        val fp = popen(command, "r") ?: throw Exception("popen() failed for command: $command")
        val exitCode = pclose(fp)
        if (exitCode == -1) {
            throw Exception("Error while closing command: $command")
        }
        return (exitCode shr 8) and 0xFF
    }

    // Stop the monitoring loop and cancel all child coroutines.
    fun stop() {
        scope.cancel()
    }
}
