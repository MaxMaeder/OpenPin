package org.openpin.appframework.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import org.openpin.appframework.ui.config.ButtonVariant
import org.openpin.appframework.ui.config.ScrollArrowButtonConfig
import org.openpin.appframework.ui.config.UIIcon

@Composable
fun ScrollArrowButton(
    visible: Boolean,
    gradientBrush: Brush,
    arrowIcon: UIIcon,
    onClick: () -> Unit,
    config: ScrollArrowButtonConfig,
    modifier: Modifier = Modifier
) {
    if (!visible) return

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(config.arrowAreaHeight)
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
            scaleOnFocus = false,
            magneticTargetConfig = config.baseButtonConfig.magnetTarget,
            transitionConfig = config.baseButtonConfig.appearanceTransition,
            zIndex = config.zIndex,
            onClick = onClick
        ) { isFocused, isActive, magnetOffset, scaleFactor ->
            Box(modifier = Modifier.align(Alignment.Center)) {
                BaseLaserButton(
                    isFocused = isFocused,
                    isActive = isActive,
                    variant = ButtonVariant.Primary,
                    magnetOffset = magnetOffset,
                    scaleFactor = scaleFactor,
                    shadowEnabled = false,
                    baseButtonConfig = config.baseButtonConfig,
                    modifier = Modifier.size(width = config.pillWidth, height = config.pillHeight)
                ) {
                    Icon(
                        icon = arrowIcon,
                        size = config.pillIconSize
                    )
                }
            }
        }
    }
}