package org.openpin.primaryapp.views

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import kotlinx.coroutines.delay
import org.koin.androidx.compose.koinViewModel
import org.openpin.appframework.ui.components.Text
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.hosts.ContextMenuArea
import org.openpin.primaryapp.HomeViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

@Composable
fun ClockDisplay(viewModel: HomeViewModel) {
    var adjustedTime by remember { mutableLongStateOf(viewModel.getAdjustedTime()) }

    LaunchedEffect(Unit) {
        while (true) {
            adjustedTime = viewModel.getAdjustedTime()
            delay(1000)
        }
    }

    val timeString = remember(adjustedTime) {
        val formatter = SimpleDateFormat("hh:mm", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }
        formatter.format(Date(adjustedTime))
    }

    Text(timeString, size = 210.sp)
}


@Composable
fun HomeView(navigationController: NavigationController) {
    val viewModel: HomeViewModel = koinViewModel()
    val homeData by viewModel.homeData.collectAsState()

    // Trigger data fetch when the view appears
    LaunchedEffect(Unit) {
        viewModel.fetchHomeData()
    }

    val lifecycleOwner = LocalLifecycleOwner.current

    // Trigger fetch on resume
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                viewModel.fetchHomeData()
            }
        }

        lifecycleOwner.lifecycle.addObserver(observer)

        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    ContextMenuArea(
        contextMenu = { LauncherView(navigationController) }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize(),
            verticalArrangement = Arrangement.Center
        ) {
            // Top row
            Row(
                modifier = Modifier
                    .fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text(homeData.location ?: "—", size = 70.sp)
                Spacer(modifier = Modifier.width(50.dp))
                Text(homeData.temp ?: "—", size = 70.sp)
            }

            // Middle row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                ClockDisplay(viewModel)
            }

            // Bottom row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                val dateString = SimpleDateFormat("MMM d", Locale.getDefault())
                    .format(Date(homeData.time))

                Text(dateString, size = 70.sp)
                Spacer(modifier = Modifier.width(50.dp))
                Text("82%", size = 70.sp)
            }
        }
    }
}