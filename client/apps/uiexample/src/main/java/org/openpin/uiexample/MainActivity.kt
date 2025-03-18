package org.openpin.uiexample

import android.os.Bundle
import org.openpin.appframework.core.PinActivity
import org.openpin.appframework.ui.config.UIConfig
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.appframework.ui.hosts.AppContainer
import org.openpin.uiexample.views.MainView

class MainActivity : PinActivity() {

    // Optionally override to customize defaults.
    override val config: UIConfig = UIConfig(
        // debugShowHitboxes = true, // etc.
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val navigationController = NavigationController().apply {
            init { MainView(navigationController = this) }
        }
        setGraphicsContent {
            AppContainer(navigationController = navigationController)
        }
    }
}