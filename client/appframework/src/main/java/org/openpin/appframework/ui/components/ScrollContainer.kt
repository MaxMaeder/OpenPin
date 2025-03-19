package org.openpin.appframework.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.unit.IntOffset
import kotlinx.coroutines.launch
import org.openpin.appframework.ui.config.ScrollContainerConfig
import org.openpin.appframework.ui.locals.LocalUIConfig
import kotlin.math.roundToInt

@Composable
fun ScrollContainer(
    modifier: Modifier = Modifier,
    config: ScrollContainerConfig = ScrollContainerConfig(),
    content: @Composable ColumnScope.() -> Unit
) {
    val uiConfig = LocalUIConfig.current
    val scrollOffsetAnim = remember { Animatable(0f) }
    val coroutineScope = rememberCoroutineScope()

    var viewportHeight by remember { mutableStateOf(0) }
    var contentHeight by remember { mutableStateOf(0) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .clipToBounds()
    ) {
        Layout(
            content = {
                Column(modifier = Modifier.padding(horizontal = uiConfig.viewMargin)) {
                    content()
                }
            },
            modifier = Modifier
                .onGloballyPositioned { coords ->
                    viewportHeight = coords.size.height
                }
                .offset { IntOffset(x = 0, y = -scrollOffsetAnim.value.roundToInt()) }
        ) { measurables, constraints ->
            val childConstraints = constraints.copy(minHeight = 0, maxHeight = Int.MAX_VALUE)
            val placeables = measurables.map { it.measure(childConstraints) }
            contentHeight = placeables.sumOf { it.height }
            val layoutWidth = constraints.maxWidth
            val layoutHeight = constraints.maxHeight

            layout(layoutWidth, layoutHeight) {
                var yPos = 0
                placeables.forEach { placeable ->
                    placeable.placeRelative(x = 0, y = yPos)
                    yPos += placeable.height
                }
            }
        }

        val canScroll = remember(viewportHeight, contentHeight) { contentHeight > viewportHeight }
        if (canScroll) {
            LaunchedEffect(contentHeight, viewportHeight) {
                val maxOffset = (contentHeight - viewportHeight).coerceAtLeast(0)
                if (scrollOffsetAnim.value > maxOffset) {
                    scrollOffsetAnim.snapTo(maxOffset.toFloat())
                }
            }

            val currentOffset = scrollOffsetAnim.value
            val maxOffset = (contentHeight - viewportHeight).coerceAtLeast(0).toFloat()
            val canScrollUp = currentOffset > 0f
            val canScrollDown = currentOffset < maxOffset

            // Cache the tween spec for arrow fade animations.
            val arrowTweenSpec = remember(config.scrollAnimationDuration) {
                tween<Float>(durationMillis = config.scrollAnimationDuration)
            }
            val alphaUp by animateFloatAsState(
                targetValue = if (canScrollUp) 1f else 0f,
                animationSpec = arrowTweenSpec
            )
            val alphaDown by animateFloatAsState(
                targetValue = if (canScrollDown) 1f else 0f,
                animationSpec = arrowTweenSpec
            )

            val jumpSize = viewportHeight * config.scrollJumpFraction

            ScrollArrowButton(
                visible = (alphaUp > 0f),
                gradientBrush = Brush.verticalGradient(listOf(Color.Black, Color.Transparent)),
                arrowIcon = androidx.compose.material.icons.Icons.Default.KeyboardArrowUp,
                contentDescription = "Scroll Up",
                onClick = {
                    coroutineScope.launch {
                        val newOffset = (currentOffset - jumpSize).coerceAtLeast(0f)
                        scrollOffsetAnim.animateTo(newOffset, tween(config.scrollAnimationDuration))
                    }
                },
                modifier = Modifier.align(Alignment.TopCenter)
            )

            ScrollArrowButton(
                visible = (alphaDown > 0f),
                gradientBrush = Brush.verticalGradient(listOf(Color.Transparent, Color.Black)),
                arrowIcon = androidx.compose.material.icons.Icons.Default.KeyboardArrowDown,
                contentDescription = "Scroll Down",
                onClick = {
                    coroutineScope.launch {
                        val newOffset = (currentOffset + jumpSize).coerceAtMost(maxOffset)
                        scrollOffsetAnim.animateTo(newOffset, tween(config.scrollAnimationDuration))
                    }
                },
                modifier = Modifier.align(Alignment.BottomCenter)
            )
        }
    }
}
