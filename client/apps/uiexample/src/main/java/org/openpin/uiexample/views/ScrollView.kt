package org.openpin.uiexample.views

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.openpin.appframework.ui.components.ScrollContainer
import org.openpin.appframework.ui.components.TextButton

@Composable
fun ScrollView() {
    ScrollContainer(modifier = Modifier.fillMaxSize()) {
        for (i in 1..12) {
            TextButton(
                text = "Item $i",
                onClick = { /* handle click */ },
                modifier = Modifier
                    .padding(vertical = 8.dp)
                    .fillMaxWidth()
            )
        }
    }
}