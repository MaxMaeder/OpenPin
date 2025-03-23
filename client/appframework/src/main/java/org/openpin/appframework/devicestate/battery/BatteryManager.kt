package org.openpin.appframework.devicestate.battery

import android.content.Context
import android.content.Intent
import android.content.IntentFilter

class BatteryManager(private val context: Context) {

    val status: BatteryStatus
        get() {
            val intentFilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
            val batteryStatusIntent = context.registerReceiver(null, intentFilter)

            batteryStatusIntent?.let {
                val level = it.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1)
                val scale = it.getIntExtra(android.os.BatteryManager.EXTRA_SCALE, -1)
                val percentage = (level.toFloat() / scale.toFloat())

                val status = it.getIntExtra(android.os.BatteryManager.EXTRA_STATUS, -1)
                val isCharging = status == android.os.BatteryManager.BATTERY_STATUS_CHARGING ||
                        status == android.os.BatteryManager.BATTERY_STATUS_FULL

                return BatteryStatus(percentage, isCharging)
            }

            return BatteryStatus(percentage = 0.0f, isCharging = false)
        }
}
