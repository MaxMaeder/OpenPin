package org.openpin.appframework.ui.config

import org.openpin.appframework.R

data class AudioFeedbackConfig (
    val onFocusSound: Int? = R.raw.laser_focus_button,
    val onClickSound: Int? = R.raw.laser_tap
)