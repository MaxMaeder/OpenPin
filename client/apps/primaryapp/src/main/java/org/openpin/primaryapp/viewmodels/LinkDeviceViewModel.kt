package org.openpin.primaryapp.viewmodels

import org.openpin.appframework.media.soundplayer.SoundPlayer
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.koin.core.component.KoinComponent
import org.openpin.appframework.media.soundplayer.SystemSound
import org.openpin.appframework.sensors.camera.CameraManager
import org.openpin.appframework.sensors.camera.CaptureResult
import org.openpin.appframework.sensors.camera.CaptureSession
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.primaryapp.backend.BackendManager

class LinkDeviceViewModel(
    private val soundPlayer: SoundPlayer,
    private val cameraManager: CameraManager,
    private val backendManager: BackendManager
) : ViewModel(), KoinComponent {

    private var scanSoundSid: Int? = null
    private var session: CaptureSession<String?>? = null
    @Volatile private var isCancelled: Boolean = false

    fun startScanning(navigationController: NavigationController) {
        viewModelScope.launch {
            scanSoundSid = soundPlayer.play(SystemSound.QR_SCAN.key)

            // Start scanning with a timeout of 30 seconds.
            session = cameraManager.scanQrCode(timeoutMs = 30000L)
            val result = session?.waitForResult()

            // Stop the scan sound immediately after a result is obtained.
            scanSoundSid?.let { soundPlayer.stop(it) }

            // If cleanup was called (and the view dismissed), abort further processing.
            if (isCancelled) return@launch

            delay(100) // Delay for a smoother audio transition.

            // Process the result only if we're not cancelled.
            if (result is CaptureResult.Success && result.data != null) {
                soundPlayer.play(SystemSound.QR_FINISH.key)
                Log.e("QR", "Scanned result: ${result.data}")
                backendManager.pairDevice(result.data!!)
            } else {
                soundPlayer.play(SystemSound.QR_FAILED.key)
                Log.e("QR", "QR code scan failed")
            }

            // Navigate away only if scanning wasn't cancelled.
            if (!isCancelled) {
                navigationController.pop()
            }
        }
    }

    fun cleanup() {
        isCancelled = true
        scanSoundSid?.let { soundPlayer.stop(it) }
        session?.stop()
    }

    override fun onCleared() {
        cleanup()
        super.onCleared()
    }
}
