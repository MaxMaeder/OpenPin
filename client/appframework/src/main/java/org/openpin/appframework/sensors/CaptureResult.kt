package org.openpin.appframework.sensors

sealed class CaptureResult<out T> {
    data class Success<T>(val data: T) : CaptureResult<T>()
    data class Failure(val error: Throwable) : CaptureResult<Nothing>()
}