import { DeviceId } from "src/dbTypes";
import { CollectionReference, getFirestore } from "firebase-admin/firestore";

import { DEV_MSGS_COL } from "src/config";
import { addDeviceContent, clearDeviceContent, deleteDeviceContent, DeviceContent, getDeviceContent, PaginationConfig } from "./content";

export interface DeviceMessage extends DeviceContent {
  userMsg: string;
  userImgId?: string;
  assistantMsg: string;
}

export const getDeviceMsgsRef = (deviceId: string): CollectionReference =>
  getFirestore().collection(DEV_MSGS_COL).doc(deviceId).collection("entries");

export const getDeviceMsgs = async (
  deviceId: DeviceId,
  config?: PaginationConfig
) => getDeviceContent<DeviceMessage>(deviceId, getDeviceMsgsRef, config);

export const addDeviceMsg = async (
  deviceId: DeviceId,
  message: Omit<DeviceMessage, "date">,
  contextWindow: number
) => addDeviceContent<DeviceMessage>(deviceId, message, getDeviceMsgsRef, contextWindow);

export const deleteDeviceMsg = async (
  deviceId: DeviceId,
  id: string
) => deleteDeviceContent(deviceId, id, getDeviceMsgsRef);

export const clearDeviceMsgs = async (
  deviceId: DeviceId
) => clearDeviceContent(deviceId, getDeviceMsgsRef);
