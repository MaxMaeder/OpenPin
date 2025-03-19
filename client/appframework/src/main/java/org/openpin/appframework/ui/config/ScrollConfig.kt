package org.openpin.appframework.ui.config

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Configuration for the scroll container behavior.
 */
data class ScrollContainerConfig(
    // Thickness of the scrollbar drawn at the right edge.
    val scrollbarThickness: Dp = 6.dp,
    // Duration (in millis) for scroll animations.
    val scrollAnimationDuration: Int = 300,
    // Fraction of the viewport height to jump on arrow click.
    val scrollJumpFraction: Float = 0.75f,

    val scrollButton: ScrollArrowButtonConfig = ScrollArrowButtonConfig(),
)

/**
 * Configuration for the wide scroll arrow button used in the scroll container.
 */
data class ScrollArrowButtonConfig(
    // The height for the arrow area (the container for the arrow buttons).
    val arrowAreaHeight: Dp = 100.dp,

    // Size of the “pill” button.
    val pillWidth: Dp = 80.dp,
    val pillHeight: Dp = 40.dp,

    // Size for the icon inside the pill.
    val pillIconSize: Dp = 30.dp,

    // The z‑index to force the arrow on top of other content.
    val zIndex: Int = 99,

    val baseButtonConfig: BaseButtonConfig = BaseButtonConfig(
        shape = RoundedCornerShape(percent = 50),
        padding = 0.dp
    ),
)