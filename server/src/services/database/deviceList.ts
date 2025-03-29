// import { DocumentReference, getFirestore } from "firebase-admin/firestore";
// import { DEV_LIST_COL } from "../../config";

// export const getDeviceRef = (deviceId: string): DocumentReference =>
//   getFirestore().collection(DEV_LIST_COL).doc(deviceId);

// export const createDevice = async (deviceId: string) => {
//   await getFirestore().runTransaction(async (transaction) => {
//     const devRef = getDeviceRef(deviceId);
//     const dev = await transaction.get(devRef);

//     if (!dev.exists) {
//       transaction.set(devRef, {});
//     }
//   });
// };

// export const doesDeviceExist = async (deviceId: string): Promise<boolean> => {
//   const dev = await getDeviceRef(deviceId).get();
//   return dev.exists;
// };