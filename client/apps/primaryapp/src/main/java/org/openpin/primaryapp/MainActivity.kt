package org.openpin.primaryapp

import org.openpin.appframework.core.PinActivity
import org.koin.dsl.module
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.androidx.viewmodel.ext.android.getViewModel

class MainActivity : PinActivity() {

    override val appModules = listOf(
        module {
            viewModel { GestureViewModel(get(), get(), get(), get(), get()) }
        }
    )

    private lateinit var gestureViewModel: GestureViewModel

    override fun onReady() {
        super.onReady()

        gestureViewModel = getViewModel()
        gestureViewModel.addListeners()
    }
}