package org.openpin.primaryapp

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.openpin.primaryapp.backend.BackendManager
import org.openpin.primaryapp.backend.HomeData

class HomeViewModel(
    private val backendManager: BackendManager
) : ViewModel() {

    companion object {
        private const val MIN_UPDATE_INTERVAL_MILLIS = 5 * 60 * 1000L // 5 minutes
    }

    private val _homeData = MutableStateFlow(HomeData(time = 0L))
    val homeData: StateFlow<HomeData> = _homeData.asStateFlow()

    private val _isPaired = MutableStateFlow(false)
    val isPaired: StateFlow<Boolean> = _isPaired.asStateFlow()

    private var lastFetchSystemTime: Long = 0L
    private var isFetching = false;

    private var homeDataTimeReference: Long = 0L // the wall clock time from backend
    private var deviceElapsedTimeAtFetch: Long = 0L // the local device clock at fetch

    fun fetchHomeData() {
        viewModelScope.launch {
            val paired = backendManager.isPaired()
            _isPaired.value = paired

            if (!paired) return@launch

            val now = System.currentTimeMillis()
            if (isFetching || now - lastFetchSystemTime < MIN_UPDATE_INTERVAL_MILLIS) return@launch
            isFetching = true

            try {
                val dataFromBackend = backendManager.sendHomeDataRequest()
                lastFetchSystemTime = now
                homeDataTimeReference = dataFromBackend.time
                deviceElapsedTimeAtFetch = now

                _homeData.value = dataFromBackend
            } catch (e: Exception) {
                Log.e("HomeViewModel", "Failed to fetch home data: ${e.message}")
            } finally {
                isFetching = false
            }
        }
    }

    fun getAdjustedTime(): Long {
        val now = System.currentTimeMillis()
        val elapsed = now - deviceElapsedTimeAtFetch
        return homeDataTimeReference + elapsed
    }
}

