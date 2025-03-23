package org.openpin.appframework.daemonbridge.manager

import android.os.Environment
import java.io.File

class DaemonFileSystem {

    private val baseDir: File = File(
        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS),
        "daemon-channel"
    )

    init {
        if (!baseDir.exists()) {
            baseDir.mkdirs()
        }
    }

    /**
     * Returns a File object relative to the base directory.
     * For example, get("logs/output.txt") will return a File at:
     * /storage/emulated/0/Documents/daemon-channel/logs/output.txt
     */
    fun get(path: String): File {
        return File(baseDir, path)
    }
}