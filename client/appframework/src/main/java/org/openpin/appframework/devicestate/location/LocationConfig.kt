package org.openpin.appframework.devicestate.location

import kotlin.time.Duration

data class LocationConfig(
    val scanInterval: Duration? = null,
    val mapsApiKey: String? = null
)
