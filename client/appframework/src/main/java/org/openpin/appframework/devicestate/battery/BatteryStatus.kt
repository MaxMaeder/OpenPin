package org.openpin.appframework.devicestate.battery

data class BatteryStatus(
    val percentage: Float,
    val isCharging: Boolean
)
