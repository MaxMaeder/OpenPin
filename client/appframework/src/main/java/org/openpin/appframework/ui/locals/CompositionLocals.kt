package org.openpin.appframework.ui.locals

import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.geometry.Offset
import org.openpin.appframework.ui.config.UIConfig
import org.openpin.appframework.ui.controllers.MagneticTargetsController

val LocalUIConfig = staticCompositionLocalOf<UIConfig> { UIConfig() }

val LocalPointerPosition = staticCompositionLocalOf { Offset.Zero }
val LocalPointerPressed = staticCompositionLocalOf { false }
val LocalMagneticTargetsController = staticCompositionLocalOf { MagneticTargetsController() }
val LocalFocusedTargetId = staticCompositionLocalOf<String?> { null }