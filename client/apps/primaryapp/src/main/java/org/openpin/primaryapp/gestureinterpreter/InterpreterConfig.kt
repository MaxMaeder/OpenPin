package org.openpin.primaryapp.gestureinterpreter

data class InterpreterConfig(
    val doubleTapMaxInterval: Long = 1200L, // Milliseconds for double tap (photo).
    val tapHoldDelay: Long = 1500L,         // Max delay between tap and long press to be considered tap+hold.
    val releaseTimeout: Long = 20000L       // Milliseconds before forcing a stop action for transactions.
)
