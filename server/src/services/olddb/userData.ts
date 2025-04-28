import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import { INIT_USER_DATA, USER_DATA_COL } from "../../config";
import { DeviceId, FirestoreUpdate, UserData } from "../../dbTypes";
import _ from "lodash";

export const getUserDataRef = (userId: string): DocumentReference =>
  getFirestore().collection(USER_DATA_COL).doc(userId);

export const getUserData = async (userId: string): Promise<UserData> => {
  const snap = await getUserDataRef(userId).get();
  const stored = snap.exists ? (snap.data() as Partial<UserData>) : {};

  // 1. start with an empty object
  // 2. apply stored fields as “defaults”
  // 3. fill in any missing bits from INIT_USER_DATA
  return _.defaultsDeep({}, stored, INIT_USER_DATA);
};

export const updateUserData = async (userId: string, data: Partial<FirestoreUpdate<UserData>>) =>
  await getUserDataRef(userId).set(data, { merge: true });

export const getUserDevices = async (userId: string): Promise<DeviceId[]> =>
  (await getUserData(userId)).deviceIds;

export const doesUserHaveDevice = async (userId: string, deviceId: string): Promise<boolean> =>
  (await getUserDevices(userId)).includes(deviceId);

// TODO: race condition
export const addUserDevice = async (userId: string, deviceId: string): Promise<void> => {
  const data = await getUserData(userId);
  data.deviceIds.push(deviceId);
  await updateUserData(userId, data);
};
