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
import org.openpin.appframework.ui.config.FadingTextConfig
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun CrossfadeText(
    text: String,
    modifier: Modifier = Modifier,
    fadingTextConfig: FadingTextConfig? = null
) {
    val uiConfig = LocalUIConfig.current
    val config = fadingTextConfig ?: uiConfig.fadingText

    var currentText by remember { mutableStateOf(text) }
    val alphaAnim = remember { Animatable(1f) }

    LaunchedEffect(text) {
        if (text != currentText) {
            alphaAnim.animateTo(0f, animationSpec = tween(config.appearanceTransition.animationDuration))
            currentText = text
            alphaAnim.animateTo(1f, animationSpec = tween(config.appearanceTransition.animationDuration))
        }
    }

    CustomText(
        text = currentText,
        textSize = uiConfig.text.fontSize,
        textConfig = uiConfig.text,
        modifier = modifier.graphicsLayer { alpha = alphaAnim.value }
    )
}