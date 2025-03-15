package org.openpin.app.util

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.ImageFormat
import android.hardware.camera2.CameraCaptureSession
import android.hardware.camera2.CameraDevice
import android.hardware.camera2.CameraManager
import android.hardware.camera2.CameraMetadata
import android.hardware.camera2.CaptureRequest
import android.hardware.camera2.TotalCaptureResult
import android.media.ImageReader
import android.util.Log
import androidx.core.app.ActivityCompat
import java.io.File

class ImageCapturer(private val context: Context) {
    private var cameraDevice: CameraDevice? = null
    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager

    /**
     * Captures a JPEG image and saves it to [outputFile].
     * @param outputFile The file where the captured image should be saved.
     * @param onComplete Callback with the result of the capture: true if successful, false otherwise.
     */
    fun captureImage(outputFile: File, onComplete: (Boolean) -> Unit) {
        // Choose a back-facing camera. (This example simply uses cameraId "0".)
        val cameraId = "0"

        // Create an ImageReader for HD resolution (1920x1080) JPEG capture.
        val imageReader = ImageReader.newInstance(1920, 1080, ImageFormat.JPEG, 1)
        imageReader.setOnImageAvailableListener({ reader ->
            val image = reader.acquireLatestImage()
            if (image != null) {
                val buffer = image.planes[0].buffer
                val bytes = ByteArray(buffer.remaining())
                buffer.get(bytes)
                try {
                    outputFile.outputStream().use { it.write(bytes) }
                    Log.i("ImageCapturer", "Image captured and saved to ${outputFile.absolutePath}")
                    onComplete(true)
                } catch (e: Exception) {
                    Log.e("ImageCapturer", "Error saving image", e)
                    onComplete(false)
                } finally {
                    image.close()
                    cameraDevice?.close()
                }
            } else {
                onComplete(false)
            }
        }, null)

        // Check for CAMERA permission.
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            Log.e("ImageCapturer", "Permission not granted")
            onComplete(false)
            return
        }

        cameraManager.openCamera(cameraId, object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                cameraDevice = camera
                try {
                    camera.createCaptureSession(listOf(imageReader.surface),
                        object : CameraCaptureSession.StateCallback() {
                            override fun onConfigured(session: CameraCaptureSession) {
                                try {
                                    val captureRequestBuilder = camera.createCaptureRequest(CameraDevice.TEMPLATE_STILL_CAPTURE)
                                    captureRequestBuilder.addTarget(imageReader.surface)

                                    // Set the control modes and parameters for AF, AE, and AWB.
                                    captureRequestBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO)
                                    captureRequestBuilder.set(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE)
                                    captureRequestBuilder.set(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_ON)
                                    captureRequestBuilder.set(CaptureRequest.CONTROL_AWB_MODE, CaptureRequest.CONTROL_AWB_MODE_AUTO)

                                    // Set JPEG quality (100 = best quality).
                                    captureRequestBuilder.set(CaptureRequest.JPEG_QUALITY, 100.toByte())

                                    // Optionally, trigger autofocus explicitly.
                                    captureRequestBuilder.set(CaptureRequest.CONTROL_AF_TRIGGER, CameraMetadata.CONTROL_AF_TRIGGER_START)

                                    session.capture(captureRequestBuilder.build(), object : CameraCaptureSession.CaptureCallback() {
                                        override fun onCaptureCompleted(session: CameraCaptureSession,
                                                                        request: CaptureRequest,
                                                                        result: TotalCaptureResult) {
                                            Log.i("ImageCapturer", "Capture completed.")
                                        }
                                    }, null)
                                } catch (e: Exception) {
                                    Log.e("ImageCapturer", "Error during capture", e)
                                    onComplete(false)
                                }
                            }
                            override fun onConfigureFailed(session: CameraCaptureSession) {
                                Log.e("ImageCapturer", "Failed to configure capture session.")
                                onComplete(false)
                            }
                        }, null
                    )
                } catch (e: Exception) {
                    Log.e("ImageCapturer", "Error creating capture session", e)
                    onComplete(false)
                }
            }
            override fun onDisconnected(camera: CameraDevice) {
                camera.close()
                onComplete(false)
            }
            override fun onError(camera: CameraDevice, error: Int) {
                Log.e("ImageCapturer", "Error opening camera: $error")
                camera.close()
                onComplete(false)
            }
        }, null)
    }

    /**
     * Releases any held camera resources.
     */
    fun release() {
        cameraDevice?.close()
    }
}
