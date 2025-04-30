package org.openpin.appframework.devicestate.location

import android.util.Log
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.openpin.appframework.daemonbridge.power.PowerHandler
import org.openpin.appframework.daemonbridge.power.PowerSubscription
import org.openpin.appframework.daemonbridge.process.ProcessHandler
import org.openpin.appframework.daemonbridge.process.RequestProcess
import java.io.Closeable
import kotlin.time.Duration

class LocationManager(
    private val processHandler: ProcessHandler,
    private val powerHandler: PowerHandler,
    private val config: LocationConfig,
    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
) : Closeable {
    private val TAG = "LocationManager"

    private var scanJob: Job? = null
    private var powerSub: PowerSubscription? = null
    private var nextInterval: Duration? = null

    var latestScanResults: List<WiFiScanEntry> = emptyList()
    var latestLocation: ResolvedLocation? = null

    fun start() {
        // Skip if already running
        if (scanJob != null) return

        // Subscribe to power events
        powerSub = powerHandler.subscribePowerEvents { event ->
            // If sleeping == false, device has just woken
            // Let's reschedule subsequent scans
            if (!event.sleeping) scope.launch { resetScheduleAndRunNow() }
        }


        // Kick-off immediately, then schedule subsequent scans
        scope.launch { resetScheduleAndRunNow() }
    }

    fun stop() {
        scanJob?.cancel()
        scanJob = null

        powerSub?.let { powerHandler.unsubscribe(it) }
        powerSub = null
    }

    /**
     * Cancels running location update schedule (if any),
     * runs a scan immediately,
     * schedules subsequent scans with the (possibly) exponential back-off
     */
    private suspend fun resetScheduleAndRunNow() {
        scanJob?.cancelAndJoin()

        runScan()

        // Reset interval
        // If null, don't schedule location updates
        nextInterval = config.scanInterval ?: return

        scanJob = scope.launch {
            while (isActive) {
                delay(nextInterval!!)
                runScan()

                if (config.exponentialInterval) {
                    // If exponential interval configured, double the time until the next scan
                    nextInterval = nextInterval!! * 2
                }
            }
        }
    }

    /**
     * Run a scan
     */
    suspend fun runScan() {
        Log.e(TAG, "SCANNING!")
        val scan = WiFiScanProcess()
        try {
            processHandler.execute(scan)

            val results = scan.parseScanResults()
            latestScanResults = results

            if (config.locationResolver != null) {
                latestLocation = config.locationResolver.invoke(results)
            } else if (config.mapsApiKey != null) {
                latestLocation = resolveLocationMaps(results)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Scan or location resolution failed: ${e.message}")
        } finally {
            processHandler.release(scan)
        }
    }

    private suspend fun resolveLocationMaps(entries: List<WiFiScanEntry>): ResolvedLocation? {
        if (entries.isEmpty()) return null

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

            val location = Gson().fromJson(request.output, ResolvedLocation::class.java)
            Log.i(TAG, "Location resolved: $location")

            return location
        } catch (e: Exception) {
            Log.e(TAG, "Geolocation API request failed: ${e.message}")
            return null
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