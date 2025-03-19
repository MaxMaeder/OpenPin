package org.openpin.appframework.ui.hosts

import android.util.Log
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.geometry.Offset
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
import org.openpin.appframework.ui.locals.LocalPointerPositionState
import org.openpin.appframework.ui.locals.LocalPointerPressed

@Composable
fun AppContainer(navigationController: NavigationController) {
    val magneticTargetsController = remember { MagneticTargetsController() }
    // Now we store pointerPosition as a state object.
    val pointerPositionState = remember { mutableStateOf(Offset.Zero) }
    var pointerPressed by remember { mutableStateOf(false) }
    val focusRequester = remember { FocusRequester() }
    LaunchedEffect(Unit) { focusRequester.requestFocus() }

    val focusedTargetId by remember { derivedStateOf { magneticTargetsController.focusedTargetId(pointerPositionState.value) } }

    SideEffect {
        Log.e("Container", "CONT Recomposed")
    }

    CompositionLocalProvider(
        LocalPointerPositionState provides pointerPositionState,
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
                    awaitPointerEventScope {
                        while (true) {
                            val event = awaitPointerEvent()
                            event.changes.firstOrNull()?.let { change ->
                                val newPos = change.position
                                // Only update if the pointer has moved more than 1 pixel.
//                                if (kotlin.math.abs(newPos.x - pointerPositionState.value.x) > 1f ||
//                                    kotlin.math.abs(newPos.y - pointerPositionState.value.y) > 1f
//                                ) {
                                pointerPositionState.value = newPos
                                //}
                                pointerPressed = change.pressed
                            }
                        }
                    }
                }
        ) {
            NavigationHost(navigationController = navigationController)
            DebugHitboxesOverlay()
        }
    }
}
