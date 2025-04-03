package org.openpin.appframework.ui.config

data class HandDepthConfig (
    // Amount above the moving average that counts as a significant depth change
    val depthThreshold: Float = 0.05f,
    // Cooldown period in milliseconds between these 'depth change' detections
    val cooldownDurationMillis: Long = 500L,
    // Weight for the current reading in the exponential moving average
    val alpha: Float = 0.15f
)
