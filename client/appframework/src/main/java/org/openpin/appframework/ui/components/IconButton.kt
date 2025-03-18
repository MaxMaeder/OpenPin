package org.openpin.appframework.ui.components

import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import org.openpin.appframework.ui.config.ButtonVariant
import org.openpin.appframework.ui.config.IconButtonConfig
import org.openpin.appframework.ui.config.UIConfig
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun IconButton(
    icon: ImageVector,
    contentDescription: String?,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonVariant = ButtonVariant.Primary,
    iconButtonConfig: IconButtonConfig? = null,
    scaleOnFocus: Boolean = false,
    shadowEnabled: Boolean = false,
    onFocus: (() -> Unit)? = null,
    buttonShape: androidx.compose.ui.graphics.Shape = CircleShape
) {
    val uiConfig: UIConfig = LocalUIConfig.current
    val config = iconButtonConfig ?: uiConfig.iconButton

    MagneticTarget(
        modifier = modifier,
        onClick = onClick,
        scaleOnFocus = scaleOnFocus,
        magneticTargetConfig = config.base.magnetTarget,
        transitionConfig = config.base.appearanceTransition,
        zIndex = 1,
        onFocus = onFocus
    ) { isFocused, isActive, magnetOffset, scaleFactor ->
        BaseLaserButton(
            isFocused = isFocused,
            isActive = isActive,
            variant = variant,
            onClick = onClick,
            magnetOffset = magnetOffset,
            scaleFactor = scaleFactor,
            shadowEnabled = shadowEnabled,
            baseButtonConfig = config.base,
            shape = buttonShape,
            modifier = Modifier
        ) {
            Icon(
                imageVector = icon,
                contentDescription = contentDescription,
                modifier = Modifier.size(config.iconSize)
            )
        }
    }
}