package org.openpin.app.util

import android.content.Context
import java.util.UUID

object DeviceIdentity {
    private const val PREFS_NAME = "app_prefs"
    private const val KEY_INSTALLATION_ID = "installation_id"

    private var _identifier: String? = null

    val identifier: String
        get() = _identifier ?: throw IllegalStateException("DeviceIdentity not initialized")

    fun initialize(context: Context) {
        val sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        _identifier = sharedPreferences.getString(KEY_INSTALLATION_ID, null) ?: run {
            val newId = UUID.randomUUID().toString()
            sharedPreferences.edit().putString(KEY_INSTALLATION_ID, newId).apply()
            newId
        }
    }
}
