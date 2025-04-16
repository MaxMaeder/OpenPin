package org.openpin.primaryapp

import android.util.Log
import org.openpin.appframework.core.PinActivity
import org.koin.dsl.module
import org.koin.android.ext.android.get
import org.koin.androidx.viewmodel.dsl.viewModel
import org.openpin.appframework.devicestate.location.LocationConfig
import org.openpin.appframework.devicestate.location.ResolvedLocation
import org.openpin.appframework.devicestate.location.WiFiScanEntry
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.hosts.AppContainer
import org.openpin.primaryapp.backend.BackendManager
import org.openpin.primaryapp.configuration.ConfigurationManager
import org.openpin.primaryapp.viewmodels.HomeViewModel
import org.openpin.primaryapp.viewmodels.LinkDeviceViewModel
import org.openpin.primaryapp.viewmodels.OtherSettingsViewModel
import org.openpin.primaryapp.views.HomeView
import kotlin.time.Duration.Companion.seconds

class MainActivity : PinActivity() {

    private suspend fun resolveLocation(entries: List<WiFiScanEntry>): ResolvedLocation? {
        val backendManager: BackendManager = get<BackendManager>()

        if (!backendManager.isPaired) {
            Log.w("ResolveLocation", "Skipping location resolve, device not paired")
            return null
        }

        try {
            return backendManager.sendLocateRequest(entries)
        } catch (err: Exception) {
            Log.e("ResolveLocation", "Failed to resolve location: ${err.message}")
            return null
        }
    }

    override val locationConfig = LocationConfig(
        scanInterval = 30.seconds,
        locationResolver = { entries -> resolveLocation(entries) }
    )

    override val appModules = listOf(
        module {
            single { ConfigurationManager(get()) }
            single { BackendManager(get(), get(), get(), get()) }
            single { GestureManager(get(), get(), get(), get(), get(), get(), get()) }
            viewModel { HomeViewModel(get(), get()) }
            viewModel { LinkDeviceViewModel(get(), get(), get()) }
            viewModel { OtherSettingsViewModel(get(), get(), get(), get()) }
        }
    )

    private lateinit var gestureManager: GestureManager

    override fun onReady() {
        super.onReady()

        gestureManager = get<GestureManager>()
        gestureManager.addListeners()

        val navigationController = NavigationController().apply {
            init { HomeView(navigationController = this) }
        }
        setGraphicsContent {
            AppContainer(navigationController = navigationController)
        }
    }
}