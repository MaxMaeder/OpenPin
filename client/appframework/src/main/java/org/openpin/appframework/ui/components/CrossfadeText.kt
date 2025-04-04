package org.openpin.appframework.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.TextUnit
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun CrossfadeText(
    text: String,
    modifier: Modifier = Modifier,
    size: TextUnit? = null,
    weight: FontWeight? = null,
    align: TextAlign = TextAlign.Unspecified
) {
    val config = LocalUIConfig.current.fadingText

    var currentText by remember { mutableStateOf(text) }
    val alphaAnim = remember { Animatable(1f) }

    LaunchedEffect(text) {
        if (text != currentText) {
            alphaAnim.animateTo(0f, animationSpec = tween(config.animationDuration))
            currentText = text
            alphaAnim.animateTo(1f, animationSpec = tween(config.animationDuration))
        }
    }

    Text(
        text = currentText,
        size = size,
        weight = weight,
        align = align,
        modifier = modifier.graphicsLayer { alpha = alphaAnim.value }
    )
}