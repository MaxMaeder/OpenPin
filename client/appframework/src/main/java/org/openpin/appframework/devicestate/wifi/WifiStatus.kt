package org.openpin.appframework.devicestate.wifi

data class WifiStatus(
    val isConnected: Boolean,
    val ssid: String?,
    val signalStrength: Int  // Signal strength percentage from 0 to 100
)
