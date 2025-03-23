package org.openpin.appframework.devicestate.location

data class WiFiScanEntry(
    val bssid: String,
    val frequency: Int,
    val rssi: Int,
    val ageSec: Float,
    val ssid: String,
    val flags: String
)