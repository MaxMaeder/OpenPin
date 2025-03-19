package org.openpin.appframework.core

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.compose.runtime.Composable
import androidx.activity.compose.setContent
import androidx.compose.runtime.CompositionLocalProvider
import org.openpin.appframework.audioplayer.AudioPlayer
import org.openpin.appframework.audioplayer.AudioPlayerConfig
import org.openpin.appframework.audioplayer.LocalAudioPlayer
import org.openpin.appframework.ui.config.UIConfig
import org.openpin.appframework.ui.controllers.FullScreenController
import org.openpin.appframework.ui.locals.LocalUIConfig

abstract class PinActivity : ComponentActivity() {

    open val uiConfig: UIConfig = UIConfig()
    open val audioPlayerConfig: AudioPlayerConfig = AudioPlayerConfig()

    lateinit var audioPlayer: AudioPlayer

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Lock orientation and enable full screen based on UI config.
        requestedOrientation = uiConfig.orientation
        if (uiConfig.fullScreen) {
            FullScreenController(this).enable()
        }

        audioPlayer = AudioPlayer(this, audioPlayerConfig)
    }

    protected fun setGraphicsContent(content: @Composable () -> Unit) {
        setContent {
            CompositionLocalProvider(
                LocalUIConfig provides uiConfig,
                LocalAudioPlayer provides audioPlayer
            ) {
                content()
            }
        }
    }
}