package org.openpin.appframework.core

import android.Manifest
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.compose.runtime.Composable
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.GlobalContext
import org.koin.core.context.startKoin
import org.koin.core.module.Module
import org.koin.dsl.module
import org.openpin.appframework.audioplayer.AudioPlayer
import org.openpin.appframework.audioplayer.AudioPlayerConfig
import org.openpin.appframework.sensors.camera.CameraConfig
import org.openpin.appframework.sensors.camera.CameraManager
import org.openpin.appframework.sensors.microphone.MicrophoneConfig
import org.openpin.appframework.sensors.microphone.MicrophoneManager
import org.openpin.appframework.ui.components.Text
import org.openpin.appframework.ui.config.UIConfig
import org.openpin.appframework.ui.managers.FullScreenManager
import org.openpin.appframework.ui.locals.LocalUIConfig

abstract class PinActivity : ComponentActivity() {

    open val uiConfig: UIConfig = UIConfig()
    open val audioPlayerConfig: AudioPlayerConfig = AudioPlayerConfig()
    open val microphoneConfig: MicrophoneConfig = MicrophoneConfig()
    open val cameraConfig: CameraConfig = CameraConfig()

    open val appPermissions: Set<String> =
        setOf(Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA)

    private lateinit var permissionManager: PermissionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        requestedOrientation = uiConfig.orientation
        if (uiConfig.fullScreen) FullScreenManager(this).enable()

        permissionManager = PermissionManager(
            activity = this,
            requiredPermissions = appPermissions,
            onGranted = { initializeServices() },
            onDenied = { onPermissionsDenied() }
        )

        permissionManager.start()
    }

    override fun onResume() {
        super.onResume()
        permissionManager.handleResume()
    }

    private fun initializeServices() {
        if (GlobalContext.getOrNull() == null) {
            startKoin {
                androidContext(this@PinActivity)
                modules(getPinModules())
            }
        }
        onPinReady()
    }

    protected abstract fun onPinReady()

    protected open fun onPermissionsDenied() {
        Log.e("PinActivity", "Required permissions denied.")
        setGraphicsContent {
            Box(
                modifier = Modifier.fillMaxSize().background(Color.Black)
            ) {
                Text("Required permissions denied.")
            }
        }
    }

    protected open fun getPinModules(): List<Module> {
        val modules = mutableListOf<Module>()

        modules += module {
            single { this@PinActivity }
            single { audioPlayerConfig }
            single { AudioPlayer(get(), get()) }
        }

        if (Manifest.permission.CAMERA in appPermissions) {
            modules += module {
                single { cameraConfig }
                single { CameraManager(get(), get(), get()) }
            }
        }

        if (Manifest.permission.RECORD_AUDIO in appPermissions) {
            modules += module {
                single { microphoneConfig }
                single { MicrophoneManager(get(), get()) }
            }
        }

        return modules
    }

    protected fun setGraphicsContent(content: @Composable () -> Unit) {
        setContent {
            CompositionLocalProvider(LocalUIConfig provides uiConfig) {
                content()
            }
        }
    }
}
