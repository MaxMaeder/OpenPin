package org.openpin.appframework.ui.components

import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.TextUnit
import org.openpin.appframework.ui.config.TextConfig

@Composable
fun Text(
    text: String,
    textSize: TextUnit,
    textConfig: TextConfig,
    modifier: Modifier = Modifier,
    color: androidx.compose.ui.graphics.Color? = null
) {
    Text(
        text = text,
        fontSize = textSize,
        fontWeight = textConfig.fontWeight,
        fontFamily = textConfig.fontFamily,
        color = color ?: LocalContentColor.current,
        modifier = modifier
    )
}