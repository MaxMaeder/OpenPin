package org.openpin.daemon

data class DaemonConfig(
    // How often to check for processes to run/clean up
    val processUpdateInterval: Long = 50,
    // What directory the client will use to communicate with the process handler
    val processHandlerDir: String = "/storage/emulated/0/Documents/daemon-channel",

    // How long after the touchpad was last active should we wait before letting the device sleep
    val sleepAfter: Long = 45 * 1000L,

    // The daemon will start this activity when the device wakes up
    val clientActivity: String? = "org.openpin.primaryapp/.MainActivity"
)
