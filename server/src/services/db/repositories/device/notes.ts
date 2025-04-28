import { DeviceContent } from "./content";

export interface DeviceNote extends DeviceContent {
  title: string;
  content: string;
}
export type DeviceNoteDraft = Omit<DeviceNote, "date">;
