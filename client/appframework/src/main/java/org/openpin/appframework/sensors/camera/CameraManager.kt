package org.openpin.appframework.sensors.camera

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.SurfaceTexture
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.view.Surface
import androidx.camera.camera2.Camera2Config
import androidx.camera.core.CameraSelector
import androidx.camera.core.CameraXConfig
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.core.UseCase
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.FileOutputOptions
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.camera.video.VideoRecordEvent
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.zxing.BarcodeFormat
import com.google.zxing.BinaryBitmap
import com.google.zxing.DecodeHintType
import com.google.zxing.MultiFormatReader
import com.google.zxing.NotFoundException
import com.google.zxing.PlanarYUVLuminanceSource
import com.google.zxing.common.HybridBinarizer
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.suspendCancellableCoroutine
import org.openpin.appframework.sensors.CaptureResult
import org.openpin.appframework.sensors.CaptureSession
import java.io.File
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import kotlin.coroutines.resume

class CameraManager
    (
    private val context: Context,
    private val lifecycleOwner: LifecycleOwner,
    private val cameraConfig: CameraConfig = CameraConfig()
) {
    private val cameraExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())

    private var cameraProvider: ProcessCameraProvider? = null

    init {
        val config: CameraXConfig = CameraXConfig.Builder.fromConfig(Camera2Config.defaultConfig())
            .setAvailableCamerasLimiter(CameraSelector.DEFAULT_BACK_CAMERA)
            .build()
        ProcessCameraProvider.configureInstance(config)

        val future = ProcessCameraProvider.getInstance(context)
        future.addListener({
            cameraProvider = future.get()
        }, ContextCompat.getMainExecutor(context))
    }

    // --- Public Methods ---

    /**
     * Captures a still image.
     *
     * @param outputFile Where the image will be saved.
     * @param captureConfig Optional config override; if null, uses cameraConfig.defaultImageCaptureConfig.
     * @return A [CaptureResult] with the [Uri] on success or an exception on failure.
     */
    suspend fun captureImage(
        outputFile: File,
        captureConfig: ImageCaptureConfig? = null
    ): CaptureResult<Uri> = suspendCancellableCoroutine { cont ->
        val config = captureConfig ?: cameraConfig.defaultImageCaptureConfig
        val imageCapture = buildImageCapture(config)
        val preview = buildPreview()
        openCameraForUseCases(preview, imageCapture) { provider ->
            val outputOptions = ImageCapture.OutputFileOptions.Builder(outputFile).build()
            imageCapture.takePicture(
                outputOptions,
                ContextCompat.getMainExecutor(context),
                object : ImageCapture.OnImageSavedCallback {
                    override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                        val uri = output.savedUri ?: Uri.fromFile(outputFile)
                        if (cont.isActive) cont.resume(CaptureResult.Success(uri))
                        provider.unbindAll()
                    }

                    override fun onError(exception: ImageCaptureException) {
                        if (cont.isActive) cont.resume(CaptureResult.Failure(exception))
                        provider.unbindAll()
                    }
                }
            )
        }
    }


    /**
     * Captures a video.
     *
     * @param outputFile Where the video will be saved.
     * @param duration Optional maximum duration in milliseconds.
     *                 If null, recording continues until stopped manually.
     * @param captureConfig Optional config override; if null, uses cameraConfig.defaultVideoCaptureConfig.
     * @return A [CaptureSession] that lets you wait for the final [CaptureResult] (with the [Uri]) or stop early.
     */
    @SuppressLint("MissingPermission")
    fun captureVideo(
        outputFile: File,
        duration: Long?,
        captureConfig: VideoCaptureConfig? = null
    ): CaptureSession<Uri> {
        val config = captureConfig ?: cameraConfig.defaultVideoCaptureConfig
        val videoCapture = buildVideoCapture(config)
        val preview = buildPreview()
        var recording: Recording? = null
        val deferred = CompletableDeferred<CaptureResult<Uri>>()

        openCameraForUseCases(preview, videoCapture) { provider ->
            val outputOptions = FileOutputOptions.Builder(outputFile).build()

            var recordingSession = videoCapture.output
                .prepareRecording(context, outputOptions)
            if (config.recordAudio) {
                recordingSession = recordingSession.withAudioEnabled()
            }

            recording = recordingSession.start(ContextCompat.getMainExecutor(context)) { event ->
                if (event is VideoRecordEvent.Finalize) {
                    if (!event.hasError()) {
                        deferred.complete(CaptureResult.Success(event.outputResults.outputUri))
                    } else {
                        deferred.complete(
                            CaptureResult.Failure(Exception("Video capture error: ${event.error}"))
                        )
                    }
                    provider.unbindAll()
                }
            }
            duration?.let { d ->
                mainHandler.postDelayed({ recording?.stop() }, d)
            }
        }
        return CaptureSessionImpl(deferred) {
            recording?.stop()
            recording = null
        }
    }

    /**
     * Scans for a QR code.
     *
     * @param timeoutMs Optional timeout in milliseconds.
     *                  If the timeout elapses with no QR code, waitForResult() returns success with null.
     * @return A [CaptureSession] that lets you wait for the final [CaptureResult] (with the decoded QR text or null) or stop early.
     */
    fun scanQrCode(timeoutMs: Long? = null): CaptureSession<String?> {
        val preview = buildPreview()
        val imageAnalysis = buildImageAnalysis()
        var providerForStop: ProcessCameraProvider? = null
        val deferred = CompletableDeferred<CaptureResult<String?>>()

        // ZXing hints.
        val hints = mapOf(
            DecodeHintType.POSSIBLE_FORMATS to listOf(BarcodeFormat.QR_CODE),
            DecodeHintType.TRY_HARDER to true
        )
        val multiFormatReader = MultiFormatReader().apply { setHints(hints) }

        val analyzer = object : ImageAnalysis.Analyzer {
            @ExperimentalGetImage
            override fun analyze(imageProxy: ImageProxy) {
                val mediaImage = imageProxy.image
                if (mediaImage != null) {
                    try {
                        val buffer = mediaImage.planes[0].buffer
                        val data = ByteArray(buffer.remaining())
                        buffer.get(data)
                        val source = PlanarYUVLuminanceSource(
                            data,
                            mediaImage.width,
                            mediaImage.height,
                            0,
                            0,
                            mediaImage.width,
                            mediaImage.height,
                            false
                        )
                        val binaryBitmap = BinaryBitmap(HybridBinarizer(source))
                        val result = multiFormatReader.decodeWithState(binaryBitmap)
                        if (!deferred.isCompleted) {
                            deferred.complete(CaptureResult.Success(result.text))
                            mainHandler.post { providerForStop?.unbindAll() }
                        }
                    } catch (e: NotFoundException) {
                        // No QR code found in this frame; ignore and keep scanning.
                    } catch (e: Exception) {
                        if (!deferred.isCompleted) {
                            deferred.complete(CaptureResult.Failure(e))
                            mainHandler.post { providerForStop?.unbindAll() }
                        }
                    } finally {
                        multiFormatReader.reset()
                        imageProxy.close()
                    }
                } else {
                    imageProxy.close()
                }
            }
        }
        imageAnalysis.setAnalyzer(cameraExecutor, analyzer)

        openCameraForUseCases(preview, imageAnalysis) { provider ->
            providerForStop = provider
            timeoutMs?.let { t ->
                mainHandler.postDelayed({
                    if (provider.isBound(imageAnalysis) && !deferred.isCompleted) {
                        deferred.complete(CaptureResult.Success(null))
                        provider.unbindAll()
                    }
                }, t)
            }
        }
        return CaptureSessionImpl(deferred) {
            providerForStop?.unbindAll()
        }
    }

    // --- Private Helper Functions ---

    private fun openCameraForUseCases(
        vararg useCases: UseCase,
        onBound: (ProcessCameraProvider) -> Unit
    ) {
        val provider = cameraProvider ?: return // Reuse existing instance

        provider.unbindAll()
        provider.bindToLifecycle(
            lifecycleOwner,
            CameraSelector.DEFAULT_BACK_CAMERA,
            *useCases
        )
        onBound(provider)
    }

    private fun buildPreview(): Preview {
        return Preview.Builder().build().apply {
            setSurfaceProvider { request ->
                val texture = SurfaceTexture(0)
                texture.setDefaultBufferSize(request.resolution.width, request.resolution.height)
                val surface = Surface(texture)
                request.provideSurface(surface, ContextCompat.getMainExecutor(context)) {
                    surface.release()
                    texture.release()
                }
            }
        }
    }

    private fun buildImageCapture(config: ImageCaptureConfig): ImageCapture {
        val builder = ImageCapture.Builder()
            .setCaptureMode(config.captureMode)
        config.jpegQuality?.let { builder.setJpegQuality(it) }
        return builder.build()
    }

    private fun buildVideoCapture(config: VideoCaptureConfig): VideoCapture<Recorder> {
        val recorder = Recorder.Builder()
            .setQualitySelector(config.qualitySelector)
            .build()
        return VideoCapture.withOutput(recorder)
    }

    private fun buildImageAnalysis(): ImageAnalysis {
        return ImageAnalysis.Builder()
            .setBackpressureStrategy(STRATEGY_KEEP_ONLY_LATEST)
            .build()
    }
}

/**
 * Internal implementation of CaptureSession.
 */
private class CaptureSessionImpl<T>(
    private val deferred: CompletableDeferred<CaptureResult<T>>,
    private val stopCallback: () -> Unit
) : CaptureSession<T> {
    override suspend fun waitForResult(): CaptureResult<T> = deferred.await()
    override fun stop() = stopCallback()
}
