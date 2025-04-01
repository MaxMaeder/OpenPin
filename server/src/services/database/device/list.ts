import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import { DEV_LIST_COL } from "src/config";

export const getDeviceListRef = (deviceId: string): DocumentReference =>
  getFirestore().collection(DEV_LIST_COL).doc(deviceId);

export const createDevice = async (deviceId: string): Promise<void> => {
  await getDeviceListRef(deviceId).set({});
};

export const doesDeviceExist = async (deviceId: string): Promise<boolean> => {
  const dev = await getDeviceListRef(deviceId).get();
  return dev.exists;
};
