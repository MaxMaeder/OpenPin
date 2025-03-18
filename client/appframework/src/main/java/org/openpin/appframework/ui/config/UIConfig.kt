package org.openpin.appframework.ui.config

import android.content.pm.ActivityInfo
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

data class UIConfig(
    val navigationHost: NavigationHostConfig = NavigationHostConfig(),
    val textButton: TextButtonConfig = TextButtonConfig(),
    val iconButton: IconButtonConfig = IconButtonConfig(),
    val text: TextConfig = TextConfig(),
    val fadingText: FadingTextConfig = FadingTextConfig(),
    // Global/app‑level settings
    val viewMargin: Dp = 16.dp,
    val fullScreen: Boolean = true,
    val orientation: Int = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE,
    val debugShowHitboxes: Boolean = false
)
