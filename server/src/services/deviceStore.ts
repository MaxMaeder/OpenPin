import {
  DEV_DATA_COL,
  DEV_IDS_COL,
  DEV_SETTINGS_COL,
  INIT_DEVICE_DATA,
  INIT_DEVICE_SETTINGS,
} from "../config";
import { DeviceData, DeviceSettings } from "../dbTypes";
import {
  DocumentReference,
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";

type FirestoreUpdate<T> = {
  [P in keyof T]?: T[P] | FieldValue;
};

export const getDeviceRef = (deviceId: string): DocumentReference =>
  getFirestore().collection(DEV_IDS_COL).doc(deviceId);

export const createDevIfNExists = async (deviceId: string) => {
  await getFirestore().runTransaction(async (transaction) => {
    const devRef = getDeviceRef(deviceId);
    const dev = await transaction.get(devRef);

    if (!dev.exists) {
      transaction.set(devRef, {});
    }
  });
};

export const doesDevExist = async (deviceId: string): Promise<boolean> => {
  const dev = await getDeviceRef(deviceId).get();
  return dev.exists;
};

export const getDeviceIds = async (): Promise<string[]> => {
  const snapshot = await getFirestore().collection(DEV_IDS_COL).get();

  return snapshot.docs.map(({ id }) => id);
};

export const getDeviceDataRef = (deviceId: string): DocumentReference =>
  getFirestore().collection(DEV_DATA_COL).doc(deviceId);

export const getDeviceData = async (deviceId: string): Promise<DeviceData> => {
  const snapshot = await getDeviceDataRef(deviceId).get();
  return Object.assign({}, INIT_DEVICE_DATA, snapshot.data());
};

export const updateDeviceData = async (
  deviceId: string,
  data: Partial<FirestoreUpdate<DeviceData>>
) => await getDeviceDataRef(deviceId).set(data, { merge: true });

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
