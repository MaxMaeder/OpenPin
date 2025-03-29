import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import { INIT_USER_DATA, USER_DATA_COL } from "../../config";
import { DeviceId, FirestoreUpdate, UserData } from "../../dbTypes";

export const getUserDataRef = (userId: string): DocumentReference =>
  getFirestore().collection(USER_DATA_COL).doc(userId);

export const getUserData = async (userId: string): Promise<UserData> => {
  const snapshot = await getUserDataRef(userId).get();
  return Object.assign({}, INIT_USER_DATA, snapshot.data());
};

export const updateUserData = async (
  userId: string,
  data: Partial<FirestoreUpdate<UserData>>
) => await getUserDataRef(userId).set(data, { merge: true });


export const getUserDevices = async (userId: string): Promise<DeviceId[]> => 
  (await getUserData(userId)).deviceIds;

export const doesUserHaveDevice = async (userId: string, deviceId: string): Promise<boolean> =>
  (await getUserDevices(userId)).includes(deviceId)

// TODO: race condition
export const addUserDevice = async (userId: string, deviceId: string): Promise<void> => {
  const data = await getUserData(userId);
  data.deviceIds.push(deviceId);
  await updateUserData(userId, data);
}