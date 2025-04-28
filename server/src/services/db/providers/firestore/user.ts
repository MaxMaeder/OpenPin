import { composeUserRepo, UserStore } from "src/services/db/repositories/user";
import { getFirestore } from "firebase-admin/firestore";
import { USER_DATA_COL, INIT_USER_DATA } from "src/config";
import _ from "lodash";

const fs = getFirestore();

export const userStoreFs: UserStore = {
  async get(uid) {
    const snap = await fs.collection(USER_DATA_COL).doc(uid).get();
    const stored = snap.exists ? snap.data()! : {};
    return _.defaultsDeep({}, stored, INIT_USER_DATA);
  },
  async update(uid, patch) {
    await fs.collection(USER_DATA_COL).doc(uid).set(patch, { merge: true });
  },
};

export const userRepoFs = composeUserRepo(userStoreFs);
