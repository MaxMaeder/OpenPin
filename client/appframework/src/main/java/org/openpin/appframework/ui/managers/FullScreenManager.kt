package org.openpin.appframework.ui.managers

import android.app.Activity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

/**
 * Controls the immersive (fullscreen) mode for an Activity.
 */
class FullScreenManager(private val activity: Activity) {

    fun enable() {
        WindowCompat.setDecorFitsSystemWindows(activity.window, false)
        val insetsController = WindowInsetsControllerCompat(activity.window, activity.window.decorView)
        insetsController.hide(WindowInsetsCompat.Type.systemBars())
        insetsController.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }

    fun disable() {
        WindowCompat.setDecorFitsSystemWindows(activity.window, true)
        // Optionally, restore system bars here.
    }
}