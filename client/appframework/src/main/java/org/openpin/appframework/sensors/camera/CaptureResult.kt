package org.openpin.appframework.sensors.camera

sealed class CaptureResult<out T> {
    data class Success<T>(val data: T) : CaptureResult<T>()
    data class Failure(val error: Throwable) : CaptureResult<Nothing>()
}