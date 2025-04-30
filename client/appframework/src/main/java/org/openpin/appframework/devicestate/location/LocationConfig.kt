package org.openpin.appframework.devicestate.location

import kotlin.time.Duration

data class LocationConfig(
    val scanInterval: Duration? = null,
    // Every successive delay between scans is doubled (after a wakeup event)
    val exponentialInterval: Boolean = true,
    val mapsApiKey: String? = null,
    val locationResolver: (suspend (List<WiFiScanEntry>) -> ResolvedLocation?)? = null
)
