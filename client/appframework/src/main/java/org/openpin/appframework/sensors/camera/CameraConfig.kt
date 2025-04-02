package org.openpin.appframework.sensors.camera

import androidx.camera.core.ImageCapture
import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector

/**
 * Configuration for post-processing an image.
 *
 * @property newWidth The target width.
 * @property newHeight The target height.
 */
data class PostProcessConfig(
    val newWidth: Int,
    val newHeight: Int
)

/**
 * Configuration for image capture.
 *
 * @property captureMode The mode used to prioritize either latency or quality when capturing an image.
 * @property jpegQuality Optional JPEG quality setting (1-100).
 * @property postProcessConfig Optional post-processing settings.
 */
data class ImageCaptureConfig(
    val captureMode: Int = ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY,
    val jpegQuality: Int? = null,
    val postProcessConfig: PostProcessConfig? = null
)

/**
 * Configuration for video capture.
 *
 * @property qualitySelector Selector used to determine the video quality.
 * @property recordAudio Indicates whether audio should be recorded along with the video.
 */
data class VideoCaptureConfig(
    val qualitySelector: QualitySelector = QualitySelector.from(Quality.HIGHEST),
    val recordAudio: Boolean = true,
)

/**
 * Top-level camera configuration.
 *
 * @param defaultImageCaptureConfig Default config for image capture.
 * @param defaultVideoCaptureConfig Default config for video capture.
 */
data class CameraConfig(
    val defaultImageCaptureConfig: ImageCaptureConfig = ImageCaptureConfig(),
    val defaultVideoCaptureConfig: VideoCaptureConfig = VideoCaptureConfig()
)