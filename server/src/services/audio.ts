import * as speech from "./speech";

import { FileResult, file } from "tmp-promise";

import { PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";
import { writeFile } from "fs-extra";

export type AudioFormat = "mp3" | "m4a";

export interface AudioComponent {
  type: "buffer" | "speech";
}

export interface ProcessedAudioComponent extends AudioComponent {
  file: FileResult;
  format: AudioFormat;
  filter: ffmpeg.FilterSpecification;
}

export type InputAudioComponent = AudioBufferComponent | AudioSpeechComponent;

export interface AudioBufferComponent extends AudioComponent {
  type: "buffer";
  buffer: Buffer;
  format: AudioFormat;
  filter?: ffmpeg.FilterSpecification;
}

export interface AudioSpeechComponent extends AudioComponent {
  type: "speech";
  text: string;
}

const defaultFilter: ffmpeg.FilterSpecification = {
  filter: "anull",
};

const processAudioComponent = async (
  component: InputAudioComponent,
  index: number
): Promise<ProcessedAudioComponent> => {
  const tmpFile = await file();

  let buffer: Buffer;
  let format: AudioFormat;

  if (component.type === "speech") {
    const speechComponent = component as AudioSpeechComponent;

    buffer = Buffer.from(await speech.speak(speechComponent.text));
    format = "mp3";
  } else {
    const bufferComponent = component as AudioBufferComponent;

    buffer = bufferComponent.buffer;
    format = bufferComponent.format;
  }

  await writeFile(tmpFile.path, buffer);

  const filter = (component as AudioBufferComponent).filter || defaultFilter;
  filter.outputs = `filtered-${index}`;

  return {
    ...component,
    format,
    file: tmpFile,
    filter,
  };
};

const generateSilence = async (duration: number): Promise<FileResult> => {
  const tmpFile = await file({ postfix: ".mp3" });

  return new Promise<FileResult>((resolve, reject) => {
    ffmpeg()
      .input("anullsrc")
      .inputFormat("lavfi")
      .outputOptions(`-t ${duration}`)
      .output(tmpFile.path)
      .on("end", () => {
        resolve(tmpFile);
      })
      .on("error", (err: Error) => {
        tmpFile.cleanup();
        reject(err);
      })
      .run();
  });
};

const cleanupAll = (components: Array<ProcessedAudioComponent>) => {
  for (const component of components) {
    component.file.cleanup();
  }
};

interface CombineAudioComponentsConfig {
  bitrate: string;
  spacing: number;
}

export const combineAudioComponents = async (
  components: InputAudioComponent[],
  config: CombineAudioComponentsConfig
) => {
  const processedComponents = await Promise.all(
    components.map(processAudioComponent)
  );

  const silenceFile = await generateSilence(config.spacing);

  return new Promise<Buffer>((resolve, reject) => {
    const ffmpegInstance = ffmpeg();

    for (let i = 0; i < processedComponents.length; i++) {
      const component = processedComponents[i];
      ffmpegInstance.input(component.file.path);
      ffmpegInstance.inputFormat(component.format);

      // Add silence between each component, except after the last one
      if (i < processedComponents.length - 1) {
        ffmpegInstance.input(silenceFile.path);
      }
    }

    ffmpegInstance.audioBitrate(config.bitrate);

    ffmpegInstance.complexFilter([
      ...processedComponents.map((component) => component.filter),
      {
        filter: "concat",
        inputs: processedComponents.map((_, index) => `filtered-${index}`),
        options: {
          // each component followed by silence, except the last one
          n: processedComponents.length * 2 - 1,
          // n: processedComponents.length,
          v: 0, // no video
          a: 1, // only audio
        },
      },
    ]);

    const doCleanup = () => {
      silenceFile.cleanup();
      cleanupAll(processedComponents);
    };

    const outStream = new PassThrough();
    const outChunks: Buffer[] = [];
    outStream.on("data", (chunk) => {
      outChunks.push(chunk);
    });

    ffmpegInstance
      .format("mp3")
      .output(outStream)
      .on("error", (err: Error) => {
        doCleanup();
        reject(err);
      })
      .on("end", () => {
        doCleanup();
        resolve(Buffer.concat(outChunks));
      })
      .run();
  });
};
