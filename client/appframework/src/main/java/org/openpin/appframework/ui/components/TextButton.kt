package org.openpin.appframework.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import org.openpin.appframework.ui.config.ButtonVariant
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun TextButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonVariant = ButtonVariant.Primary,
    scaleOnFocus: Boolean = true,
    shadowEnabled: Boolean = false,
    onFocus: () -> Unit = {},
    zIndex: Int = 1,
) {
    val config = LocalUIConfig.current.textButton

    val btnModifier = if (config.fullWidth) modifier.fillMaxWidth() else modifier

    MagneticTarget(
        onClick = onClick,
        scaleOnFocus = scaleOnFocus,
        magneticTargetConfig = config.base.magnetTarget,
        transitionConfig = config.base.appearanceTransition,
        onFocus = onFocus,
        zIndex = zIndex
    ) { isFocused, isActive, magnetOffset, scaleFactor ->
        BaseLaserButton(
            isFocused = isFocused,
            isActive = isActive,
            variant = variant,
            magnetOffset = magnetOffset,
            scaleFactor = scaleFactor,
            shadowEnabled = shadowEnabled,
            modifier = btnModifier,
            baseButtonConfig = config.base,
        ) {
            Text(
                text = text,
                size = config.textSize,
            )
        }
    }
}