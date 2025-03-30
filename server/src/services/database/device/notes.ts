import { DeviceId } from "src/dbTypes";
import { addDeviceContent, deleteDeviceContent, DeviceContent, getDeviceContent, PaginationConfig } from "./content";
import { DEV_NOTES_COL } from "src/config";
import { CollectionReference, getFirestore } from "firebase-admin/firestore";

export interface DeviceNote extends DeviceContent {
  title: string;
  content: string;
}

export const getDeviceNotesRef = (deviceId: string): CollectionReference =>
  getFirestore().collection(DEV_NOTES_COL).doc(deviceId).collection("entries");

export const getDeviceNotes = async (
  deviceId: DeviceId,
  config?: PaginationConfig
) => getDeviceContent<DeviceNote>(deviceId, getDeviceNotesRef, config);

export const addDeviceNote = async (
  deviceId: DeviceId,
  note: Omit<DeviceNote, "date">
) => addDeviceContent<DeviceNote>(deviceId, note, getDeviceNotesRef);

export const deleteDeviceNote = async (
  deviceId: DeviceId,
  id: string
) => deleteDeviceContent(deviceId, id, getDeviceNotesRef);
