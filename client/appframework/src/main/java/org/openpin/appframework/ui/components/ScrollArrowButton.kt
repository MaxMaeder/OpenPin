package org.openpin.appframework.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import org.openpin.appframework.ui.config.AppearanceTransitionConfig
import org.openpin.appframework.ui.config.ButtonVariant
import org.openpin.appframework.ui.config.MagneticTargetConfig
import org.openpin.appframework.ui.config.ScrollArrowButtonConfig
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun ScrollArrowButton(
    visible: Boolean,
    gradientBrush: Brush,
    arrowIcon: ImageVector,
    contentDescription: String?,
    onClick: () -> Unit,
    config: ScrollArrowButtonConfig = ScrollArrowButtonConfig(),
    modifier: Modifier = Modifier
) {
    if (!visible) return

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(100.dp) // Alternatively you could use config values if desired.
    ) {
        // Background gradient overlay.
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(gradientBrush)
        )
        // Use a MagneticTarget to capture pointer events.
        MagneticTarget(
            modifier = Modifier.fillMaxSize(),
            // For arrow buttons we disable the magnet effect.
            magnetEnabled = false,
            scaleOnFocus = false,
            // Pass a “no‐effect” configuration.
            magneticTargetConfig = MagneticTargetConfig(magnetEffectStrength = 0f, scaleEffectMagnitude = 1f),
            transitionConfig = AppearanceTransitionConfig(animationDuration = config.animationDuration),
            zIndex = config.zIndex,
            onClick = onClick
        ) { isFocused, isActive, magnetOffset, scaleFactor ->
            Box(modifier = Modifier.align(Alignment.Center)) {
                // Render a pill button using our BaseLaserButton.
                BaseLaserButton(
                    isFocused = isFocused,
                    isActive = isActive,
                    variant = ButtonVariant.Primary,
                    onClick = onClick,
                    magnetOffset = magnetOffset,
                    scaleFactor = scaleFactor,
                    shadowEnabled = false,
                    // Here we use the text button base config from the app-level UIConfig.
                    baseButtonConfig = LocalUIConfig.current.textButton.base,
                    shape = config.pillShape,
                    modifier = Modifier.size(width = config.pillWidth, height = config.pillHeight)
                ) {
                    Icon(
                        imageVector = arrowIcon,
                        contentDescription = contentDescription,
                        modifier = Modifier.size(config.pillIconSize)
                    )
                }
            }
        }
    }
}