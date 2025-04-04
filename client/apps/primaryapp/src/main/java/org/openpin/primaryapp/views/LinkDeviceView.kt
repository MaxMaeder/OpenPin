package org.openpin.primaryapp.views

import SoundPlayer
import android.util.Log
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import org.koin.compose.koinInject
import org.openpin.appframework.media.soundplayer.SystemSound
import org.openpin.appframework.sensors.camera.CameraManager
import org.openpin.appframework.sensors.camera.CaptureResult
import org.openpin.appframework.ui.components.Text
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.primaryapp.backend.BackendManager

@Composable
fun LinkDeviceView(navigationController: NavigationController) {
    val soundPlayer = koinInject<SoundPlayer>()
    val cameraManager = koinInject<CameraManager>()
    val backendManager = koinInject<BackendManager>()

    // Launch a coroutine when the composable enters the composition.
    LaunchedEffect(Unit) {
        val scanSoundSid = soundPlayer.play(SystemSound.QR_SCAN.key)

        // Start scanning with a 30-second timeout.
        val session = cameraManager.scanQrCode(timeoutMs = 30000L)

        val result = session.waitForResult()
        soundPlayer.stop(scanSoundSid)
        delay(100) // Just for the audio lol

        if (result is CaptureResult.Success && result.data != null) {
            soundPlayer.play(SystemSound.QR_FINISH.key)
            Log.e("QR", "Scanned result: ${result.data}")

            backendManager.pairDevice(result.data!!)
        } else {
            soundPlayer.play(SystemSound.QR_FAILED.key)
            Log.e("QR", "QR code scan failed")
        }

        navigationController.pop()
    }

    // UI displaying that scanning is in progress.
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text="Scanning...",
            size = 70.sp,
            modifier = Modifier.padding(bottom = 10.dp)
        )
        Text(
            text="Lower hand, bring QR into view of camera",
            size = 50.sp,
            align = TextAlign.Center
        )
    }
}
