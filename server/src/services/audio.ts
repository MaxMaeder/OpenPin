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

export const getPeakVolume = (inputBuffer: Buffer): Promise<number> => {
  return new Promise((resolve, reject) => {
    const inputStream = streamifier.createReadStream(inputBuffer);

    let stderr = "";

    ffmpeg(inputStream)
      .inputFormat("ogg")
      .audioFilters("volumedetect")
      .format("null")
      .outputOptions("-f", "null")
      .on("stderr", (line: string) => {
        stderr += line + "\n";
      })
      .on("end", () => {
        const match = stderr.match(/max_volume: ([\-\d\.]+) dB/);
        if (match) {
          resolve(parseFloat(match[1]));
        } else {
          reject(new Error("Failed to parse max volume from ffmpeg output."));
        }
      })
      .on("error", reject)
      .saveToFile("/dev/null");
  });
};
