package org.openpin.appframework.daemonbridge.power

import android.os.Bundle
import org.openpin.appframework.daemonbridge.manager.DaemonFileSystem
import org.openpin.appframework.daemonbridge.manager.DaemonIntentReceiver
import java.io.Closeable
import java.io.File

class PowerHandler : DaemonIntentReceiver, Closeable {

    private lateinit var fileSystem: DaemonFileSystem
    private lateinit var wakelockFile: File

    override fun setFileSystem(fileSystem: DaemonFileSystem) {
        this.fileSystem = fileSystem
        wakelockFile = fileSystem.get("wakelock.txt")
    }

    override fun onReceive(extras: Bundle?) {
        // No-op, there are no power intents to receive
    }

    fun setWakelock(enabled: Boolean) {
        // Ensure the file exists
        if (!wakelockFile.exists()) {
            wakelockFile.createNewFile()
        }

        // Write "true" or "false" based on the parameter
        wakelockFile.writeText(enabled.toString())
    }

    override fun close() {
        // No-op, nothing to close
    }
}