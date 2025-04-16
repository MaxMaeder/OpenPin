package org.openpin.appframework.devicestate.wifi

import android.content.Context
import android.net.wifi.SupplicantState
import android.net.wifi.WifiManager

class WifiManager(private val context: Context) {

    val status: WifiStatus
        get() {
            val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
            if (wifiManager != null && wifiManager.isWifiEnabled) {
                val wifiInfo = wifiManager.connectionInfo

                // Check if the supplicant state indicates a complete connection
                val isConnected = wifiInfo != null && wifiInfo.supplicantState == SupplicantState.COMPLETED
                val ssid = if (isConnected) wifiInfo.ssid else null

                // Calculate the signal strength percentage if connected; otherwise, return 0
                val signalStrength = if (isConnected) calculateSignalPercentage(wifiInfo.rssi) else 0

                return WifiStatus(
                    isConnected = isConnected,
                    ssid = ssid,
                    signalStrength = signalStrength
                )
            }

            // Return a default status if WiFi is disabled or the WifiManager is unavailable
            return WifiStatus(
                isConnected = false,
                ssid = null,
                signalStrength = 0
            )
        }


    // Helper function to convert RSSI value to a percentage.
    // Assumes RSSI ranges between -100 dBm (poor signal) and -55 dBm (excellent signal).
    private fun calculateSignalPercentage(rssi: Int): Int {
        val minRssi = -100
        val maxRssi = -55
        // Ensure the RSSI value is within the expected range.
        val boundedRssi = rssi.coerceIn(minRssi, maxRssi)
        return ((boundedRssi - minRssi) * 100 / (maxRssi - minRssi))
    }
}
