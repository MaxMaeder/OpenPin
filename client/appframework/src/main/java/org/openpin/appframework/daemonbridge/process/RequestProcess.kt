package org.openpin.appframework.daemonbridge.process

import com.google.gson.Gson
import com.google.gson.JsonSyntaxException
import java.io.File

class RequestProcess(
    url: String,
    method: String = "GET",
    headers: Map<String, String> = emptyMap(),
    payload: Payload? = null,
    payloadType: PayloadType = PayloadType.NONE,
    queryParams: Map<String, String> = emptyMap(),
    outputFile: String? = null
) : ShellProcess(
    buildCurlCommand(url, method, headers, payload, payloadType, queryParams, outputFile)
) {
    sealed class Payload {
        abstract fun toCurlArg(): String

        data class FromString(val content: String) : Payload() {
            override fun toCurlArg(): String {
                // Escape double quotes and wrap the whole thing in single quotes
                return "'${content.replace("'", "'\"'\"'")}'"
            }
        }

        data class FromFile(val file: File) : Payload() {
            override fun toCurlArg(): String {
                return "@${file.absolutePath}"
            }
        }

        data class RawCurlArg(val raw: String) : Payload() {
            override fun toCurlArg(): String {
                return raw
            }
        }
    }

    enum class PayloadType {
        NONE,
        FORM,       // --data
        RAW,        // --data-raw
        BINARY,     // --data-binary
        MULTIPART   // --form
    }

    companion object {

        private fun buildCurlCommand(
            url: String,
            method: String,
            headers: Map<String, String>,
            payload: Payload?,
            payloadType: PayloadType,
            queryParams: Map<String, String>,
            outputFile: String?
        ): String {
            val cmd = mutableListOf("curl -sSf")

            // Method
            cmd.add("-X")
            cmd.add(method.uppercase())

            // Headers
            headers.forEach { (key, value) ->
                cmd.add("-H")
                cmd.add("\"$key: $value\"")
            }

            // Payload (optional)
            if (payload != null) {
                val flag = when (payloadType) {
                    PayloadType.FORM     -> "--data"
                    PayloadType.RAW      -> "--data-raw"
                    PayloadType.BINARY   -> "--data-binary"
                    PayloadType.MULTIPART-> "--form"
                    else                 -> null
                }

                if (flag != null) {
                    cmd.add(flag)
                    cmd.add(payload.toCurlArg())
                }
            }

            // Query parameters
            val fullUrl = if (queryParams.isNotEmpty()) {
                val query = queryParams.map { (k, v) ->
                    "${encode(k)}=${encode(v)}"
                }.joinToString("&")
                "$url?$query"
            } else {
                url
            }
            cmd.add("\"$fullUrl\"")

            // Output file (optional)
            if (!outputFile.isNullOrEmpty()) {
                cmd.add("-o")
                cmd.add(outputFile)
            }

            return cmd.joinToString(" ")
        }

        private fun encode(value: String): String {
            return java.net.URLEncoder.encode(value, "UTF-8")
        }
    }

    inline fun <reified T> parseOutput(): T? {
        return try {
            Gson().fromJson(output, T::class.java)
        } catch (e: JsonSyntaxException) {
            null
        }
    }
}
