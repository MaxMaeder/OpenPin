package org.openpin.appframework.sensors.camera

/**
 * A capture session interface.
 * The waitForResult suspend function will complete when the capture operation finalizes.
 */
interface CaptureSession<T> {
    suspend fun waitForResult(): CaptureResult<T>
    fun stop()
}