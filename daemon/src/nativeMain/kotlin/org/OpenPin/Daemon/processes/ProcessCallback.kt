package org.openpin.daemon.processes

// Callback interface for process completion.
interface ProcessCallback {
    fun onProcessFinished(uuid: String)
}