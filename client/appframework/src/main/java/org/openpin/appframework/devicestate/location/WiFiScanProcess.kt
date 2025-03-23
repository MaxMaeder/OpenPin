package org.openpin.appframework.devicestate.location

import android.util.Log
import org.openpin.appframework.daemonbridge.process.ShellProcess

class WiFiScanProcess : ShellProcess(
    //command = "(cmd wifi list-scan-results && cmd wifi start-scan)"
    command = "/data/local/tmp/pty_exec \"cmd wifi list-scan-results\""
) {
    fun parseScanResults(): List<WiFiScanEntry> {
        val results = mutableListOf<WiFiScanEntry>()

        val regex = Regex("""\s*([0-9a-f:]{17})\s+(\d+)\s+(-?\d+)\([^)]*\)\s+>?([\d.]+)\s+(.*?)\s{2,}(.*)""")

        output.lineSequence()
            .dropWhile { it.trim().isEmpty() || it.contains("BSSID", ignoreCase = true) } // skip header
            .forEach { line ->
                val match = regex.find(line)
                if (match != null) {
                    val (bssid, freq, rssi, age, ssid, flags) = match.destructured
                    results.add(
                        WiFiScanEntry(
                            bssid = bssid,
                            frequency = freq.toInt(),
                            rssi = rssi.toInt(),
                            ageSec = age.toFloat(),
                            ssid = ssid,
                            flags = flags.trim()
                        )
                    )
                }
            }

        return results
    }
}
