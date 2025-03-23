package org.openpin.appframework.sensors.microphone

import java.io.File

interface RecordSession {
    fun stop()
    val result: File
}