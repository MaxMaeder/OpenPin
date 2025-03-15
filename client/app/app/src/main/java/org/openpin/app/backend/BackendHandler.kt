package org.openpin.app.backend

import android.util.Log
import org.json.JSONObject
import org.openpin.app.daemonbridge.ProcessRunner
import org.openpin.app.util.DeviceIdentity
import java.io.File

class BackendHandler(private val processRunner: ProcessRunner) {

    /**
     * Composes and sends a request with the specified audio and optional image file to the API endpoint.
     * Returns the processed MP3 File from the response (after skipping the 512-byte header), or null if an error occurs.
     */
    suspend fun sendRequest(audioFile: File, imageFile: File?): File? {
        // Build JSON header payload.
        val headerJson = JSONObject().apply {
            put("audioSize", audioFile.length())
            put("audioFormat", "m4a")
            put("imageSize", imageFile?.length() ?: 0)
            put("deviceId", DeviceIdentity.identifier)
            put("audioBitrate", "64k")
        }
        // Convert JSON to string, append a null terminator.
        val headerString = headerJson.toString() + "\u0000"
        val headerBytes = headerString.toByteArray(Charsets.UTF_8)
        // Create a 512-byte array and copy headerBytes into it (padding with zeros).
        val paddedHeader = ByteArray(512)
        val copyLength = headerBytes.size.coerceAtMost(512)
        System.arraycopy(headerBytes, 0, paddedHeader, 0, copyLength)

        // Create the request file and write the header, image data (if any), and audio data.
        val requestFile = processRunner.createAuxFile("request.dat")
        requestFile.outputStream().use { os ->
            os.write(paddedHeader)
            imageFile?.inputStream()?.use { imageStream ->
                imageStream.copyTo(os)
            }
            audioFile.inputStream().use { audioStream ->
                audioStream.copyTo(os)
            }
        }

        // Create a file to store the raw response.
        val responseFile = processRunner.createAuxFile("response.raw")

        // Build and execute the curl command (no extra HTTP headers).
        val shellProcess = processRunner.generateProcess { ShellProcess() }
        val command = """curl -X POST "https://openpin.center/api/dev/handle" --data-binary @${requestFile.absolutePath} -o ${responseFile.absolutePath}"""
        shellProcess.command = command

        val resultProcess = shellProcess.execute()
        if (resultProcess.error.isNotBlank()) {
            Log.e("BackendHandler", "Error sending request: ${resultProcess.error}")
            resultProcess.release()
            return null
        }
        resultProcess.release()

        // Process the response file: discard the first 512 bytes (header) and write the remaining bytes to a new MP3 file.
        val mp3ResponseFile = processRunner.createAuxFile("response.mp3")
        responseFile.inputStream().use { input ->
            mp3ResponseFile.outputStream().use { output ->
                input.skip(512)
                input.copyTo(output)
            }
        }
        return mp3ResponseFile
    }
}
