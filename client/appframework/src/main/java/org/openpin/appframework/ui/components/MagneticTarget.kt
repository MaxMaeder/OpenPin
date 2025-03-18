package org.openpin.appframework.ui.components

import androidx.compose.animation.core.VectorConverter
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.animateValueAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.layout.boundsInRoot
import androidx.compose.ui.layout.onGloballyPositioned
import org.openpin.appframework.ui.config.AppearanceTransitionConfig
import org.openpin.appframework.ui.config.MagneticTargetConfig
import org.openpin.appframework.ui.locals.LocalFocusedTargetId
import org.openpin.appframework.ui.locals.LocalMagneticTargetsController
import org.openpin.appframework.ui.locals.LocalPointerPosition
import org.openpin.appframework.ui.locals.LocalPointerPressed
import java.util.UUID

@Composable
fun MagneticTarget(
    modifier: Modifier = Modifier,
    magnetEnabled: Boolean = true,
    scaleOnFocus: Boolean = false,
    magneticTargetConfig: MagneticTargetConfig,
    transitionConfig: AppearanceTransitionConfig,
    zIndex: Int = 0,
    onFocus: (() -> Unit)? = null,
    onClick: () -> Unit = {},
    content: @Composable (isFocused: Boolean, isActive: Boolean, magnetOffset: Offset, scaleFactor: Float) -> Unit
) {
    val pointerPosition = LocalPointerPosition.current
    val pointerPressed = LocalPointerPressed.current
    val controller = LocalMagneticTargetsController.current

    var targetRect by remember { mutableStateOf<Rect?>(null) }
    val id = remember { UUID.randomUUID().toString() }

    DisposableEffect(id) {
        onDispose { controller.unregister(id) }
    }

    Box(
        modifier = modifier.onGloballyPositioned { layoutCoordinates ->
            val rect = layoutCoordinates.boundsInRoot()
            targetRect = rect
            controller.register(id, rect, zIndex)
        }
    ) {
        val focusedId = LocalFocusedTargetId.current
        val isFocused = (focusedId == id)
        val isActive = isFocused && pointerPressed

        var wasActive by remember { mutableStateOf(false) }
        LaunchedEffect(pointerPressed, isFocused) {
            val currentlyActive = isFocused && pointerPressed
            if (!pointerPressed && wasActive) {
                onClick()
            }
            wasActive = currentlyActive
        }

        LaunchedEffect(isFocused) {
            if (isFocused) onFocus?.invoke()
        }

        val targetShift = if (magnetEnabled && isFocused && targetRect != null) {
            val center = targetRect!!.center
            val distance = (pointerPosition - center).getDistance()
            val rubberFactor = 1f / (1f + magneticTargetConfig.magnetRubberBandFactor * distance)
            (pointerPosition - center) * magneticTargetConfig.magnetEffectStrength * rubberFactor
        } else Offset.Zero

        val animatedShift by animateValueAsState(
            targetValue = targetShift,
            typeConverter = Offset.VectorConverter,
            animationSpec = tween(magneticTargetConfig.animationDuration)
        )

        val scaleFactor by animateFloatAsState(
            targetValue = if (scaleOnFocus && isFocused) magneticTargetConfig.scaleEffectMagnitude else 1f,
            animationSpec = tween(durationMillis = transitionConfig.animationDuration)
        )

        content(isFocused, isActive, animatedShift, scaleFactor)
    }
}