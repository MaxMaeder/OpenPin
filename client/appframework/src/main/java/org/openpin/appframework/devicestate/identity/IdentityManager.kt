package org.openpin.appframework.devicestate.identity

import android.content.Context
import java.util.UUID

class IdentityManager(private val context: Context) {
    private val PREFS_NAME = "app_framework_id"
    private val KEY_INSTALLATION_ID = "installation_id"

    private val _identifier: String

    init {
        val sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        _identifier = sharedPreferences.getString(KEY_INSTALLATION_ID, null) ?: run {
            val newId = UUID.randomUUID().toString()
            sharedPreferences.edit().putString(KEY_INSTALLATION_ID, newId).apply()
            newId
        }
    }

    val identifier: String
        get() = _identifier
}