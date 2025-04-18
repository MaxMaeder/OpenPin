package org.openpin.appframework.ui.hosts

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import kotlinx.coroutines.delay
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun NavigationHost(navigationController: NavigationController) {
    val config = LocalUIConfig.current.navigationHost
    var showOverlay by remember { mutableStateOf(false) }
    var displayedView by remember { mutableStateOf(navigationController.currentView) }

    // Cache the tween spec for overlay animation.
    val overlayTweenSpec = remember(config.appearanceTransition.animationDuration) {
        tween<Float>(durationMillis = config.appearanceTransition.animationDuration)
    }
    val overlayAlpha by animateFloatAsState(
        targetValue = if (showOverlay) 1f else 0f,
        animationSpec = overlayTweenSpec
    )

    // Use LaunchedEffect keyed to currentView changes.
    LaunchedEffect(navigationController.currentView) {
        showOverlay = true
        delay(config.appearanceTransition.animationDuration.toLong())
        displayedView = navigationController.currentView
        showOverlay = false
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(config.backgroundColor)
    ) {
        displayedView()
        if (overlayAlpha > 0f) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(config.backgroundColor.copy(alpha = overlayAlpha))
            )
        }
    }
}
