package org.openpin.appframework.core

import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts

class PermissionManager(
    private val activity: ComponentActivity,
    private val requiredPermissions: Set<String>,
    private val onGranted: () -> Unit,
    private val onDenied: () -> Unit
) {
    private var awaitingAllFilesAccess = false

    private val permissionLauncher =
        activity.registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
            val allGranted = result.all { it.value }
            if (hasAllFilesAccess() && allGranted) onGranted()
            else onDenied()
        }

    fun start() {
        if (!hasAllFilesAccess()) {
            requestAllFilesAccess()
        } else {
            requestStandardPermissions()
        }
    }

    fun handleResume() {
        if (awaitingAllFilesAccess && hasAllFilesAccess()) {
            awaitingAllFilesAccess = false
            requestStandardPermissions()
        }
    }

    private fun hasAllFilesAccess(): Boolean {
        return Environment.isExternalStorageManager()
    }

    private fun requestAllFilesAccess() {
        awaitingAllFilesAccess = true
        val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
            data = Uri.parse("package:${activity.packageName}")
        }
        activity.startActivity(intent)
    }

    private fun requestStandardPermissions() {
        if (requiredPermissions.isEmpty()) {
            onGranted()
        } else {
            permissionLauncher.launch(requiredPermissions.toTypedArray())
        }
    }
}
