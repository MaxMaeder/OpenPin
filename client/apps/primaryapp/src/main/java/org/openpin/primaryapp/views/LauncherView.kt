package org.openpin.primaryapp.views

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
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
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
import org.openpin.appframework.ui.components.IconButton
import org.openpin.appframework.ui.components.Text
import org.openpin.appframework.ui.config.UIIcon
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.locals.LocalUIConfig
import org.openpin.appframework.utils.update
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin

data class LauncherButton(
    val icon: UIIcon,
    val label: String,
    val launchView: @Composable () -> Unit
)

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
fun LauncherView(navigationController: NavigationController) {
    val density = LocalDensity.current
    val radiusDp = 130.dp
    val radiusPx = with(density) { radiusDp.toPx() }

    var focusedLabel by remember { mutableStateOf("call") }

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        // Background pentagon layout of icons.
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 40.dp)
        ) {
            CompositionLocalProvider(
                LocalUIConfig provides LocalUIConfig.current.update {
                    copy(
                        iconButton = iconButton.update {
                            copy(
                                iconSize = 80.dp,
                                base = base.update {
                                    copy(padding = 25.dp)
                                }
                            )
                        }
                    )
                }
            ) {
                // Define the buttons and specify the view each should launch.
                val launcherButtons = listOf(
                    LauncherButton(UIIcon.MusicalNotes, "play") {
                        ComingSoonView()
                    },
                    LauncherButton(UIIcon.Chatbox, "messages") {
                        ComingSoonView()
                    },
                    LauncherButton(UIIcon.Call, "call") {
                        ComingSoonView()
                    },
                    LauncherButton(UIIcon.Settings, "settings") {
                        SettingsView(navigationController = navigationController)
                    },
                    LauncherButton(UIIcon.Camera, "capture") {
                        ComingSoonView()
                    }
                )

                val offsets = calculatePentagonOffsets(radiusPx, angleOffset = -126f)
                launcherButtons.forEachIndexed { i, button ->
                    IconButton(
                        icon = button.icon,
                        onClick = {
                            navigationController.push {
                                button.launchView()
                            }
                        },
                        onFocus = { focusedLabel = button.label },
                        modifier = Modifier.offset { offsets[i] }
                    )
                }
            }
        }

        // Top fading text and bottom row.
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            CrossfadeText(
                text = focusedLabel,
                size = 90.sp,
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
                    size = 70.sp,
                )
                Text(
                    text = "100%",
                    size = 70.sp,
                )
            }
        }
    }
}
