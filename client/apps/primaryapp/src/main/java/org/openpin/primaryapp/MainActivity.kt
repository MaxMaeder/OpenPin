package org.openpin.primaryapp

import org.openpin.appframework.core.PinActivity
import org.koin.dsl.module
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.androidx.viewmodel.ext.android.getViewModel
import org.openpin.appframework.devicestate.location.LocationConfig
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.hosts.AppContainer
import org.openpin.primaryapp.backend.BackendManager
import org.openpin.primaryapp.configuration.ConfigurationManager
import org.openpin.primaryapp.views.HomeView
import kotlin.time.Duration.Companion.seconds

class MainActivity : PinActivity() {

    override val locationConfig = LocationConfig(
        scanInterval = 30.seconds,
        mapsApiKey = BuildConfig.MAPS_API_KEY
    )

    override val appModules = listOf(
        module {
            single { ConfigurationManager(get()) }
            single { BackendManager(get(), get(), get(), get()) }
            viewModel { GestureViewModel(get(), get(), get(), get(), get(), get(), get()) }
        }
    )

    private lateinit var gestureViewModel: GestureViewModel

    override fun onReady() {
        super.onReady()

        gestureViewModel = getViewModel()
        gestureViewModel.addListeners()

        val navigationController = NavigationController().apply {
            init { HomeView(navigationController = this) }
        }
        setGraphicsContent {
            AppContainer(navigationController = navigationController)
        }
    }
}