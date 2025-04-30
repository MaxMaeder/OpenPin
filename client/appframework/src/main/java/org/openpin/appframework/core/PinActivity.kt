package org.openpin.appframework.core

import org.openpin.appframework.media.soundplayer.SoundPlayer
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
import org.openpin.appframework.media.soundplayer.SoundPlayerConfig
import org.openpin.appframework.daemonbridge.gesture.GestureHandler
import org.openpin.appframework.daemonbridge.manager.DaemonBridgeManager
import org.openpin.appframework.daemonbridge.manager.DaemonIntentType
import org.openpin.appframework.daemonbridge.power.PowerHandler
import org.openpin.appframework.daemonbridge.process.ProcessHandler
import org.openpin.appframework.devicestate.battery.BatteryManager
import org.openpin.appframework.devicestate.identity.IdentityManager
import org.openpin.appframework.devicestate.location.LocationConfig
import org.openpin.appframework.devicestate.location.LocationManager
import org.openpin.appframework.devicestate.wifi.WifiManager
import org.openpin.appframework.media.AudioType
import org.openpin.appframework.media.speechplayer.SpeechPlayer
import org.openpin.appframework.media.volume.VolumeConfig
import org.openpin.appframework.media.volume.VolumeManager
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
    open val volumeConfig: VolumeConfig = VolumeConfig()
    open val soundPlayerConfig: SoundPlayerConfig = SoundPlayerConfig()
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

            single { GestureHandler() }
            single { ProcessHandler() }
            single { PowerHandler() }

            single(createdAtStart = true) {
                val receiverMap = mapOf(
                    DaemonIntentType.GESTURE to get<GestureHandler>(),
                    DaemonIntentType.PROCESS_DONE to get<ProcessHandler>(),
                    DaemonIntentType.POWER_EVENT to get<PowerHandler>()
                )
                DaemonBridgeManager(
                    context = get(),
                    receiverMap = receiverMap,
                )
            }

            single { soundPlayerConfig }
            single { SoundPlayer(get(), get()) }

            single { SpeechPlayer(get()) }

            single { volumeConfig }
            single(createdAtStart = true) {
                val sourceMap = mapOf(
                    AudioType.SOUND to get<SoundPlayer>(),
                    AudioType.SPEECH to get<SpeechPlayer>()
                )
                VolumeManager(
                    context = get(),
                    config = get(),
                    gestureHandler = get(),
                    audioSources = sourceMap
                )
            }

            single { locationConfig }
            single { LocationManager(get(), get(), get()) }

            single { BatteryManager(get()) }
            single { WifiManager(get()) }
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
