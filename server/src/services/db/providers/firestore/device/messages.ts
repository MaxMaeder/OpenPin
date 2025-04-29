import { mkFsContentStore } from "./contentBase";
import { composeContentRepo } from "src/services/db/repositories/device/content";
import { DeviceMessage } from "src/services/db";
import { getFirestore } from "firebase-admin/firestore";
import { DEV_CAPTURES_COL } from "src/config/db";

const col = (deviceId: string) =>
  getFirestore().collection(DEV_CAPTURES_COL).doc(deviceId).collection("entries");

const store = mkFsContentStore<DeviceMessage>(col);

export const msgsRepoFs = composeContentRepo(store);
