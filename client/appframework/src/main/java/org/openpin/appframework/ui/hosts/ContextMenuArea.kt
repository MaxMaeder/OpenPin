package org.openpin.appframework.ui.hosts

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import org.openpin.appframework.ui.locals.LocalContextMenuState

@Composable
fun ContextMenuArea(
    contextMenu: @Composable () -> Unit,
    content: @Composable () -> Unit
) {
    val contextMenuState = LocalContextMenuState.current
    DisposableEffect(Unit) {
        // Register this view's context menu.
        contextMenuState.value = contextMenu
        onDispose { contextMenuState.value = null }
    }
    content()
}
