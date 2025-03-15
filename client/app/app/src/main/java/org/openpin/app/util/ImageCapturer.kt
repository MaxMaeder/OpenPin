package org.openpin.app.util

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.ImageFormat
import android.hardware.camera2.CameraCaptureSession
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraDevice
import android.hardware.camera2.CameraManager
import android.hardware.camera2.CameraMetadata
import android.hardware.camera2.CaptureRequest
import android.hardware.camera2.TotalCaptureResult
import android.media.ImageReader
import android.util.Log
import androidx.core.app.ActivityCompat
import java.io.File
import java.nio.ByteBuffer

/**
 * Helper class for capturing images using the Camera2 API.
 */
class ImageCapturer(private val context: Context) {
    private var cameraDevice: CameraDevice? = null
    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager

    /**
     * Captures a JPEG image and saves it to [outputFile].
     * @param outputFile The file where the captured image should be saved.
     * @param onComplete Callback with the result of the capture: true if successful, false otherwise.
     */
    fun captureImage(outputFile: File, onComplete: (Boolean) -> Unit) {
        // Choose a back-facing camera.
        var cameraId: String? = null
        for (id in cameraManager.cameraIdList) {
            val characteristics = cameraManager.getCameraCharacteristics(id)
            val lensFacing = characteristics.get(CameraCharacteristics.LENS_FACING)
            if (lensFacing != null && lensFacing == CameraCharacteristics.LENS_FACING_BACK) {
                cameraId = id
                break
            }
        }
        if (cameraId == null) {
            Log.e("ImageCapturer", "No back camera found")
            onComplete(false)
            return
        }

        // Create an ImageReader to receive the JPEG image.
        val imageReader = ImageReader.newInstance(640, 480, ImageFormat.JPEG, 1)
        imageReader.setOnImageAvailableListener({ reader ->
            val image = reader.acquireLatestImage()
            if (image != null) {
                val buffer: ByteBuffer = image.planes[0].buffer
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

        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            Log.e("ImageCapturer", "Permission not granted")
            onComplete(false)
            return
        }

        cameraManager.openCamera(cameraId, object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                cameraDevice = camera
                try {
                    camera.createCaptureSession(
                        listOf(imageReader.surface),
                        object : CameraCaptureSession.StateCallback() {
                            override fun onConfigured(session: CameraCaptureSession) {
                                try {
                                    val captureRequestBuilder = camera.createCaptureRequest(
                                        CameraDevice.TEMPLATE_STILL_CAPTURE)
                                    captureRequestBuilder.addTarget(imageReader.surface)
                                    captureRequestBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO)
                                    session.capture(
                                        captureRequestBuilder.build(),
                                        object : CameraCaptureSession.CaptureCallback() {
                                            override fun onCaptureCompleted(
                                                session: CameraCaptureSession,
                                                request: CaptureRequest,
                                                result: TotalCaptureResult
                                            ) {
                                                Log.i("ImageCapturer", "Capture completed.")
                                            }
                                        },
                                        null
                                    )
                                } catch (e: Exception) {
                                    Log.e("ImageCapturer", "Error during capture", e)
                                    onComplete(false)
                                }
                            }
                            override fun onConfigureFailed(session: CameraCaptureSession) {
                                Log.e("ImageCapturer", "Failed to configure capture session.")
                                onComplete(false)
                            }
                        },
                        null
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