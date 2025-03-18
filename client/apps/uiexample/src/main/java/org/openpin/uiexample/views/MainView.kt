package org.openpin.uiexample.views

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.openpin.appframework.ui.components.TextButton
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun MainView(navigationController: NavigationController) {
    val config = LocalUIConfig.current
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(config.viewMargin),
        verticalArrangement = Arrangement.Center
    ) {
        TextButton(
            text = "Button 1",
            scaleOnFocus = true,
            onClick = { navigationController.push { SecondaryView(navigationController, "View 1") } },
            modifier = Modifier.padding(vertical = 8.dp)
        )
        TextButton(
            text = "Launcher",
            scaleOnFocus = true,
            onClick = { navigationController.push { LauncherView() } },
            modifier = Modifier.padding(vertical = 8.dp)
        )
        TextButton(
            text = "Scroll",
            scaleOnFocus = true,
            onClick = { navigationController.push { ScrollView() } },
            modifier = Modifier.padding(vertical = 8.dp)
        )
    }
}