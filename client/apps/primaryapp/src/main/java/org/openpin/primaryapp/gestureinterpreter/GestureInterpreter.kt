package org.openpin.primaryapp.gestureinterpreter

import kotlinx.coroutines.*
import org.openpin.appframework.daemonbridge.gesture.GestureHandler
import org.openpin.appframework.daemonbridge.gesture.GestureSubscription
import org.openpin.appframework.daemonbridge.gesture.GestureType

class GestureInterpreter(
    private val gestureHandler: GestureHandler,
    private val config: InterpreterConfig = InterpreterConfig(),
    // One-shot actions:
    private val onCapturePhoto: () -> Unit,
    private val onCaptureVideoStart: () -> Unit,
    // Transactional actions:
    private val onTranslateStartAction: () -> Unit,
    private val onTranslateStopAction: () -> Unit,
    private val onAssistantStartAction: (withVision: Boolean) -> Unit,
    private val onAssistantStopAction: (withVision: Boolean) -> Unit,
    // Cancel action for CANCELABLE mode.
    private val onCancelAction: () -> Unit,
    // CoroutineScope (typically your ViewModel scope) to launch timeout jobs.
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
) {
    private var mode: InterpreterMode = InterpreterMode.NORMAL

    // Keep track of subscriptions for later unsubscription.
    private val subscriptions = mutableListOf<GestureSubscription>()

    // Gesture context for double-tap detection.
    private var lastTapTime: Long? = null
    // Whether any event in the current gesture was detected as two-finger.
    private var currentGestureTwoFinger: Boolean = false

    // The active transactional action (only one active at a time).
    private var activeAction: GestureAction? = null
    // Timeout job for transactional actions in case a touch‑up is missed.
    private var actionTimeoutJob: Job? = null

    fun subscribeGestures() {
        // Subscribe to both 1‑finger and 2‑finger events.
        subscriptions.add(gestureHandler.subscribeGesture(1, GestureType.TAP) { onTap(1) })
        subscriptions.add(gestureHandler.subscribeGesture(2, GestureType.TAP) { onTap(2) })
        subscriptions.add(gestureHandler.subscribeGesture(1, GestureType.LONG_PRESS_DOWN) { onLongPressDown(1) })
        subscriptions.add(gestureHandler.subscribeGesture(2, GestureType.LONG_PRESS_DOWN) { onLongPressDown(2) })
        subscriptions.add(gestureHandler.subscribeGesture(1, GestureType.LONG_PRESS_UP) { onLongPressUp(1) })
        subscriptions.add(gestureHandler.subscribeGesture(2, GestureType.LONG_PRESS_UP) { onLongPressUp(2) })
    }

    /**
     * Helper to execute start‑gesture actions.
     *
     * If the interpreter is in CANCELABLE mode and ignoreCancel is false,
     * it fires the cancel callback immediately.
     * If in DISABLED mode, the event is ignored.
     *
     * When ignoreCancel is true, the gesture event is passed through even in CANCELABLE mode.
     */
    private inline fun handleStartGesture(ignoreCancel: Boolean = false, action: () -> Unit) {
        if (mode == InterpreterMode.DISABLED) return
        if (mode == InterpreterMode.CANCELABLE && !ignoreCancel) {
            onCancelAction()
            return
        }
        action()
    }

    /**
     * Called for tap events.
     *
     * For a double tap, if any tap in the gesture was two‑finger:
     * - In normal mode, the photo action is triggered.
     * - In CANCELABLE mode, the cancel action is fired.
     *
     * We use handleStartGesture(ignoreCancel = true) here so that tap
     * events are processed by our double‑tap logic even in cancel mode.
     */
    private fun onTap(fingers: Int) {
        handleStartGesture(ignoreCancel = true) {
            if (fingers == 2) {
                currentGestureTwoFinger = true
            }
            val now = System.currentTimeMillis()
            if (lastTapTime != null && now - lastTapTime!! <= config.doubleTapMaxInterval) {
                if (mode == InterpreterMode.CANCELABLE) {
                    // Double tap detected in cancel mode fires cancel.
                    onCancelAction()
                } else {
                    // In normal mode, a double tap with any two‑finger tap fires a photo capture.
                    if (currentGestureTwoFinger) {
                        onCapturePhoto()
                    }
                }
                lastTapTime = null
                currentGestureTwoFinger = false
            } else {
                lastTapTime = now
            }
        }
    }

    /**
     * Called for long press down events.
     *
     * Determines the action type based on whether a preceding tap was detected (tap+hold) and
     * whether any event was two-finger.
     *
     * • If a tap+hold is detected and any event was two-finger, fire the video action (one-shot).
     * • If a tap+hold is detected with one finger only, start assistant input with vision.
     * • If no preceding tap is detected, a two-finger long press triggers translate;
     *   otherwise, a one-finger long press triggers assistant input.
     */
    private fun onLongPressDown(fingers: Int) {
        handleStartGesture {
            if (fingers == 2) {
                currentGestureTwoFinger = true
            }
            val now = System.currentTimeMillis()
            val isTapPlusHold = (lastTapTime != null && now - lastTapTime!! <= config.tapHoldDelay)
            if (isTapPlusHold) {
                // Tap+hold gesture.
                if (currentGestureTwoFinger) {
                    // Two-finger tap+hold → Video action (one-shot).
                    onCaptureVideoStart()
                    activeAction = null
                } else {
                    // One-finger tap+hold → Assistant with vision.
                    activeAction = GestureAction.ASSISTANT_VISION
                    onAssistantStartAction(true)
                    startActionTimeoutJob()
                }
            } else {
                // Long press without a preceding tap.
                if (currentGestureTwoFinger) {
                    // Two-finger long press → Translate.
                    activeAction = GestureAction.TRANSLATE
                    onTranslateStartAction()
                    startActionTimeoutJob()
                } else {
                    // One-finger long press → Assistant.
                    activeAction = GestureAction.ASSISTANT
                    onAssistantStartAction(false)
                    startActionTimeoutJob()
                }
            }
            lastTapTime = null
            currentGestureTwoFinger = false
        }
    }

    /**
     * Called for long press up events.
     *
     * For transactional actions (translate or assistant), the corresponding stop callback is fired.
     * One-shot actions (PHOTO, VIDEO) fire on start and are not tracked.
     */
    private fun onLongPressUp(fingers: Int) {
        actionTimeoutJob?.cancel()
        activeAction?.let { action ->
            when (action) {
                GestureAction.TRANSLATE -> onTranslateStopAction()
                GestureAction.ASSISTANT -> onAssistantStopAction(false)
                GestureAction.ASSISTANT_VISION -> onAssistantStopAction(true)
                else -> { /* No stop action for one-shot actions. */ }
            }
        }
        activeAction = null
    }

    private fun startActionTimeoutJob() {
        actionTimeoutJob?.cancel()
        actionTimeoutJob = scope.launch {
            delay(config.releaseTimeout)
            activeAction?.let { action ->
                when (action) {
                    GestureAction.TRANSLATE -> onTranslateStopAction()
                    GestureAction.ASSISTANT -> onAssistantStopAction(false)
                    GestureAction.ASSISTANT_VISION -> onAssistantStopAction(true)
                    else -> { }
                }
                activeAction = null
            }
        }
    }

    /**
     * Unsubscribe from all gesture subscriptions and cancel any pending timeouts.
     */
    fun clear() {
        scope.cancel()
        subscriptions.forEach { gestureHandler.unsubscribe(it) }
        subscriptions.clear()
    }

    /**
     * Dynamically change the interpreter mode.
     */
    fun setMode(newMode: InterpreterMode) {
        mode = newMode
    }
}
