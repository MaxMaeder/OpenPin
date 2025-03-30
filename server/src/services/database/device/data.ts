import { DEV_DATA_COL, INIT_DEVICE_DATA } from "src/config";
import { DeviceData, FirestoreUpdate } from "src/dbTypes";
import { DocumentReference, getFirestore } from "firebase-admin/firestore";

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
