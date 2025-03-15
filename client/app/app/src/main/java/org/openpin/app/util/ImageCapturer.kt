package org.openpin.app.util

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.ImageFormat
import android.hardware.camera2.*
import android.media.ImageReader
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.util.Size
import androidx.core.app.ActivityCompat
import java.io.File
import java.nio.ByteBuffer

class ImageCapturer(private val context: Context) {

    private var cameraDevice: CameraDevice? = null
    private var captureSession: CameraCaptureSession? = null
    @Volatile private var isConverging = true

    /**
     * Captures a JPEG image using the specified camera after waiting for AE/AF convergence.
     *
     * @param cameraId The camera ID to open (e.g., "0" for back, "1" for front).
     * @param convergeDelayMs The time in milliseconds to wait for AE/AF to converge.
     * @param resolution The desired capture resolution (default 1920×1080).
     * @param jpegQuality The JPEG quality (0-100, default is 100).
     * @param outputFile The file where the final JPEG image will be saved.
     * @param onComplete Callback indicating success (true) or failure (false).
     */
    fun captureImage(
        cameraId: String,
        convergeDelayMs: Long,
        resolution: Size = Size(1920, 1080),
        jpegQuality: Int = 100,
        outputFile: File,
        onComplete: (Boolean) -> Unit
    ) {
        // Create an ImageReader for the desired resolution.
        val imageReader = ImageReader.newInstance(
            resolution.width,
            resolution.height,
            ImageFormat.JPEG,
            3
        )
        imageReader.setOnImageAvailableListener({ reader ->
            if (!isConverging) {
                handleFinalImage(reader, outputFile, onComplete)
            } else {
                // Discard frames during convergence.
                reader.acquireLatestImage()?.close()
            }
        }, null)

        // Check CAMERA permission.
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED
        ) {
            Log.e("ImageCapturer", "Camera permission not granted.")
            onComplete(false)
            return
        }

        val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        cameraManager.openCamera(cameraId, object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                cameraDevice = camera
                createCaptureSession(camera, imageReader, convergeDelayMs, jpegQuality, outputFile, onComplete)
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

    // Private method to build a CaptureRequest with standard AE, AF, AWB settings.
    private fun buildCaptureRequest(
        camera: CameraDevice,
        template: Int,
        imageReader: ImageReader,
        jpegQuality: Int = 100
    ): CaptureRequest.Builder {
        return camera.createCaptureRequest(template).apply {
            addTarget(imageReader.surface)
            set(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE)
            set(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_ON)
            set(CaptureRequest.CONTROL_AWB_MODE, CaptureRequest.CONTROL_AWB_MODE_AUTO)
            if (template == CameraDevice.TEMPLATE_STILL_CAPTURE) {
                set(CaptureRequest.JPEG_QUALITY, jpegQuality.toByte())
            }
        }
    }

    // Sets up the capture session.
    private fun createCaptureSession(
        camera: CameraDevice,
        imageReader: ImageReader,
        convergeDelayMs: Long,
        jpegQuality: Int,
        outputFile: File,
        onComplete: (Boolean) -> Unit
    ) {
        try {
            camera.createCaptureSession(
                listOf(imageReader.surface),
                object : CameraCaptureSession.StateCallback() {
                    override fun onConfigured(session: CameraCaptureSession) {
                        captureSession = session
                        startPreview(session, camera, imageReader, convergeDelayMs, jpegQuality, outputFile, onComplete)
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

    // Starts a "preview" request (without UI) to allow AE/AF convergence.
    private fun startPreview(
        session: CameraCaptureSession,
        camera: CameraDevice,
        imageReader: ImageReader,
        convergeDelayMs: Long,
        jpegQuality: Int,
        outputFile: File,
        onComplete: (Boolean) -> Unit
    ) {
        val previewRequest = buildCaptureRequest(camera, CameraDevice.TEMPLATE_PREVIEW, imageReader)
            .build()
        session.setRepeatingRequest(previewRequest, null, null)

        // Wait for the specified delay before capturing the final image.
        Handler(Looper.getMainLooper()).postDelayed({
            session.stopRepeating()
            captureFinalImage(session, camera, imageReader, jpegQuality)
        }, convergeDelayMs)
    }

    // Issues a still capture request.
    private fun captureFinalImage(
        session: CameraCaptureSession,
        camera: CameraDevice,
        imageReader: ImageReader,
        jpegQuality: Int
    ) {
        isConverging = false
        val captureRequest = buildCaptureRequest(
            camera,
            CameraDevice.TEMPLATE_STILL_CAPTURE,
            imageReader,
            jpegQuality
        ).build()
        session.capture(
            captureRequest,
            object : CameraCaptureSession.CaptureCallback() {
                override fun onCaptureCompleted(
                    session: CameraCaptureSession,
                    request: CaptureRequest,
                    result: TotalCaptureResult
                ) {
                    Log.i("ImageCapturer", "Final capture completed.")
                    // The ImageReader's listener handles calling onComplete.
                }
            },
            null
        )
    }

    // Handles saving the final captured image.
    private fun handleFinalImage(reader: ImageReader, outputFile: File, onComplete: (Boolean) -> Unit) {
        val image = reader.acquireLatestImage()
        if (image != null) {
            val buffer: ByteBuffer = image.planes[0].buffer
            val bytes = ByteArray(buffer.remaining())
            buffer.get(bytes)
            image.close()
            try {
                outputFile.outputStream().use { it.write(bytes) }
                Log.i("ImageCapturer", "Image saved to ${outputFile.absolutePath}")
                onComplete(true)
            } catch (e: Exception) {
                Log.e("ImageCapturer", "Error saving image", e)
                onComplete(false)
            } finally {
                cameraDevice?.close()
            }
        } else {
            onComplete(false)
        }
    }

    /**
     * Releases any active capture session and camera device.
     */
    fun release() {
        captureSession?.close()
        cameraDevice?.close()
    }
}
