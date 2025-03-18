package org.openpin.uiexample.views

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import org.openpin.appframework.ui.components.Text
import org.openpin.appframework.ui.components.TextButton
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun SecondaryView(navigationController: NavigationController, message: String) {
    val config = LocalUIConfig.current
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(config.viewMargin)
    ) {
        Text(
            text = message,
            textSize = config.text.fontSize,
            textConfig = config.text,
            color = Color.White
        )
        TextButton(
            text = "Btn 3",
            onClick = { navigationController.push { SecondaryView(navigationController, "View 3") } },
            modifier = Modifier.padding(vertical = 8.dp)
        )
    }
}