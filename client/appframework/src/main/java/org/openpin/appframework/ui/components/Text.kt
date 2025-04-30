package org.openpin.appframework.ui.components

import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.TextUnit
import org.openpin.appframework.ui.locals.LocalContentColor
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun Text(
    text: String,
    modifier: Modifier = Modifier,
    size: TextUnit? = null,
    weight: FontWeight? = null,
    align: TextAlign = TextAlign.Unspecified,
    maxLines: Int = Int.MAX_VALUE,
    softWrap: Boolean = true,
    overflow: TextOverflow = TextOverflow.Clip
) {
    val config = LocalUIConfig.current.text

    BasicText(
        text = text,
        style = TextStyle(
            textAlign = align,
            fontFamily = config.fontFamily,
            fontSize = size ?: config.fontSize,
            fontWeight = weight ?: config.fontWeight,
            color = LocalContentColor.current
        ),
        modifier = modifier,
        maxLines = maxLines,
        softWrap = softWrap,
        overflow = overflow
    )
}
