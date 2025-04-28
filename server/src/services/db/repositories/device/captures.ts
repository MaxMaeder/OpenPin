import { DeviceContent } from "./content";

type DeviceCaptureType = "image" | "video";

export interface DeviceCapture extends DeviceContent {
  type: DeviceCaptureType;
  mediaId: string;
}
export type DeviceCaptureDraft = Omit<DeviceCapture, "date">;
