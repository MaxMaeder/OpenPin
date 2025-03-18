package org.openpin.appframework.core

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.compose.runtime.Composable
import androidx.activity.compose.setContent
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import org.openpin.appframework.ui.config.UIConfig
import org.openpin.appframework.ui.locals.LocalUIConfig

abstract class PinActivity : ComponentActivity() {

    /**
     * Override this in your app to customize the entire UI configuration.
     */
    open val config: UIConfig = UIConfig()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Lock orientation and enable full screen based on config.
        requestedOrientation = config.orientation

        if (config.fullScreen) {
            WindowCompat.setDecorFitsSystemWindows(window, false)
            val insetsController = WindowInsetsControllerCompat(window, window.decorView)
            insetsController.hide(androidx.core.view.WindowInsetsCompat.Type.systemBars())
            insetsController.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }

    protected fun setGraphicsContent(content: @Composable () -> Unit) {
        setContent {
            // Provide the UI configuration to the entire composition.
            androidx.compose.runtime.CompositionLocalProvider(LocalUIConfig provides config) {
                content()
            }
        }
    }
}