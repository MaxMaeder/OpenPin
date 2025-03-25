package org.openpin.primaryapp.backend

import org.openpin.primaryapp.BuildConfig

data class BackendConfig (
    val baseUrl: String = BuildConfig.BACKEND_BASE_URL
)