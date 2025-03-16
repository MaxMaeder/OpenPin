import { DeviceMetadata } from "../../src/endpoints/deviceComm/parser";
import { DashUser } from "../../src/auth/users";
import { PassThrough } from "stream";

declare module "express-serve-static-core" {
  interface Request {
    metadata: DeviceMetadata;
    imageBuffer: Buffer | undefined;
    audioStream: PassThrough;
    user: DashUser;
  }
  interface Response {
    apiOk: (status: string) => void;
    apiError: (code: number, error: string) => void;
  }
}
