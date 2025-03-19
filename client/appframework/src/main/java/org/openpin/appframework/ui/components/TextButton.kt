package org.openpin.appframework.ui.components

import android.util.Log
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.openpin.appframework.ui.config.ButtonVariant
import org.openpin.appframework.ui.config.TextButtonConfig
import org.openpin.appframework.ui.config.UIConfig
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun TextButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonVariant = ButtonVariant.Primary,
    scaleOnFocus: Boolean = false,
    shadowEnabled: Boolean = false,
    onFocus: (() -> Unit)? = null,
    textButtonConfig: TextButtonConfig? = null
) {
    val uiConfig: UIConfig = LocalUIConfig.current
    val config = textButtonConfig ?: uiConfig.textButton

    SideEffect {
        Log.e("BTN", "BTNh")
    }

    MagneticTarget(
        onClick = onClick,
        scaleOnFocus = scaleOnFocus,
        magneticTargetConfig = config.base.magnetTarget,
        transitionConfig = config.base.appearanceTransition,
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
            modifier = modifier.fillMaxWidth(),
            baseButtonConfig = config.base,
            shape = androidx.compose.foundation.shape.RoundedCornerShape(25.dp)
        ) {
            Text(
                text = text,
                textSize = config.textSize,
                textConfig = uiConfig.text
            )
        }
    }
}