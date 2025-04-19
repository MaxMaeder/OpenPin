import { PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";
import streamifier from "streamifier";

export const changeVolume = (inputBuffer: Buffer, volume: number): Promise<Buffer> => {
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

export interface BackgroundAudioOptions {
  /** Seconds into the background track to start mixing (default 0 s). */
  startOffset?: number;
  /** Background track volume (0 – 1, default 0.5 = 50 %). */
  volume?: number;
  /** Silence before the foreground starts (lead‑in, default 0 s). */
  preDelay?: number;
  /** Silence after the foreground ends (tail‑out, default 0 s). */
  postDelay?: number;
}

/**
 * Mix an OGG buffer with a background‑audio OGG file.
 */
export const addBackgroundAudio = (
  inputBuffer: Buffer,
  bgPath: string,
  { startOffset = 0, volume = 0.5, preDelay = 0, postDelay = 0 }: BackgroundAudioOptions = {}
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const fgStream = streamifier.createReadStream(inputBuffer);
    const outStream = new PassThrough();
    const chunks: Buffer[] = [];

    /* ---------- foreground filter chain --------------------------- */
    const fgFilters: string[] = [];

    // Lead‑in silence
    if (preDelay > 0) {
      const ms = Math.round(preDelay * 1000);
      fgFilters.push(`adelay=delays=${ms}|${ms}:all=1`);
    }

    // Tail‑out silence
    if (postDelay > 0) {
      fgFilters.push(`apad=pad_dur=${postDelay}`);
    }

    // If we added any FG filters, label the output [fg]
    const fgLine = fgFilters.length ? `[0:a]${fgFilters.join(",")}[fg]` : "";
    const fgLabel = fgFilters.length ? "[fg]" : "[0:a]";

    /* ---------- background volume --------------------------------- */
    const bgLine = `[1:a]volume=${volume}[bg]`;

    /* ---------- final mix (stop with FG) -------------------------- */
    const mixLine =
      `${fgLabel}[bg]amix=` +
      `inputs=2:` +
      `duration=first:` + // stop when foreground ends
      `dropout_transition=0:` +
      `normalize=0[mix]`;

    const filterGraph = [fgLine, bgLine, mixLine].filter(Boolean).join(";");

    /* ---------- run ffmpeg ---------------------------------------- */
    ffmpeg()
      .input(fgStream)
      .inputFormat("ogg")
      .input(bgPath)
      .inputOptions([`-ss ${startOffset}`]) // seek into background
      .complexFilter(filterGraph)
      .outputOptions(`-map [mix]`) // map the mixed audio
      .format("ogg")
      .on("error", reject)
      .on("end", () => resolve(Buffer.concat(chunks)))
      .pipe(outStream, { end: true });

    outStream.on("data", (c) => chunks.push(c));
    outStream.on("error", reject);
  });
