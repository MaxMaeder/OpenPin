import { PassThrough } from "stream";
import { DeviceMetadata } from "../../src/endpoints/device/util/parser";
import { UserId } from "../../src/dbTypes";

declare module "express-serve-static-core" {
  interface Request {
    metadata: DeviceMetadata;
    imageBuffer: Buffer | undefined;
    audioStream: PassThrough;
    userId: UserId;
  }
  interface Response { }
}