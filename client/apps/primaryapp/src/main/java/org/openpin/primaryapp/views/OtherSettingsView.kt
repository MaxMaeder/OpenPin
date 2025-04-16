package org.openpin.primaryapp.views

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.koin.compose.koinInject
import org.openpin.appframework.ui.components.Text
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.primaryapp.viewmodels.OtherSettingsViewModel

@Composable
fun OtherSettingsView(navigationController: NavigationController) {
    val viewModel: OtherSettingsViewModel = koinInject()

    // Start the gesture listener logic when the view appears.
    LaunchedEffect(Unit) {
        viewModel.start(navigationController)
    }

    // Clean up the gesture listener when the view leaves composition.
    DisposableEffect(Unit) {
        onDispose {
            viewModel.cleanup()
        }
    }

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Opening Settings",
            size = 70.sp,
            modifier = Modifier.padding(bottom = 10.dp)
        )
        Text(
            text = "To get back, double-tap the touchpad. Try it now to proceed.",
            size = 50.sp,
            align = TextAlign.Center
        )
    }
}