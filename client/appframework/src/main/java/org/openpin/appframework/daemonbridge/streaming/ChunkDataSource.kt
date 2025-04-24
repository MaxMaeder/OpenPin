package org.openpin.appframework.daemonbridge.streaming

import android.net.Uri
import androidx.media3.common.C
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.BaseDataSource
import androidx.media3.datasource.DataSpec
import java.io.InputStream

@UnstableApi
class ChunkDataSource
    (
    private val channel: FileChunkChannel
) : BaseDataSource(/* listener = */ false) {

    private var current: InputStream? = null
    private val iterator = channel.readerSequence().iterator()
    override fun open(dataSpec: DataSpec): Long = C.LENGTH_UNSET.toLong()

    override fun read(buffer: ByteArray, offset: Int, readLength: Int): Int {
        while (current == null || current!!.available() == 0) {
            if (!iterator.hasNext()) return C.RESULT_END_OF_INPUT
            current = iterator.next()
        }
        return current!!.read(buffer, offset, readLength)
    }

    override fun getUri(): Uri? = null
    override fun close() { current?.close() }
}