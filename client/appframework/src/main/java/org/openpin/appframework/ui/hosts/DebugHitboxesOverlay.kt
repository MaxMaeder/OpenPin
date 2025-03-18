package org.openpin.appframework.ui.hosts

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import org.openpin.appframework.ui.locals.LocalMagneticTargetsController
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun DebugHitboxesOverlay() {
    val config = LocalUIConfig.current
    val controller = LocalMagneticTargetsController.current

    if (config.debugShowHitboxes) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            // Draw a red rectangle for each magnetic target.
            controller.targets.values.forEach { target ->
                drawRect(
                    color = Color.Red,
                    topLeft = Offset(target.rect.left, target.rect.top),
                    size = Size(target.rect.width, target.rect.height),
                    style = Stroke(width = 2.dp.toPx())
                )
            }
        }
    }
}