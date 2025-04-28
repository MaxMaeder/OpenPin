import { DeviceContent } from "./content";

export interface DeviceMessage extends DeviceContent {
  userMsg: string;
  userImgId?: string;
  assistantMsg: string;
}
export type DeviceMessageDraft = Omit<DeviceMessage, "date">;
