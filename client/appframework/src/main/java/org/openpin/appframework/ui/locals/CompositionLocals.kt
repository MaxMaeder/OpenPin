package org.openpin.appframework.ui.locals

import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.ProvidableCompositionLocal
import androidx.compose.runtime.State
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.geometry.Offset
import org.openpin.appframework.ui.config.UIConfig
import org.openpin.appframework.ui.controllers.MagneticTargetsController

val defaultUIConfig = UIConfig()
val LocalUIConfig = staticCompositionLocalOf { defaultUIConfig }
val LocalContentColor = staticCompositionLocalOf { defaultUIConfig.contentColor }

val LocalContextMenuState = compositionLocalOf<MutableState<(@Composable () -> Unit)?>> {
    error("LocalContextMenuState not provided")
}

val LocalPointerPositionState = staticCompositionLocalOf<State<Offset>> {
    error("No pointer position provided")
}
val LocalPointerPressed = staticCompositionLocalOf { false }

val LocalMagneticTargetsController = staticCompositionLocalOf { MagneticTargetsController() }
val LocalFocusedTargetId = staticCompositionLocalOf<String?> { null }