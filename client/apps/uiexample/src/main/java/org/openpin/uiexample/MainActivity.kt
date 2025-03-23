package org.openpin.uiexample

import org.openpin.appframework.core.PinActivity
import org.openpin.appframework.ui.config.UIConfig
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.hosts.AppContainer
import org.openpin.uiexample.views.MainView

class MainActivity : PinActivity() {

    // Optionally override to customize defaults.
    override val uiConfig: UIConfig = UIConfig(
        // debugShowHitboxes = true, // etc.
    )

    override fun onReady() {
        super.onReady()

        val navigationController = NavigationController().apply {
            init { MainView(navigationController = this) }
        }
        setGraphicsContent {
            AppContainer(navigationController = navigationController)
        }
    }
}