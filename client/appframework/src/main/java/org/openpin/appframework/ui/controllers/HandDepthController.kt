package org.openpin.appframework.ui.controllers

import org.openpin.appframework.ui.config.HandDepthConfig

class HandDepthController(
    private val config: HandDepthConfig
) {
    private var averageHandDepth: Float? = null
    private var lastSpikeTimeMillis: Long = 0

    /**
     * Call this for every hand depth reading.
     * Returns true if a sudden depth change is detected and the cooldown has passed.
     */
    fun update(handDepth: Float, currentTimeMillis: Long = System.currentTimeMillis()): Boolean {
        // Update the moving average of hand depth using exponential smoothing.
        averageHandDepth = averageHandDepth?.let { config.alpha * handDepth + (1 - config.alpha) * it } ?: handDepth
        val avg = averageHandDepth ?: handDepth

        // If the hand depth exceeds the moving average by the threshold and the cooldown has passed, trigger a spike.
        return if (handDepth - avg > config.depthThreshold &&
            (currentTimeMillis - lastSpikeTimeMillis) >= config.cooldownDurationMillis) {
            lastSpikeTimeMillis = currentTimeMillis
            true
        } else {
            false
        }
    }
}
