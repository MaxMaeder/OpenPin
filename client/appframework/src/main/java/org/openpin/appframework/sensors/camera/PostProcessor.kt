package org.openpin.appframework.sensors.camera

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

object PostProcessor {
    /**
     * Resizes a JPEG image file.
     *
     * @param inputFile The source JPEG file.
     * @param outputFile The destination file (can be the same as inputFile).
     * @param newWidth The desired width.
     * @param newHeight The desired height.
     * @param quality JPEG quality (0-100).
     * @throws IOException if an error occurs during processing.
     */
    fun resizeJpegFile(
        inputFile: File,
        outputFile: File,
        newWidth: Int,
        newHeight: Int,
        quality: Int = 90
    ) {
        // Decode the image from file
        val originalBitmap = BitmapFactory.decodeFile(inputFile.absolutePath)
            ?: throw IllegalArgumentException("Unable to decode image from file: ${inputFile.absolutePath}")

        // Resize the bitmap
        val resizedBitmap = Bitmap.createScaledBitmap(originalBitmap, newWidth, newHeight, true)

        // Save the processed bitmap to file
        FileOutputStream(outputFile).use { out ->
            val compressed = resizedBitmap.compress(Bitmap.CompressFormat.JPEG, quality, out)
            if (!compressed) {
                throw IOException("Failed to compress image")
            }
        }

        // Clean up bitmaps
        originalBitmap.recycle()
        resizedBitmap.recycle()
    }
}
