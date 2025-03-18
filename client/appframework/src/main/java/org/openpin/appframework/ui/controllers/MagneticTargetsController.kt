package org.openpin.appframework.ui.controllers

import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import kotlin.math.sqrt
import kotlin.math.pow

class MagneticTargetsController {
    data class TargetInfo(val rect: Rect, val zIndex: Int)
    val targets = mutableStateMapOf<String, TargetInfo>()

    fun register(id: String, rect: Rect, zIndex: Int = 0) {
        targets[id] = TargetInfo(rect, zIndex)
    }

    fun unregister(id: String) {
        targets.remove(id)
    }

    fun focusedTargetId(pointer: Offset): String? {
        if (targets.isEmpty()) return null
        val tolerance = 0.001f
        val distances = targets.mapValues { (_, info) -> distanceToRect(info.rect, pointer) }
        val minDistance = distances.values.minOrNull() ?: return null
        val equallyClose = distances.filterValues { (it - minDistance) < tolerance }.keys

        return if (equallyClose.size == 1) {
            equallyClose.first()
        } else {
            equallyClose.maxByOrNull { targets[it]?.zIndex ?: 0 }
        }
    }

    private fun distanceToRect(rect: Rect, point: Offset): Float {
        val dx = when {
            point.x < rect.left -> rect.left - point.x
            point.x > rect.right -> point.x - rect.right
            else -> 0f
        }
        val dy = when {
            point.y < rect.top -> rect.top - point.y
            point.y > rect.bottom -> point.y - rect.bottom
            else -> 0f
        }
        return sqrt(dx.pow(2) + dy.pow(2))
    }
}