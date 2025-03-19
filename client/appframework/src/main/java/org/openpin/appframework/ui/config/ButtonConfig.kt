package org.openpin.appframework.ui.config

import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class ButtonVariant {
    Primary, Secondary
}

enum class BorderStyle {
    Solid, Dashed
}

data class ButtonStateConfig(
    val backgroundColor: Color,
    val textColor: Color,
    val borderColor: Color,
    val borderStyle: BorderStyle = BorderStyle.Solid
)

data class ButtonShadowConfig(
    val color: Color = DeviceColors.LASER_503_MUTED,
    val scaleFactor: Float = 1.75f
)

data class ButtonVariantConfig(
    val normal: ButtonStateConfig,
    val focused: ButtonStateConfig,
    val active: ButtonStateConfig
)

data class BaseButtonConfig(
    val magnetTarget: MagneticTargetConfig = MagneticTargetConfig(),
    val shadow: ButtonShadowConfig = ButtonShadowConfig(),
    val appearanceTransition: AppearanceTransitionConfig = AppearanceTransitionConfig(),
    val variants: Map<ButtonVariant, ButtonVariantConfig> = defaultButtonVariants(),
    val padding: Dp = 16.dp,
    val shape: Shape
)

fun defaultButtonVariants(): Map<ButtonVariant, ButtonVariantConfig> {
    return mapOf(
        ButtonVariant.Primary to ButtonVariantConfig(
            normal = ButtonStateConfig(
                backgroundColor = DeviceColors.BLACK,
                textColor = DeviceColors.LASER_503,
                borderColor = DeviceColors.LASER_503,
                borderStyle = BorderStyle.Solid
            ),
            focused = ButtonStateConfig(
                backgroundColor = DeviceColors.LASER_503,
                textColor = DeviceColors.BLACK,
                borderColor = DeviceColors.LASER_503,
                borderStyle = BorderStyle.Solid
            ),
            active = ButtonStateConfig(
                backgroundColor = DeviceColors.LASER_503_MUTED,
                textColor = DeviceColors.LASER_503,
                borderColor = DeviceColors.LASER_503,
                borderStyle = BorderStyle.Solid
            )
        ),
        ButtonVariant.Secondary to ButtonVariantConfig(
            normal = ButtonStateConfig(
                backgroundColor = DeviceColors.LASER_503_ACCENT,
                textColor = DeviceColors.BLACK,
                borderColor = DeviceColors.LASER_503_ACCENT,
                borderStyle = BorderStyle.Dashed
            ),
            focused = ButtonStateConfig(
                backgroundColor = DeviceColors.LASER_503,
                textColor = DeviceColors.LASER_503_ACCENT,
                borderColor = DeviceColors.LASER_503_ACCENT,
                borderStyle = BorderStyle.Dashed
            ),
            active = ButtonStateConfig(
                backgroundColor = DeviceColors.LASER_503_MUTED,
                textColor = DeviceColors.LASER_503,
                borderColor = DeviceColors.LASER_503_ACCENT,
                borderStyle = BorderStyle.Dashed
            )
        )
    )
}

data class IconButtonConfig(
    val base: BaseButtonConfig = BaseButtonConfig(
        magnetTarget = MagneticTargetConfig(scaleEffectMagnitude = 1.2f),
        shape = CircleShape
    ),
    val iconSize: Dp = 80.dp
)

data class TextButtonConfig(
    val base: BaseButtonConfig = BaseButtonConfig(
        magnetTarget = MagneticTargetConfig(scaleEffectMagnitude = 1.015f),
        shape = RoundedCornerShape(25.dp)
    ),
    val textSize: androidx.compose.ui.unit.TextUnit = 60.sp,
    val fullWidth: Boolean = true
)