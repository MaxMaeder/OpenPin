package org.openpin.primaryapp.views

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import org.koin.androidx.compose.koinViewModel
import org.openpin.appframework.ui.components.Text
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.effects.OnResume
import org.openpin.appframework.ui.hosts.ContextMenuArea
import org.openpin.primaryapp.viewmodels.HomeViewModel
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
    val isPaired by viewModel.isPaired.collectAsState()
    val batteryPercentage by viewModel.batteryPercentage.collectAsState()

    // Trigger data fetch when the view appears
    LaunchedEffect(Unit) {
        viewModel.fetchHomeData()
    }

    // Also trigger a data fetch whenever the lifecycle resumes.
    OnResume {
        viewModel.fetchHomeData()
    }

    ContextMenuArea(
        contextMenu = { LauncherView(navigationController) }
    ) {
        if (isPaired) {
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
                    Text("${batteryPercentage}%", size = 70.sp)
                }
            }
        } else {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Pair Device",
                    size = 70.sp,
                    modifier = Modifier.padding(bottom = 10.dp)
                )
                Text(
                    text = "Push hand out to get started.",
                    size = 50.sp,
                    align = TextAlign.Center
                )
            }
        }
    }
}