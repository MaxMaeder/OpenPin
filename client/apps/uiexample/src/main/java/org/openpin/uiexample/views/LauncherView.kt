package org.openpin.uiexample.views

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Call
import androidx.compose.material.icons.rounded.Face
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.openpin.appframework.ui.components.CrossfadeText
import org.openpin.appframework.ui.components.Text
import org.openpin.appframework.ui.components.IconButton
import org.openpin.appframework.ui.config.TextConfig
import org.openpin.appframework.ui.locals.LocalUIConfig
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin

fun calculatePentagonOffsets(radius: Float, angleOffset: Float): List<IntOffset> {
    val baseAngles = listOf(0f, 72f, 144f, 216f, 288f)
    return baseAngles.map { baseAngle ->
        val angleRad = Math.toRadians((baseAngle + angleOffset).toDouble())
        val x = (radius * cos(angleRad)).roundToInt()
        val y = (radius * sin(angleRad)).roundToInt()
        IntOffset(x, y)
    }
}

@Composable
fun LauncherView() {
    val density = LocalDensity.current
    val config = LocalUIConfig.current

    val radiusDp = 130.dp
    val radiusPx = with(density) { radiusDp.toPx() }
    val iconSizeDp = 100.dp

    var focusedLabel by remember { mutableStateOf("call") }

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        // Render the background pentagon layout of icons.
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 40.dp)
        ) {
            val iconData = listOf(
                Icons.Rounded.PlayArrow to "play",
                Icons.Rounded.PlayArrow to "play",
                Icons.Rounded.Settings to "settings",
                Icons.Rounded.Face to "face",
                Icons.Rounded.Call to "call"
            )
            val offsets = calculatePentagonOffsets(radiusPx, angleOffset = -126f)
            iconData.forEachIndexed { i, (icon, label) ->
                IconButton(
                    scaleOnFocus = true,
                    icon = icon,
                    contentDescription = null,
                    shadowEnabled = true,
                    onClick = { /* handle click if needed */ },
                    onFocus = { focusedLabel = label },
                    modifier = Modifier.offset { offsets[i] }
                )
            }
        }

        // Render the top fading text and bottom row.
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            CrossfadeText(
                text = focusedLabel,
                modifier = Modifier.offset(y = (-10).dp)
            )
            Spacer(modifier = Modifier.weight(1f))
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp)
            ) {
                Text(
                    text = "wi-fi",
                    textSize = 70.sp,
                    textConfig = TextConfig()
                )
                Text(
                    text = "100%",
                    textSize = 70.sp,
                    textConfig = TextConfig()
                )
            }
        }
    }
}