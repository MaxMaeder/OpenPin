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
import androidx.lifecycle.LifecycleOwner
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.GlobalContext
import org.koin.core.context.startKoin
import org.koin.core.context.stopKoin
import org.koin.core.module.Module
import org.koin.core.context.GlobalContext.get as getKoin
import org.koin.dsl.module
import org.openpin.appframework.audioplayer.AudioPlayer
import org.openpin.appframework.audioplayer.AudioPlayerConfig
import org.openpin.appframework.daemonbridge.gesture.GestureHandler
import org.openpin.appframework.daemonbridge.gesture.GestureType
import org.openpin.appframework.daemonbridge.manager.DaemonBridgeManager
import org.openpin.appframework.daemonbridge.manager.DaemonIntentType
import org.openpin.appframework.daemonbridge.process.ProcessHandler
import org.openpin.appframework.devicestate.battery.BatteryManager
import org.openpin.appframework.devicestate.identity.IdentityManager
import org.openpin.appframework.devicestate.location.LocationConfig
import org.openpin.appframework.devicestate.location.LocationManager
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
    open val locationConfig: LocationConfig = LocationConfig()

    open val appPermissions: Set<String> =
        setOf(Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA)
    protected open val appModules: List<Module> = emptyList()

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
                modules(getServiceModules() + appModules)
            }
        }
        onReady()
    }

    protected open fun onReady() {
        if (audioPlayerConfig.enableVolumeGestures) {
            val gestureHandler = getKoin().get<GestureHandler>()
            val player = getKoin().get<AudioPlayer>()

            // Touchpad is vertically flipped, this works for now
            gestureHandler.subscribeGesture(1, GestureType.DRAG_UP) {
                player.changeMasterVolume(-audioPlayerConfig.volumeGestureStepSize)
            }
            gestureHandler.subscribeGesture(1, GestureType.DRAG_DOWN) {
                player.changeMasterVolume(audioPlayerConfig.volumeGestureStepSize)
            }
        }

        if (locationConfig.scanInterval != null) {
            val locationManager = getKoin().get<LocationManager>()
            locationManager.start()
        }
    }

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

    protected open fun getServiceModules(): List<Module> {
        val modules = mutableListOf<Module>()

        modules += module {
            single { this@PinActivity }

            single { IdentityManager(get()) }

            single { audioPlayerConfig }
            single { AudioPlayer(get(), get()) }

            single { GestureHandler() }
            single { ProcessHandler() }

            single(createdAtStart = true) {
                val receiverMap = mapOf(
                    DaemonIntentType.GESTURE to get<GestureHandler>(),
                    DaemonIntentType.PROCESS_DONE to get<ProcessHandler>()
                )
                DaemonBridgeManager(
                    context = get(),
                    receiverMap = receiverMap,
                )
            }

            single { locationConfig }
            single { LocationManager(get(), get()) }

            single { BatteryManager(get()) }
        }

        if (Manifest.permission.CAMERA in appPermissions) {
            modules += module {
                single { cameraConfig }
                single<LifecycleOwner> { this@PinActivity }
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

    override fun onDestroy() {
        super.onDestroy()
        stopKoin()
    }
}
