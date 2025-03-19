package org.openpin.appframework.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import org.openpin.appframework.ui.config.BaseButtonConfig
import org.openpin.appframework.ui.config.BorderStyle
import org.openpin.appframework.ui.config.ButtonVariant
import org.openpin.appframework.ui.config.DeviceColors
import kotlin.math.roundToInt

@Composable
fun BaseLaserButton(
    isFocused: Boolean,
    isActive: Boolean,
    variant: ButtonVariant,
    onClick: () -> Unit,
    magnetOffset: Offset,
    scaleFactor: Float,
    shadowEnabled: Boolean = false,
    modifier: Modifier = Modifier,
    baseButtonConfig: BaseButtonConfig,
    shape: Shape,
    content: @Composable () -> Unit
) {
    val variantConfig = baseButtonConfig.variants[variant]
        ?: error("Button variant config not defined for $variant")
    val stateConfig = when {
        isActive -> variantConfig.active
        isFocused -> variantConfig.focused
        else -> variantConfig.normal
    }

    val colorTweenSpec = remember(baseButtonConfig.appearanceTransition.animationDuration) {
        tween<Color>(durationMillis = baseButtonConfig.appearanceTransition.animationDuration)
    }

    val animatedBackgroundColor by animateColorAsState(
        targetValue = stateConfig.backgroundColor,
        animationSpec = colorTweenSpec
    )
    val animatedContentColor by animateColorAsState(
        targetValue = stateConfig.textColor,
        animationSpec = colorTweenSpec
    )

    val borderWidth = 4.dp
    val borderModifier = if (stateConfig.borderStyle == BorderStyle.Dashed) {
        Modifier.border(borderWidth, stateConfig.borderColor, shape)
    } else {
        Modifier.border(borderWidth, stateConfig.borderColor, shape)
    }

    Box {
        if (shadowEnabled) {
            val shadowOffsetX = (-magnetOffset.x * baseButtonConfig.shadow.scaleFactor).roundToInt()
            val shadowOffsetY = (-magnetOffset.y * baseButtonConfig.shadow.scaleFactor).roundToInt()
            Box(
                modifier = Modifier
                    .offset { IntOffset(shadowOffsetX, shadowOffsetY) }
                    .background(DeviceColors.LASER_503_MUTED, shape)
                    .matchParentSize()
            )
        }

        Box(
            modifier = modifier
                .offset { IntOffset(magnetOffset.x.roundToInt(), magnetOffset.y.roundToInt()) }
                .scale(scaleFactor)
                .background(animatedBackgroundColor, shape)
                .then(borderModifier)
                .padding(baseButtonConfig.padding),
            contentAlignment = Alignment.Center
        ) {
            CompositionLocalProvider(LocalContentColor provides animatedContentColor) {
                content()
            }
        }
    }
}