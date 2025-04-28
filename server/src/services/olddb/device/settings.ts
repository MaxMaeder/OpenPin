import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import _ from "lodash";
import { DEV_SETTINGS_COL } from "src/config";
import { DeviceSettings, INIT_DEVICE_SETTINGS } from "src/config/deviceSettings";
import { FirestoreUpdate } from "src/dbTypes";

export const getDeviceSettingsRef = (deviceId: string): DocumentReference =>
  getFirestore().collection(DEV_SETTINGS_COL).doc(deviceId);

export const getDeviceSettings = async (deviceId: string): Promise<DeviceSettings> => {
  const snap = await getDeviceSettingsRef(deviceId).get();
  const stored = snap.exists ? (snap.data() as Partial<DeviceSettings>) : {};

  // 1. start with an empty object
  // 2. apply stored fields as “defaults”
  // 3. fill in any missing bits from INIT_DEVICE_SETTINGS
  return _.defaultsDeep({}, stored, INIT_DEVICE_SETTINGS);
};

export const updateDeviceSettings = async (
  deviceId: string,
  settings: Partial<FirestoreUpdate<DeviceSettings>>
) => await getDeviceSettingsRef(deviceId).set(settings, { merge: true });
