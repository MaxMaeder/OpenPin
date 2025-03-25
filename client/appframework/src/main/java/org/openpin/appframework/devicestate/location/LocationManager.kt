package org.openpin.appframework.devicestate.location

import android.util.Log
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.openpin.appframework.daemonbridge.process.ProcessHandler
import org.openpin.appframework.daemonbridge.process.RequestProcess
import java.io.Closeable

class LocationManager(
    private val processHandler: ProcessHandler,
    private val config: LocationConfig = LocationConfig(),
    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
) : Closeable {
    private val TAG = "LocationManager"

    private var scanJob: Job? = null

    var latestScanResults: List<WiFiScanEntry> = emptyList()
    var latestLocation: ResolvedLocation? = null

    fun start() {
        val interval = config.scanInterval ?: return

        if (scanJob != null) return // already running

        scanJob = scope.launch {
            while (isActive) {
                runScan()
                delay(interval)
            }
        }
    }

    fun stop() {
        scanJob?.cancel()
        scanJob = null
    }

    suspend fun runScan() {
        val scanProcess = WiFiScanProcess()
        try {
            processHandler.execute(scanProcess)

            val results = scanProcess.parseScanResults()
            latestScanResults = results

            if (config.mapsApiKey != null) {
                resolveLocation(results)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Scan or location resolution failed: ${e.message}")
        }
    }

    private suspend fun resolveLocation(entries: List<WiFiScanEntry>) {
        if (entries.isEmpty()) return

        val payload = buildLocationPayload(entries)
        val request = RequestProcess(
            url = "https://www.googleapis.com/geolocation/v1/geolocate",
            method = "POST",
            headers = mapOf("Content-Type" to "application/json"),
            payload = RequestProcess.Payload.FromString(payload),
            payloadType = RequestProcess.PayloadType.RAW,
            queryParams = mapOf("key" to config.mapsApiKey!!)
        )

        try {
            processHandler.execute(request)

            if (request.error.isNotEmpty()) {
                throw RuntimeException("Geolocation API returned error: ${request.error}")
            }

            latestLocation = Gson().fromJson(request.output, ResolvedLocation::class.java)
            Log.i(TAG, "Location resolved: $latestLocation")

        } catch (e: Exception) {
            Log.e(TAG, "Geolocation API request failed: ${e.message}")
        } finally {
            processHandler.release(request)
        }
    }

    private fun buildLocationPayload(entries: List<WiFiScanEntry>): String {
        val wifiAccessPoints = entries.map {
            mapOf(
                "macAddress" to it.bssid,
                "signalStrength" to it.rssi,
                "channel" to convertFreqToChannel(it.frequency)
            )
        }

        return Gson().toJson(mapOf("wifiAccessPoints" to wifiAccessPoints))
    }

    private fun convertFreqToChannel(freq: Int): Int {
        return when (freq) {
            in 2412..2484 -> (freq - 2407) / 5
            in 5170..5825 -> (freq - 5000) / 5
            else -> -1
        }
    }

    override fun close() {
        stop()
        scope.cancel()
    }
}