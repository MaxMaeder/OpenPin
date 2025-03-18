package org.openpin.appframework.ui.hosts

import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.input.pointer.pointerInput
import org.openpin.appframework.ui.controllers.MagneticTargetsController
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.locals.LocalFocusedTargetId
import org.openpin.appframework.ui.locals.LocalMagneticTargetsController
import org.openpin.appframework.ui.locals.LocalPointerPosition
import org.openpin.appframework.ui.locals.LocalPointerPressed

@Composable
fun AppContainer(navigationController: NavigationController) {
    val magneticTargetsController = remember { MagneticTargetsController() }
    var pointerPosition by remember { mutableStateOf(androidx.compose.ui.geometry.Offset.Zero) }
    var pointerPressed by remember { mutableStateOf(false) }
    val focusRequester = remember { FocusRequester() }
    LaunchedEffect(Unit) { focusRequester.requestFocus() }

    val focusedTargetId by remember { derivedStateOf { magneticTargetsController.focusedTargetId(pointerPosition) } }

    CompositionLocalProvider(
        LocalPointerPosition provides pointerPosition,
        LocalPointerPressed provides pointerPressed,
        LocalFocusedTargetId provides focusedTargetId,
        LocalMagneticTargetsController provides magneticTargetsController
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .focusRequester(focusRequester)
                .focusable()
                .onPreviewKeyEvent { keyEvent ->
                    if (keyEvent.type == KeyEventType.KeyDown && keyEvent.key == Key.H) {
                        navigationController.pop()
                        true
                    } else false
                }
                .pointerInput(Unit) {
                    while (true) {
                        val event = awaitPointerEventScope { awaitPointerEvent() }
                        event.changes.firstOrNull()?.let { change ->
                            pointerPosition = change.position
                            pointerPressed = change.pressed
                        }
                    }
                }
        ) {
            NavigationHost(navigationController = navigationController)
            DebugHitboxesOverlay()
        }
    }
}
