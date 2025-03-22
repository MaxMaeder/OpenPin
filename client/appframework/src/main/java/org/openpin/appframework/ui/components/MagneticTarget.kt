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
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.layout.boundsInRoot
import androidx.compose.ui.layout.onGloballyPositioned
import org.koin.compose.koinInject
import org.openpin.appframework.audioplayer.AudioPlayer
import org.openpin.appframework.audioplayer.AudioType
import org.openpin.appframework.ui.config.AppearanceTransitionConfig
import org.openpin.appframework.ui.config.MagneticTargetConfig
import org.openpin.appframework.ui.locals.LocalFocusedTargetId
import org.openpin.appframework.ui.locals.LocalMagneticTargetsController
import org.openpin.appframework.ui.locals.LocalPointerPositionState
import org.openpin.appframework.ui.locals.LocalPointerPressed
import org.openpin.appframework.ui.locals.LocalUIConfig
import java.util.UUID

@Composable
fun MagneticTarget(
    zIndex: Int,
    modifier: Modifier = Modifier,
    magnetEnabled: Boolean = true,
    scaleOnFocus: Boolean = false,
    magneticTargetConfig: MagneticTargetConfig,
    transitionConfig: AppearanceTransitionConfig,
    onFocus: () -> Unit = {},
    onClick: () -> Unit = {},
    content: @Composable (isFocused: Boolean, isActive: Boolean, magnetOffset: Offset, scaleFactor: Float) -> Unit
) {
    val audioPlayer = koinInject<AudioPlayer>()

    val audioFeedbackConfig = LocalUIConfig.current.audioFeedbackConfig

    // Read the pointer state (provided as State<Offset>)
    val pointerPositionState = LocalPointerPositionState.current
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
                if (audioFeedbackConfig.onClickSound != null) {
                    audioPlayer.play(audioFeedbackConfig.onClickSound, AudioType.SOUND)
                }

                onClick()
            }
            wasActive = currentlyActive
        }

        LaunchedEffect(isFocused) {
            if (isFocused) {
                if (audioFeedbackConfig.onFocusSound != null) {
                    audioPlayer.play(audioFeedbackConfig.onFocusSound, AudioType.SOUND)
                }

                onFocus()
            }
        }

        // Use a local effective pointer position that only updates when focused.
        var effectivePointerPosition by remember { mutableStateOf(pointerPositionState.value) }
        if (isFocused) {
            // When focused, subscribe to pointer updates.
            LaunchedEffect(isFocused) {
                snapshotFlow { pointerPositionState.value }
                    .collect { newPos ->
                        effectivePointerPosition = newPos
                    }
            }
        }

        // Compute magnet effect using the effective pointer position.
        val targetShift = if (magnetEnabled && isFocused && targetRect != null) {
            calculateMagnetOffset(effectivePointerPosition, targetRect!!, magneticTargetConfig)
        } else Offset.Zero

        val tweenSpec = remember(magneticTargetConfig.animationDuration) {
            tween<Offset>(durationMillis = magneticTargetConfig.animationDuration)
        }
        val animatedShift by animateValueAsState(
            targetValue = targetShift,
            typeConverter = Offset.VectorConverter,
            animationSpec = tweenSpec
        )

        val scaleTweenSpec = remember(transitionConfig.animationDuration) {
            tween<Float>(durationMillis = transitionConfig.animationDuration)
        }
        val scaleFactor by animateFloatAsState(
            targetValue = if (scaleOnFocus && isFocused) magneticTargetConfig.scaleEffectMagnitude else 1f,
            animationSpec = scaleTweenSpec
        )

        content(isFocused, isActive, animatedShift, scaleFactor)
    }
}

private fun calculateMagnetOffset(
    pointer: Offset,
    targetRect: Rect,
    config: MagneticTargetConfig
): Offset {
    val center = targetRect.center
    val distance = (pointer - center).getDistance()
    val rubberFactor = 1f / (1f + config.magnetRubberBandFactor * distance)
    return (pointer - center) * config.magnetEffectStrength * rubberFactor
}

