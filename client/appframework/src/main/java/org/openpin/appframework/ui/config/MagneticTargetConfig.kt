package org.openpin.appframework.ui.config

data class MagneticTargetConfig(
    val magnetEffectStrength: Float = 0.07f,
    val magnetRubberBandFactor: Float = 0.002f,
    // The “scale effect” value to be applied when focused.
    val scaleEffectMagnitude: Float = 1f,
    val animationDuration: Int = 60
)