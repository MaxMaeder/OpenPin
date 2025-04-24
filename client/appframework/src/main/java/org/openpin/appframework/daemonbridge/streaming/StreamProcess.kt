package org.openpin.appframework.daemonbridge.streaming

import org.openpin.appframework.daemonbridge.process.ShellProcess

class StreamProcess(
    url: String,
    outDir: String
) : ShellProcess(
    buildCommand(url, outDir)
) {
    //val pid: Int by lazy { output.trim().toInt() }

    companion object {
        private fun buildCommand(url: String, outDir: String): String {
            val uri  = java.net.URI(url)
            val host = uri.host
            val port = if (uri.port != -1) uri.port else if (uri.scheme == "https") 443 else 80
            // rawPath already contains “/foo” and any “?id=2” etc, and never has spaces
            val path = uri.rawPath + uri.rawQuery?.let { "?$it" }.orEmpty()

            // no quoting, no backslashes, one line
            return "nohup /data/local/tmp/ogg_stream $host $port $path $outDir" +
                    " > $outDir/stream.log 2>&1 &"
        }
    }
}
