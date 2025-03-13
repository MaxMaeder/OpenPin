package org.OpenPin.Daemon

import kotlin.system.getTimeMillis

object SystemUtils {
    @Suppress("DEPRECATION")
    fun getMillis(): Long = getTimeMillis()
}