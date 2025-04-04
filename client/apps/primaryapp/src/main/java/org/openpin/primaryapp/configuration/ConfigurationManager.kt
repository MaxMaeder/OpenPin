package org.openpin.primaryapp.configuration

import android.content.Context

class ConfigurationManager(context: Context) {

    private val sharedPreferences = context.getSharedPreferences("app_config", Context.MODE_PRIVATE)

    /** Checks if a value exists for the given key. */
    fun exists(key: ConfigKey): Boolean {
        return sharedPreferences.contains(key.name)
    }

    /** Retrieves a String value for the given key. */
    fun getString(key: ConfigKey, default: String? = null): String? {
        return sharedPreferences.getString(key.name, default)
    }

    /** Retrieves an Int value for the given key. */
    fun getInt(key: ConfigKey, default: Int = 0): Int {
        return sharedPreferences.getInt(key.name, default)
    }

    /** Retrieves a Boolean value for the given key. */
    fun getBoolean(key: ConfigKey, default: Boolean = false): Boolean {
        return sharedPreferences.getBoolean(key.name, default)
    }

    /** Retrieves a Long value for the given key. */
    fun getLong(key: ConfigKey, default: Long = 0L): Long {
        return sharedPreferences.getLong(key.name, default)
    }

    /** Retrieves a Float value for the given key. */
    fun getFloat(key: ConfigKey, default: Float = 0f): Float {
        return sharedPreferences.getFloat(key.name, default)
    }

    /** Saves a value for the given key. Supported types are String, Int, Boolean, Long, and Float. */
    fun set(key: ConfigKey, value: Any) {
        val editor = sharedPreferences.edit()
        when (value) {
            is String -> editor.putString(key.name, value)
            is Int -> editor.putInt(key.name, value)
            is Boolean -> editor.putBoolean(key.name, value)
            is Long -> editor.putLong(key.name, value)
            is Float -> editor.putFloat(key.name, value)
            else -> throw IllegalArgumentException("Unsupported type for SharedPreferences")
        }
        editor.apply()
    }
}