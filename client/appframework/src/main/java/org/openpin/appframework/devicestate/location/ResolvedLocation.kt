package org.openpin.appframework.devicestate.location

import com.google.gson.annotations.SerializedName

data class ResolvedLocation(
    val location: LatLng,
    @SerializedName("accuracy") val accuracyMeters: Float
)
