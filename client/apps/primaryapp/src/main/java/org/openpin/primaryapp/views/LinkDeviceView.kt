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
import org.koin.androidx.compose.koinViewModel
import org.openpin.appframework.ui.components.Text
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.primaryapp.viewmodels.LinkDeviceViewModel

@Composable
fun LinkDeviceView(navigationController: NavigationController) {
    val viewModel: LinkDeviceViewModel = koinViewModel()

    // Start scanning when the view appears.
    LaunchedEffect(Unit) {
        viewModel.startScanning(navigationController)
    }

    // Ensure cleanup is called when the view leaves composition.
    DisposableEffect(Unit) {
        onDispose { viewModel.cleanup() }
    }

    // UI displaying that scanning is in progress.
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text="Scanning...",
            size = 70.sp,
            modifier = Modifier.padding(bottom = 10.dp)
        )
        Text(
            text="Lower hand, bring QR into view of camera",
            size = 50.sp,
            align = TextAlign.Center
        )
    }
}
