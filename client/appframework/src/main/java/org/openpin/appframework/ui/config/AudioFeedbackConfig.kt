package org.openpin.appframework.ui.config

import org.openpin.appframework.R
import org.openpin.appframework.media.soundplayer.SystemSound

data class AudioFeedbackConfig (
    val onFocusSound: String? = SystemSound.LASER_FOCUS_BUTTON.key,
    val onClickSound: String? = SystemSound.LASER_TAP.key
)