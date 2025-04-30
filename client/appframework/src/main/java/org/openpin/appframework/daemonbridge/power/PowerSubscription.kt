package org.openpin.appframework.daemonbridge.power

data class PowerSubscription(
    val callback: (PowerEvent) -> Unit
)