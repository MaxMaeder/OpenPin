package org.openpin.appframework.daemonbridge.manager

import android.os.Bundle

interface DaemonIntentReceiver {
    fun onReceive(extras: Bundle?)
    fun setFileSystem(fileSystem: DaemonFileSystem)
}