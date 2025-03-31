import { createContentSlice, DeviceContent } from "./createContentSlice";

type DeviceCaptureType = "image" | "video";

export interface DeviceCapture extends DeviceContent {
  type: DeviceCaptureType;
  mediaId: string;
}

export const {
  slice: capturesSlice,
  actions: capturesActions,
  selectors: capturesSelectors,
} = createContentSlice<DeviceCapture>("captures");

export default capturesSlice.reducer;
