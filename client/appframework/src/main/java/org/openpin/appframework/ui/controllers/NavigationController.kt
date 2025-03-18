package org.openpin.appframework.ui.controllers

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.ui.Modifier

class NavigationController {
    private val _stack = mutableStateListOf<@Composable () -> Unit>()

    val currentView: @Composable () -> Unit
        get() = _stack.lastOrNull() ?: { Box(modifier = Modifier.fillMaxSize()) {} }

    fun push(view: @Composable () -> Unit) {
        _stack.add(view)
    }

    fun pop() {
        if (_stack.size > 1) _stack.removeAt(_stack.lastIndex)
    }

    fun init(view: @Composable () -> Unit) {
        _stack.clear()
        _stack.add(view)
    }
}