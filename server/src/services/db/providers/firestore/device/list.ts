import { getFirestore } from "firebase-admin/firestore";
import { DEV_LIST_COL } from "src/config";
import { composeListRepo, ListStore } from "src/services/db/repositories/device/list";

const fs = getFirestore();

export const listStoreFs: ListStore = {
  create: async (deviceId) => {
    await fs.collection(DEV_LIST_COL).doc(deviceId).set({});
  },
  exists: async (deviceId) => {
    return (await fs.collection(DEV_LIST_COL).doc(deviceId).get()).exists;
  },
};

export const listRepoFs = composeListRepo(listStoreFs);
