import { DeviceId } from "src/dbTypes";
import { addDeviceContent, deleteDeviceContent, DeviceContent, getDeviceContent, PaginationConfig } from "./content";
import { DEV_CAPTURES_COL } from "src/config";
import { CollectionReference, getFirestore } from "firebase-admin/firestore";

type DeviceCaptureType = "image" | "video";

export interface DeviceCapture extends DeviceContent {
  type: DeviceCaptureType;
  gcsUri: string;
}

export const getDeviceCapturesRef = (deviceId: string): CollectionReference =>
  getFirestore().collection(DEV_CAPTURES_COL).doc(deviceId).collection("entries");

export const getDeviceCaptures = async (
  deviceId: DeviceId,
  config?: PaginationConfig
) => getDeviceContent<DeviceCapture>(deviceId, getDeviceCapturesRef, config);

export const addDeviceCapture = async (
  deviceId: DeviceId,
  capture: Omit<DeviceCapture, "date">
) => addDeviceContent<DeviceCapture>(deviceId, capture, getDeviceCapturesRef);

export const deleteDeviceCapture = async (
  deviceId: DeviceId,
  id: string
) => deleteDeviceContent(deviceId, id, getDeviceCapturesRef);
