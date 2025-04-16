package org.openpin.primaryapp.views

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.koin.compose.koinInject
import org.openpin.appframework.devicestate.wifi.WifiManager
import org.openpin.appframework.ui.components.Icon
import org.openpin.appframework.ui.components.Text
import org.openpin.appframework.ui.components.TextButton
import org.openpin.appframework.ui.config.UIIcon
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.locals.LocalUIConfig
import org.openpin.primaryapp.backend.BackendManager

@Composable
fun ConnectionStatus(name: String, connected: Boolean) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(15.dp)
    ) {
        Icon(if (connected) UIIcon.CheckmarkCircle else UIIcon.CloseCircle, size=90.dp)
        Text(name)
    }
}

@Composable
fun SettingsView(navigationController: NavigationController) {
    val config = LocalUIConfig.current
    val wifiManager = koinInject<WifiManager>()
    val backendManager = koinInject<BackendManager>()

    // Cache the connection and pairing state when the view is first composed.
    val cachedIsConnected = remember { wifiManager.status.isConnected }
    val cachedIsPaired = remember { backendManager.isPaired }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(config.viewMargin),
        verticalArrangement = Arrangement.spacedBy(30.dp)
    ) {
        Text(
            text = "Settings",
            size = 90.sp
        )

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(25.dp)
        ) {
            ConnectionStatus("WiFi", cachedIsConnected)
            ConnectionStatus("Link", cachedIsPaired)
        }

        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(15.dp)
        ) {
            val linkText = if (cachedIsPaired) "Relink .Center" else "Link .Center"

            TextButton(
                text = linkText,
                onClick = {
                    navigationController.push {
                        LinkDeviceView(navigationController)
                    }
                }
            )
            TextButton(
                text = "Other Settings",
                onClick = {
                    navigationController.push {
                        OtherSettingsView(navigationController)
                    }
                }
            )
        }
    }
}
