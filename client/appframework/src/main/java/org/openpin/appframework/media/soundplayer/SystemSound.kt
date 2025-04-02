package org.openpin.appframework.media.soundplayer

import org.openpin.appframework.R

enum class SystemSound(val key: String, val resId: Int) {
    LASER_FOCUS_BUTTON("laser_focus_button", R.raw.laser_focus_button),
    LASER_TAP("laser_tap", R.raw.laser_tap),
    LOADING1("loading1", R.raw.loading1),
    LOADING2("loading2", R.raw.loading2),
    LOADING3("loading3", R.raw.loading3),
    LOADING4("loading4", R.raw.loading4),
    LOADING5("loading5", R.raw.loading5),
    RECORD_END("record_end", R.raw.record_end),
    RECORD_START("record_start", R.raw.record_start),
    SHUTTER("shutter", R.raw.shutter),
    VOLUME_CHANGE("volume_change", R.raw.volume_change);

    companion object {
        val asMap: Map<String, Int> = entries.associate { it.key to it.resId }
    }
}
