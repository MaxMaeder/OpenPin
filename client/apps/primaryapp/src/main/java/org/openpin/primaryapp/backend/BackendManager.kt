package org.openpin.primaryapp.backend

import android.util.Log
import com.google.gson.Gson
import org.openpin.appframework.daemonbridge.process.ProcessHandler
import org.openpin.appframework.daemonbridge.process.RequestProcess
import org.openpin.appframework.devicestate.battery.BatteryManager
import org.openpin.appframework.devicestate.identity.IdentityManager
import org.openpin.appframework.devicestate.location.LocationManager
import org.openpin.primaryapp.configuration.ConfigKey
import org.openpin.primaryapp.configuration.ConfigurationManager
import java.io.File

data class RequestMetadata(
    val audioSize: Long,
    val audioFormat: String,
    val imageSize: Long,
    val deviceId: String,
    val audioBitrate: String,
    val battery: Float,
    val latitude: Double? = null,
    val longitude: Double? = null
)

data class ResponseMetadata(
    val nextUpdate: Long,
    val disabled: Boolean,
    val doUpdate: Boolean,
    val takePic: Boolean,
    val wifi: Boolean,
    val bt: Boolean,
    val gnss: Boolean,
    val spkVol: Float,
    val lLevel: Float
)

data class PairDetails(
    val baseUrl: String,
    val deviceId: String
)

class BackendManager(
    private val processHandler: ProcessHandler,
    private val locationManager: LocationManager,
    private val batteryManager: BatteryManager,
    private val configurationManager: ConfigurationManager,
) {
    suspend fun pairDevice(pairUrl: String) {
        val pairDetails = sendPairRequest(pairUrl)

        pairDetails?.let {
            configurationManager.set(ConfigKey.BACKEND_BASE_URL, it.baseUrl)
            configurationManager.set(ConfigKey.DEVICE_ID, it.deviceId)
        }
    }

    suspend fun sendPairRequest(pairUrl: String): PairDetails? {
        val req = RequestProcess(
            url = pairUrl,
            method = "POST",
            payloadType = RequestProcess.PayloadType.NONE
        )

        val reqProcess = processHandler.execute(req)

        if (reqProcess.error.isNotBlank()) {
            Log.e("BackendHandler", "Error sending request: ${reqProcess.error} ${reqProcess.output}")
        }

        val pairDetails = try {
            Gson().fromJson(reqProcess.output, PairDetails::class.java)
        } catch (e: Exception) {
            Log.e("BackendHandler", "Failed to parse pair details", e)
            null
        }

        return pairDetails
    }

    suspend fun sendUploadRequest(captureFile: File) {
        val baseUrl = configurationManager.getString(ConfigKey.BACKEND_BASE_URL)!!
        val deviceId = configurationManager.getString(ConfigKey.DEVICE_ID)!!

        val payload = RequestProcess.Payload.Multipart(
            mapOf(
                "deviceId" to deviceId,
                "file" to captureFile
            )
        )

        val req = RequestProcess(
            url = "${baseUrl}/api/dev/upload-capture",
            method = "POST",
            payload = payload,
            payloadType = RequestProcess.PayloadType.MULTIPART
        )
        val reqProcess = processHandler.execute(req)

        if (reqProcess.error.isNotBlank()) {
            Log.e("BackendHandler", "Error sending request: ${reqProcess.error} ${reqProcess.output}")
        }

        processHandler.release(req)
    }

    suspend fun sendVoiceRequest(endpoint: String, audioFile: File, imageFile: File?): ByteArray? {
        val baseUrl = configurationManager.getString(ConfigKey.BACKEND_BASE_URL)!!
        val deviceId = configurationManager.getString(ConfigKey.DEVICE_ID)!!

        val requestMetadata = RequestMetadata(
            audioSize = audioFile.length(),
            audioFormat = "ogg",
            imageSize = imageFile?.length() ?: 0,
            deviceId = deviceId,
            audioBitrate = "64k",
            battery = batteryManager.status.percentage,
            latitude = locationManager.latestLocation?.location?.lat,
            longitude = locationManager.latestLocation?.location?.lng
        )

        val gson = Gson()
        val headerString = gson.toJson(requestMetadata) + "\u0000"
        val headerBytes = headerString.toByteArray(Charsets.UTF_8)
        val paddedHeader = ByteArray(512)
        val copyLength = headerBytes.size.coerceAtMost(512)
        System.arraycopy(headerBytes, 0, paddedHeader, 0, copyLength)

        val requestFile = processHandler.createTempFile("request.dat")
        requestFile.outputStream().use { os ->
            os.write(paddedHeader)
            imageFile?.inputStream()?.use { it.copyTo(os) }
            audioFile.inputStream().use { it.copyTo(os) }
        }

        val responseFile = processHandler.createTempFile("response.raw")

        val requestProcess = RequestProcess(
            url = "${baseUrl}/api/dev/$endpoint",
            method = "POST",
            payloadType = RequestProcess.PayloadType.BINARY,
            payload = RequestProcess.Payload.FromFile(requestFile),
            outputFile = responseFile
        )

        val resultProcess = processHandler.execute(requestProcess)
        if (resultProcess.error.isNotBlank()) {
            Log.e("BackendHandler", "Error sending request: ${resultProcess.error}")
            requestFile.delete()
            responseFile.delete()
            processHandler.release(requestProcess)
            return null
        }

        // Parse response metadata (first 512 bytes)
        val metadataBuffer = ByteArray(512)
        responseFile.inputStream().use { input ->
            input.read(metadataBuffer)
        }

        val responseMetadataJson = metadataBuffer.toString(Charsets.UTF_8).trimEnd('\u0000', '\u0001', '\n')
        val responseMetadata = try {
            gson.fromJson(responseMetadataJson, ResponseMetadata::class.java)
        } catch (e: Exception) {
            Log.e("BackendHandler", "Failed to parse response metadata: $responseMetadataJson", e)
            null
        }

        Log.i("BackendHandler", "Received response metadata: $responseMetadata")

        // Strip 512-byte header and return the mp3 portion
        val audioBytes = responseFile.inputStream().use { input ->
            input.skip(512)
            input.readBytes()
        }

        // Clean up temporary files:
        requestFile.delete()
        responseFile.delete()
        processHandler.release(requestProcess)

        return audioBytes
    }

}