import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import { DEV_SETTINGS_COL, INIT_DEVICE_SETTINGS } from "../../config";
import { DeviceSettings, FirestoreUpdate } from "../../dbTypes";

export const getDeviceSettingsRef = (deviceId: string): DocumentReference =>
  getFirestore().collection(DEV_SETTINGS_COL).doc(deviceId);

export const getDeviceSettings = async (
  deviceId: string
): Promise<DeviceSettings> => {
  const snapshot = await getDeviceSettingsRef(deviceId).get();
  return Object.assign({}, INIT_DEVICE_SETTINGS, snapshot.data());
};

export const updateDeviceSettings = async (
  deviceId: string,
  settings: Partial<FirestoreUpdate<DeviceSettings>>
) => await getDeviceSettingsRef(deviceId).set(settings, { merge: true });
