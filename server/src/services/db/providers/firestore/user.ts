import type { UserRepo } from "../../repositories/user";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { USER_DATA_COL, INIT_USER_DATA } from "src/config";
import _ from "lodash";

const fs = getFirestore();

export const userRepoFirestore: UserRepo = {
  async get(uid) {
    const snap = await fs.collection(USER_DATA_COL).doc(uid).get();
    const stored = snap.exists ? snap.data()! : {};
    return _.defaultsDeep({}, stored, INIT_USER_DATA);
  },
  async update(uid, patch) {
    await fs.collection(USER_DATA_COL).doc(uid).set(patch, { merge: true });
  },
  async addDevice(uid, deviceId) {
    await fs
      .collection(USER_DATA_COL)
      .doc(uid)
      .update({
        deviceIds: FieldValue.arrayUnion(deviceId),
      });
  },
  async hasDevice(uid, deviceId) {
    const data = await this.get(uid);
    return data.deviceIds.includes(deviceId);
  },
};
