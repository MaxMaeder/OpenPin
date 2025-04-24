package org.openpin.appframework.daemonbridge.streaming

import android.util.Log
import java.io.File
import java.io.IOException
import java.io.InputStream

// FileChunkChannel.kt  (pure Kotlin, no Android classes)
//class FileChunkChannel(
//    private val dir: File,
//    private val prefix: String = "",
//    private val ext: String = ".raw",
//    private val chunkSize: Long = 1L shl 20  // mirror native side
//) {
//    private fun chunkFile(idx: Long) = File(dir, "%s%06d%s".format(prefix, idx, ext))
//
//    /** Blocking read sequence that yields InputStreams for each finished chunk. */
//    fun readerSequence(startIdx: Long = 0): Sequence<InputStream> = sequence {
//        var idx = startIdx
//        while (true) {
//            val target = chunkFile(idx)
//            // Wait until the file *exists* and is *closed* (size stops growing)
//            while (!target.exists() || target.length() < chunkSize && target.length() % 1024 != 0L) {
//                Thread.sleep(50)
//            }
//            yield(target.inputStream().buffered())
//            // After consumer is done reading we can safely delete file idx‑2
//            val toDelete = chunkFile(idx - 2)
//            if (toDelete.exists()) toDelete.delete()
//            idx++
//        }
//    }
//
//    /** Non‑blocking write – append a block to the *current* writable chunk. */
//    @Synchronized fun append(data: ByteArray) {
//        var idx = 0L
//        while (chunkFile(idx + 1).exists()) idx++
//        val current = chunkFile(idx)
//        val out = current.outputStream().buffered()
//        out.write(data)
//        out.flush()
//        out.close()
//    }
//}
class FileChunkChannel(
    private val dir: File,
    private val pacing: File = File(dir, "pacing.txt")
) {
    private fun chunkFile(idx: Long) = File(dir, "%06d.raw".format(idx))

    /**
     * Yields each chunk only after the writer has moved on to the next one.
     * That guarantees the file is fully closed and no more bytes will be appended.
     */
    fun readerSequence(startIdx: Long = 0L): Sequence<InputStream> = sequence {
        var idx = startIdx
        while (true) {
            val file = chunkFile(idx)
            val next = chunkFile(idx + 1)
            Log.e("READING", file.absolutePath)

            // 1) wait for chunk N to appear
            while (!file.exists()) Thread.sleep(20)

            // 2) wait for chunk N+1 to appear (even as an empty file)
            while (!next.exists()) Thread.sleep(20)
            Log.e("READ", "START READ")

            // 3) signal “I’ve reached N”
            pacing.writeText("$idx\n")

            // 4) hand over the sealed chunk
            yield(file.inputStream().buffered())

            idx++
        }
    }
}
