import { DeviceId } from "src/dbTypes";
import {
  addDeviceContent,
  deleteDeviceContent,
  DeviceContent,
  getDeviceContent,
  PaginationConfig,
  updateDeviceContent,
} from "./content";
import { DEV_NOTES_COL } from "src/config";
import { CollectionReference, getFirestore } from "firebase-admin/firestore";

export interface DeviceNote extends DeviceContent {
  title: string;
  content: string;
}
export type DeviceNoteDraft = Omit<DeviceNote, "date">;

export const getDeviceNotesRef = (deviceId: string): CollectionReference =>
  getFirestore().collection(DEV_NOTES_COL).doc(deviceId).collection("entries");

export const getDeviceNotes = async (
  deviceId: DeviceId,
  config?: PaginationConfig
) => getDeviceContent<DeviceNote>(deviceId, getDeviceNotesRef, config);

export const addDeviceNote = async (
  deviceId: DeviceId,
  note: DeviceNoteDraft
) => addDeviceContent<DeviceNote>(deviceId, note, getDeviceNotesRef);

export const updateDeviceNote = async (
  deviceId: DeviceId,
  noteId: string,
  noteUpdate: Partial<DeviceNoteDraft>
) =>
  updateDeviceContent<DeviceNote>(
    deviceId,
    noteId,
    noteUpdate,
    getDeviceNotesRef
  );

export const deleteDeviceNote = async (deviceId: DeviceId, id: string) =>
  deleteDeviceContent(deviceId, id, getDeviceNotesRef);
