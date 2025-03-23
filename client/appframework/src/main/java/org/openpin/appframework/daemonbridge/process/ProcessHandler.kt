package org.openpin.appframework.daemonbridge.process

import android.os.Bundle
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.openpin.appframework.daemonbridge.manager.DaemonFileSystem
import org.openpin.appframework.daemonbridge.manager.DaemonIntentReceiver
import java.io.Closeable
import java.io.File
import java.io.FileWriter
import java.io.IOException
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import kotlin.coroutines.Continuation
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

class ProcessHandler : DaemonIntentReceiver, Closeable {

    private lateinit var fileSystem: DaemonFileSystem
    private lateinit var activeProcessesFile: File
    private val activeProcesses = mutableSetOf<String>()

    private data class WaitingProcess(
        val process: ShellProcess,
        val continuation: Continuation<ShellProcess>
    )

    private val waiting = ConcurrentHashMap<String, WaitingProcess>()

    override fun setFileSystem(fileSystem: DaemonFileSystem) {
        this.fileSystem = fileSystem
        activeProcessesFile = fileSystem.get("active-processes.txt")
    }

    override fun onReceive(extras: Bundle?) {
        val pid = extras?.getString("pid") ?: return
        val entry = waiting.remove(pid) ?: return

        val outFile = fileSystem.get("processes/$pid-out.txt")
        val errFile = fileSystem.get("processes/$pid-error.txt")

        entry.process.output = outFile.takeIf { it.exists() }?.readText().orEmpty()
        entry.process.error = errFile.takeIf { it.exists() }?.readText().orEmpty()

        entry.continuation.resume(entry.process)
    }

    suspend fun execute(process: ShellProcess): ShellProcess = withContext(Dispatchers.IO) {
        val pid = UUID.randomUUID().toString()
        process.pid = pid

        val cmdFile = fileSystem.get("processes/$pid-cmd.txt")
        cmdFile.parentFile?.mkdirs()

        try {
            FileWriter(cmdFile).use { it.write(process.command) }
        } catch (e: IOException) {
            throw e
        }

        activeProcesses.add(pid)
        updateActiveProcessesFile()

        suspendCoroutine { cont ->
            waiting[pid] = WaitingProcess(process, cont)
        }
    }

    fun release(process: ShellProcess) {
        val pid = process.pid
        activeProcesses.remove(pid)
        updateActiveProcessesFile()

        listOf(
            "processes/$pid-cmd.txt",
            "processes/$pid-out.txt",
            "processes/$pid-error.txt"
        ).map { fileSystem.get(it) }.forEach { file ->
            if (file.exists()) {
                file.delete()
            }
        }
    }

    override fun close() {
        waiting.clear()
        activeProcesses.clear()
        updateActiveProcessesFile()
    }

    private fun updateActiveProcessesFile() {
        try {
            FileWriter(activeProcessesFile, false).use { writer ->
                activeProcesses.forEach { writer.write("$it\n") }
            }
        } catch (e: IOException) {
            Log.e("ProcessHandler", "Failed to update active-processes.txt", e)
        }
    }
}
