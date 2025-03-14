package org.openpin.app.daemonbridge

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.provider.Settings
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileWriter
import java.io.IOException
import java.util.UUID
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

/**
 * ProcessRunner handles the daemon channel setup. The init() method takes care of:
 * - Requesting external storage permission,
 * - Creating the necessary directories,
 * - And registering the DaemonReceiver.
 */
class ProcessRunner(private val context: Context) {
    private lateinit var baseDir: File
    private lateinit var activeProcessesFile: File
    private val activeProcesses = mutableSetOf<String>()

    /**
     * Performs all initialization:
     * 1. Requests external storage permission.
     * 2. Creates the directories.
     * 3. Registers the DaemonReceiver.
     *
     * Note: This should be called after the Activity is started.
     */
    fun init() {
        initPermissions()
        if (Environment.isExternalStorageManager()) {
            initDirectories()
        } else {
            Log.w("ProcessRunner", "External storage permission not granted. Please grant permission and call init() again.")
        }
    }

    /**
     * Launches the intent to request external storage management permission.
     */
    fun initPermissions() {
        if (!Environment.isExternalStorageManager()) {
            val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
                data = Uri.parse("package:${context.packageName}")
            }
            context.startActivity(intent)
        }
    }

    /**
     * Creates required directories and registers the DaemonReceiver.
     */
    private fun initDirectories() {
        baseDir = File(
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS),
            "daemon-channel"
        )
        if (!baseDir.exists()) {
            baseDir.mkdirs()
        }
        activeProcessesFile = File(baseDir, "active-processes.txt")
        DaemonReceiver.register(context)
    }

    /**
     * Generates a ShellProcess instance. The lambda parameter allows later customization
     * (for example, to pass a subclass of ShellProcess).
     */
    fun <T : ShellProcess> generateProcess(creator: ProcessRunner.() -> T): T {
        return creator()
    }

    /**
     * Creates (or returns) an auxiliary file in the correct directory.
     * This file is created in the "processes" subdirectory under the base directory.
     */
    fun createAuxFile(name: String): File {
        val processesDir = File(baseDir, "processes")
        if (!processesDir.exists()) {
            processesDir.mkdirs()
        }
        return File(processesDir, name)
    }

    /**
     * Deletes the provided file. Returns true if deletion was successful.
     */
    fun deleteAuxFile(file: File): Boolean {
        return if (file.exists()) {
            file.delete()
        } else {
            false
        }
    }

    /**
     * Base (open) ShellProcess class.
     * Extend this class to create specialized process wrappers.
     */
    open inner class ShellProcess {
        var command: String = ""
        val pid: String = UUID.randomUUID().toString()
        var output: String = ""
            protected set
        var error: String = ""
            protected set

//        /**
//         * Sets the shell command to execute.
//         */
//        fun setCommand(cmd: String) {
//            command = cmd
//        }

        /**
         * Executes the process:
         * 1. Writes the command file to (base)/processes/{pid}-cmd.txt.
         * 2. Adds the pid to active processes and updates active-processes.txt.
         * 3. Suspends until a PROCESS_DONE intent with matching pid is received.
         * 4. Reads the output and error files.
         */
        suspend fun execute(): ShellProcess = withContext(Dispatchers.IO) {
            val processesDir = File(baseDir, "processes")
            if (!processesDir.exists()) {
                processesDir.mkdirs()
            }
            val cmdFile = File(processesDir, "$pid-cmd.txt")
            Log.e("Runner", "Written to: ${cmdFile.absolutePath}")
            try {
                FileWriter(cmdFile).use { writer ->
                    writer.write(command)
                }
            } catch (e: IOException) {
                throw e
            }
            activeProcesses.add(pid)
            updateActiveProcessesFile()

            suspendCoroutine<ShellProcess> { cont ->
                DaemonReceiver.registerCallback(
                    intentType = DaemonIntentType.PROCESS_DONE,
                    filter = mapOf("pid" to pid),
                    once = true
                ) { intent ->
                    Log.e("Runner", "Was done")
                    val outFile = File(processesDir, "$pid-out.txt")
                    val errFile = File(processesDir, "$pid-error.txt")
                    output = if (outFile.exists()) outFile.readText() else ""
                    error = if (errFile.exists()) errFile.readText() else ""
                    cont.resume(this@ShellProcess) // Explicitly refer to the outer ShellProcess.
                }
            }
        }

        /**
         * Releases this process by removing its pid from active processes.
         */
        fun release() {
            Log.e("Runner", "Released")
            activeProcesses.remove(pid)
            updateActiveProcessesFile()
        }
    }

    private fun updateActiveProcessesFile() {
        Log.e("Runner", "will up")
        try {
            FileWriter(activeProcessesFile, false).use { writer ->
                activeProcesses.forEach { writer.write("$it\n") }
            }
            Log.e("Runner", "did up")
        } catch (e: IOException) {
            Log.e("ProcessRunner", "Error updating active processes file", e)
        }
    }
}
