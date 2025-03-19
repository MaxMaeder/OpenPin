package org.openpin.appframework.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import org.openpin.appframework.ui.config.ButtonVariant
import org.openpin.appframework.ui.config.UIIcon
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun IconButton(
    icon: UIIcon,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonVariant = ButtonVariant.Primary,
    scaleOnFocus: Boolean = true,
    shadowEnabled: Boolean = true,
    onFocus: () -> Unit = {},
    zIndex: Int = 0,
) {
    val config = LocalUIConfig.current.iconButton

    MagneticTarget(
        modifier = modifier,
        onClick = onClick,
        scaleOnFocus = scaleOnFocus,
        magneticTargetConfig = config.base.magnetTarget,
        transitionConfig = config.base.appearanceTransition,
        zIndex = zIndex,
        onFocus = onFocus
    ) { isFocused, isActive, magnetOffset, scaleFactor ->
        BaseLaserButton(
            isFocused = isFocused,
            isActive = isActive,
            variant = variant,
            magnetOffset = magnetOffset,
            scaleFactor = scaleFactor,
            shadowEnabled = shadowEnabled,
            baseButtonConfig = config.base,
            modifier = Modifier
        ) {
            Icon(
                icon = icon,
                size = config.iconSize
            )
        }
    }
}