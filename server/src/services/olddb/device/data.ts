import { DEV_DATA_COL, INIT_DEVICE_DATA } from "src/config";
import { DeviceData, FirestoreUpdate } from "src/dbTypes";
import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import _ from "lodash";

export const getDeviceDataRef = (deviceId: string): DocumentReference =>
  getFirestore().collection(DEV_DATA_COL).doc(deviceId);

export const getDeviceData = async (deviceId: string): Promise<DeviceData> => {
  const snap = await getDeviceDataRef(deviceId).get();
  const stored = snap.exists ? (snap.data() as Partial<DeviceData>) : {};

  // 1. start with an empty object
  // 2. apply stored fields as “defaults”
  // 3. fill in any missing bits from INIT_DEVICE_DATA
  return _.defaultsDeep({}, stored, INIT_DEVICE_DATA);
};

export const updateDeviceData = async (
  deviceId: string,
  data: Partial<FirestoreUpdate<DeviceData>>
) => await getDeviceDataRef(deviceId).set(data, { merge: true });
