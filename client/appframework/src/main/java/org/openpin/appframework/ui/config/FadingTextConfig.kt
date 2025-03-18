package org.openpin.appframework.ui.config

data class FadingTextConfig(
    val textConfig: TextConfig = TextConfig(),
    val appearanceTransition: AppearanceTransitionConfig = AppearanceTransitionConfig()
)
