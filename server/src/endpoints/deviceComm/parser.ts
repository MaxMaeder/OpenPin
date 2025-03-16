import * as express from "express";

import { InferType, boolean, number, object, string } from "yup";

import { PassThrough } from "stream";
import { DEFAULT_AUDIO_BITRATE, REQ_METADATA_SIZE } from "../../config";

const bitrateSchema = string()
  .matches(/^\d+k$/)
  .default(DEFAULT_AUDIO_BITRATE);

const metadataSchema = object({
  audioSize: number().required().min(0).integer(),
  audioFormat: string().default("gsm"),
  imageSize: number().required().min(0).integer(),
  deviceId: string().required(),
  latitude: number(),
  longitude: number(),
  battery: number().min(0).max(1).default(1),
  didWifiDisconnect: boolean().default(false),
  audioBitrate: bitrateSchema,
});

export type DeviceMetadata = InferType<typeof metadataSchema>;

export interface ParsedAssistantRequest extends express.Request {
  metadata: DeviceMetadata;
  imageBuffer: Buffer | undefined;
  audioStream: PassThrough;
}

const getBodyBuffer = async (req: express.Request): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    req.on("error", (error) => {
      reject(error);
    });
  });
};

export const parseDeviceReq = async (
  req: ParsedAssistantRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const buffer = await getBodyBuffer(req);
    console.log("Body size", buffer.length);

    let rawJsonData = new Uint8Array(buffer, 0, REQ_METADATA_SIZE);

    const endIndex = rawJsonData.indexOf(0); // Use the ASCII value of '\0'
    if (endIndex != -1) {
      rawJsonData = rawJsonData.slice(0, endIndex);
    }
    const jsonStr = new TextDecoder().decode(rawJsonData);

    // If strict, default not used
    req.metadata = await metadataSchema.validate(JSON.parse(jsonStr));

    if (req.metadata.imageSize != 0) {
      req.imageBuffer = buffer.subarray(
        REQ_METADATA_SIZE,
        req.metadata.imageSize + REQ_METADATA_SIZE
      );
    }

    req.audioStream = new PassThrough();
    req.audioStream.end(
      buffer.subarray(
        req.metadata.imageSize + REQ_METADATA_SIZE,
        req.metadata.audioSize + req.metadata.imageSize + REQ_METADATA_SIZE
      )
    );

    next();
  } catch (error) {
    console.error(error);
    res.status(400).send({ error });
  }
};
