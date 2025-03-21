package org.openpin.appframework.sensors.camera

import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector

/**
 * Configuration for image capture.
 *
 * @param aspectRatio Optional aspect ratio (use AspectRatio.RATIO_4_3 or AspectRatio.RATIO_16_9).
 */
data class ImageCaptureConfig(
    val aspectRatio: Int? = null,
)

/**
 * Configuration for video capture.
 *
 * @param qualitySelector Optional quality selector (default is HIGHEST).
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