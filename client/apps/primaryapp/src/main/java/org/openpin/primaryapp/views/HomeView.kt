package org.openpin.primaryapp.views

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.openpin.appframework.ui.components.Text
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.hosts.ContextMenuArea

@Composable
fun HomeView(navigationController: NavigationController) {
    ContextMenuArea(
        contextMenu = { LauncherView(navigationController) }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 100.dp),
            verticalArrangement = Arrangement.Center
        ) {
            // Top row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Madison", size = 50.sp)
                Text("70F", size = 50.sp)
            }

            // Middle row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                Text("12:00", size = 150.sp)
            }

            // Bottom row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Apr 3", size = 50.sp)
                Text("82%", size = 50.sp)
            }
        }
    }
}