package org.openpin.primaryapp.viewmodels

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.openpin.appframework.daemonbridge.power.PowerHandler
import org.openpin.appframework.daemonbridge.process.ProcessHandler
import org.openpin.appframework.daemonbridge.process.ShellProcess
import org.openpin.appframework.media.soundplayer.SoundPlayer
import org.openpin.appframework.media.soundplayer.SystemSound
import org.openpin.appframework.ui.controllers.NavigationController
import org.openpin.primaryapp.GestureManager

class OtherSettingsViewModel(
    private val soundPlayer: SoundPlayer,
    private val processHandler: ProcessHandler,
    private val powerHandler: PowerHandler,
    private val gestureManager: GestureManager
) : ViewModel() {

    // Define the shell commands.
    private val LAUNCH_SETTINGS_CMD =
        "/data/local/tmp/pty_exec \"am start -n humane.experience.settings/.SettingsExperience\""
    private val LAUNCH_PRIMARYAPP_CMD =
        "/data/local/tmp/pty_exec \"am start -n org.openpin.primaryapp/.MainActivity\""

    // Executes the given shell command in a coroutine.
    private fun executeCommand(cmdStr: String) {
        viewModelScope.launch {
            Log.e("OtherSettingsViewModel", "Changing apps! $cmdStr")
            try {
                val cmd = ShellProcess(cmdStr)
                processHandler.execute(cmd)
                if (cmd.error.isNotEmpty())
                    throw Exception(cmd.error)
            } catch (err: Exception) {
                Log.e("OtherSettingsViewModel", "Failed to change apps: ${err.message}")
            }
        }
    }

    /**
     * Starts listening for gesture toggles.
     * The navigationController is provided only when a gesture requires navigation.
     */
    fun start(navigationController: NavigationController) {
        gestureManager.enableSettingsToggle { toggled ->
            // Play a tap sound regardless of the toggle state.
            soundPlayer.play(SystemSound.LASER_TAP.key)
            if (toggled) {
                powerHandler.setWakelock(true)
                executeCommand(LAUNCH_SETTINGS_CMD)
            } else {
                powerHandler.setWakelock(false)
                executeCommand(LAUNCH_PRIMARYAPP_CMD)
                // Navigate back when the toggle is turned off.
                navigationController.pop()
            }
        }
    }

    /**
     * Cleans up by disabling the gesture toggle.
     */
    fun cleanup() {
        gestureManager.disableSettingsToggle()
    }

    override fun onCleared() {
        cleanup()
        super.onCleared()
    }
}
