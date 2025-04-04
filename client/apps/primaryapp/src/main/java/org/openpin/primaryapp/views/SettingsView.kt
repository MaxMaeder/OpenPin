package org.openpin.primaryapp.views

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.openpin.appframework.ui.components.Text
import org.openpin.appframework.ui.components.TextButton
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.locals.LocalUIConfig

@Composable
fun SettingsView(navigationController: NavigationController) {
    val config = LocalUIConfig.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(config.viewMargin),
        verticalArrangement = Arrangement.Top
    ) {
        Text(
            text = "Settings",
            modifier = Modifier.padding(bottom = 8.dp),
            size = 80.sp
        )
        TextButton(
            text = "Link .Center",
            onClick = {
                navigationController.push {
                    LinkDeviceView(navigationController)
                } },
            modifier = Modifier.padding(vertical = 8.dp)
        )
    }
}