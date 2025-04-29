import { PassThrough } from "stream";
import { DeviceMetadata } from "../../src/endpoints/device/voice/parser";
import { UserId } from "src/services/db";

declare module "express-serve-static-core" {
  interface Request {
    metadata: DeviceMetadata;
    imageBuffer: Buffer | undefined;
    audioBuffer: Buffer;
    userId: UserId;
  }
  interface Response {}
}
