import { getFirestore } from "firebase-admin/firestore";
import _ from "lodash";
import { DEV_DATA_COL, INIT_DEVICE_DATA } from "src/config";
import { composeDataRepo, DataStore } from "src/services/db/repositories/device/data";
import { DeviceData } from "src/services/db";

const fs = getFirestore();

export const dataStoreFs: DataStore = {
  get: async (deviceId) => {
    const snap = await fs.collection(DEV_DATA_COL).doc(deviceId).get();
    const stored = snap.exists ? (snap.data() as Partial<DeviceData>) : {};
    return _.defaultsDeep({}, stored, INIT_DEVICE_DATA);
  },
  update: async (deviceId, patch) => {
    await fs.collection(DEV_DATA_COL).doc(deviceId).set(patch, { merge: true });
  },
};

export const dataRepoFs = composeDataRepo(dataStoreFs);
