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

    // Use a member Handler and store the pending Runnable so that we can cancel it if needed.
    private val handler = Handler(Looper.getMainLooper())
    private var pendingCaptureRunnable: Runnable? = null

    // Flag to ensure onComplete is called only once.
    @Volatile private var captureCompleted = false

    /**
     * Captures a JPEG image using the specified camera after waiting for AE/AF convergence.
     *
     * @param cameraId The camera ID to open (e.g., "0" for back, "1" for front).
     * @param convergeDelayMs The time in milliseconds to wait for AE/AF to converge.
     * @param resolution The desired capture resolution (default 1920×1080).
     * @param jpegQuality The JPEG quality (0–100, default is 100).
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
        // Cancel any pending capture from a previous operation and release resources.
        cancelPendingCapture()
        release()
        captureCompleted = false
        isConverging = true  // Reset state

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
                // Discard frames during AE/AF convergence.
                reader.acquireLatestImage()?.close()
            }
        }, null)

        // Check CAMERA permission.
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED
        ) {
            Log.e("ImageCapturer", "Camera permission not granted.")
            if (!captureCompleted) {
                captureCompleted = true
                onComplete(false)
            }
            return
        }

        val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        cameraManager.openCamera(cameraId, object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                cameraDevice = camera
                createCaptureSession(camera, imageReader, convergeDelayMs, jpegQuality, onComplete)
            }

            override fun onDisconnected(camera: CameraDevice) {
                camera.close()
                if (!captureCompleted) {
                    captureCompleted = true
                    onComplete(false)
                }
            }

            override fun onError(camera: CameraDevice, error: Int) {
                Log.e("ImageCapturer", "Error opening camera: $error")
                camera.close()
                if (!captureCompleted) {
                    captureCompleted = true
                    onComplete(false)
                }
            }
        }, null)
    }

    // Helper: Builds a CaptureRequest with AE, AF, AWB and optional JPEG quality.
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

    // Helper: Sets up the capture session and issues a reset to cancel any stale AE/AF triggers.
    private fun createCaptureSession(
        camera: CameraDevice,
        imageReader: ImageReader,
        convergeDelayMs: Long,
        jpegQuality: Int,
        onComplete: (Boolean) -> Unit
    ) {
        try {
            camera.createCaptureSession(
                listOf(imageReader.surface),
                object : CameraCaptureSession.StateCallback() {
                    override fun onConfigured(session: CameraCaptureSession) {
                        captureSession = session
                        // Issue a reset capture to cancel any previous AE/AF triggers.
                        val resetRequest = buildCaptureRequest(camera, CameraDevice.TEMPLATE_PREVIEW, imageReader, jpegQuality)
                            .apply {
                                set(CaptureRequest.CONTROL_AE_PRECAPTURE_TRIGGER, CameraMetadata.CONTROL_AE_PRECAPTURE_TRIGGER_CANCEL)
                                set(CaptureRequest.CONTROL_AF_TRIGGER, CameraMetadata.CONTROL_AF_TRIGGER_CANCEL)
                            }
                            .build()
                        session.capture(resetRequest, object : CameraCaptureSession.CaptureCallback() {
                            override fun onCaptureCompleted(
                                session: CameraCaptureSession,
                                request: CaptureRequest,
                                result: TotalCaptureResult
                            ) {
                                // Now start the preview repeating request.
                                startPreview(session, camera, imageReader, convergeDelayMs, jpegQuality, onComplete)
                            }
                        }, handler)
                    }

                    override fun onConfigureFailed(session: CameraCaptureSession) {
                        Log.e("ImageCapturer", "Failed to configure capture session.")
                        if (!captureCompleted) {
                            captureCompleted = true
                            onComplete(false)
                        }
                    }
                },
                null
            )
        } catch (e: Exception) {
            Log.e("ImageCapturer", "Error creating capture session", e)
            if (!captureCompleted) {
                captureCompleted = true
                onComplete(false)
            }
        }
    }

    // Helper: Starts a preview request (without a UI) so that AE/AF can reconverge,
    // then triggers the AE precapture sequence before the final capture.
    private fun startPreview(
        session: CameraCaptureSession,
        camera: CameraDevice,
        imageReader: ImageReader,
        convergeDelayMs: Long,
        jpegQuality: Int,
        onComplete: (Boolean) -> Unit
    ) {
        val previewRequest = buildCaptureRequest(camera, CameraDevice.TEMPLATE_PREVIEW, imageReader)
            .build()
        session.setRepeatingRequest(previewRequest, null, null)

        pendingCaptureRunnable = Runnable {
            if (cameraDevice == null || captureSession == null) {
                Log.e("ImageCapturer", "Camera device or session is null; skipping capture.")
                if (!captureCompleted) {
                    captureCompleted = true
                    onComplete(false)
                }
                return@Runnable
            }
            try {
                session.stopRepeating()
            } catch (e: IllegalStateException) {
                Log.e("ImageCapturer", "Failed to stop repeating; session might be closed", e)
                if (!captureCompleted) {
                    captureCompleted = true
                    onComplete(false)
                }
                return@Runnable
            }
            // Trigger AE precapture by issuing a capture with the AE_PRECAPTURE_TRIGGER set.
            val precaptureRequest = buildCaptureRequest(camera, CameraDevice.TEMPLATE_PREVIEW, imageReader, jpegQuality)
                .apply {
                    set(CaptureRequest.CONTROL_AE_PRECAPTURE_TRIGGER, CameraMetadata.CONTROL_AE_PRECAPTURE_TRIGGER_START)
                }
                .build()
            session.capture(precaptureRequest, object : CameraCaptureSession.CaptureCallback() {
                override fun onCaptureCompleted(
                    session: CameraCaptureSession,
                    request: CaptureRequest,
                    result: TotalCaptureResult
                ) {
                    Log.i("ImageCapturer", "AE precapture sequence completed.")

                    handler.postDelayed({
                        captureFinalImage(session, camera, imageReader, jpegQuality)
                    }, 100)
                }
            }, null)
        }
        handler.postDelayed(pendingCaptureRunnable!!, convergeDelayMs)
    }

    // Helper: Issues the still capture request.
    private fun captureFinalImage(
        session: CameraCaptureSession,
        camera: CameraDevice,
        imageReader: ImageReader,
        jpegQuality: Int
    ) {
        isConverging = false
        val captureRequest = buildCaptureRequest(camera, CameraDevice.TEMPLATE_STILL_CAPTURE, imageReader, jpegQuality)
            .build()
        session.capture(
            captureRequest,
            object : CameraCaptureSession.CaptureCallback() {
                override fun onCaptureCompleted(
                    session: CameraCaptureSession,
                    request: CaptureRequest,
                    result: TotalCaptureResult
                ) {
                    Log.i("ImageCapturer", "Final capture completed.")
                    // The ImageReader listener handles the final image and calls onComplete.
                }
            },
            null
        )
    }

    // Helper: Saves the final captured image and ensures onComplete is called only once.
    private fun handleFinalImage(
        reader: ImageReader,
        outputFile: File,
        onComplete: (Boolean) -> Unit
    ) {
        if (captureCompleted) return

        val image = reader.acquireLatestImage()
        if (image != null) {
            val buffer: ByteBuffer = image.planes[0].buffer
            val bytes = ByteArray(buffer.remaining())
            buffer.get(bytes)
            image.close()
            try {
                outputFile.outputStream().use { it.write(bytes) }
                Log.i("ImageCapturer", "Image saved to ${outputFile.absolutePath}")
                captureCompleted = true
                onComplete(true)
            } catch (e: Exception) {
                Log.e("ImageCapturer", "Error saving image", e)
                captureCompleted = true
                onComplete(false)
            } finally {
                reader.setOnImageAvailableListener(null, null)
                release()
            }
        } else {
            captureCompleted = true
            onComplete(false)
        }
    }

    // Helper: Cancels any pending delayed capture.
    private fun cancelPendingCapture() {
        pendingCaptureRunnable?.let { handler.removeCallbacks(it) }
        pendingCaptureRunnable = null
    }

    /**
     * Releases any active capture session and camera device.
     */
    fun release() {
        cancelPendingCapture()
        captureSession?.close()
        captureSession = null
        cameraDevice?.close()
        cameraDevice = null
    }
}
