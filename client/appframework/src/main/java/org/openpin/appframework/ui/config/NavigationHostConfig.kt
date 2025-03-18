package org.openpin.appframework.ui.config

import androidx.compose.ui.graphics.Color

data class NavigationHostConfig(
    val appearanceTransition: AppearanceTransitionConfig = AppearanceTransitionConfig(),
    val backgroundColor: Color = DeviceColors.BLACK
)