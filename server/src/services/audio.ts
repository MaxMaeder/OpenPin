import { PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";
import streamifier from "streamifier";

export const changeVolume = (
  inputBuffer: Buffer,
  volume: number
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const inputStream = streamifier.createReadStream(inputBuffer);
    const outputStream = new PassThrough();
    const chunks: Buffer[] = [];

    ffmpeg(inputStream)
      .inputFormat("ogg")
      .audioFilters(`volume=${volume}`)
      .format("ogg")
      .on("error", reject)
      .on("end", () => {
        resolve(Buffer.concat(chunks));
      })
      .pipe(outputStream, { end: true });

    outputStream.on("data", (chunk) => chunks.push(chunk));
    outputStream.on("error", reject);
  });
};
