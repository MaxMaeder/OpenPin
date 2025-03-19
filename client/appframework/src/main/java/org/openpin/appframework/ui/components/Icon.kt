package org.openpin.appframework.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import org.openpin.appframework.ui.config.UIIcon
import org.openpin.appframework.ui.locals.LocalContentColor

@Composable
fun Icon(
    icon: UIIcon,
    size: Dp = 50.dp,
    tint: Color? = null
) {
    val imageVector = ImageVector.vectorResource(id = icon.resId)
    Image(
        imageVector = imageVector,
        contentDescription = null,
        modifier = Modifier.size(size),
        colorFilter = ColorFilter.tint(tint ?: LocalContentColor.current)
    )
}