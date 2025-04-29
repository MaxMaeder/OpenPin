import { mkFsContentStore } from "./contentBase";
import { getFirestore } from "firebase-admin/firestore";
import { composeContentRepo } from "src/services/db/repositories/device/content";
import { DeviceNote } from "src/services/db";
import { DEV_NOTES_COL } from "src/config/db";

const col = (deviceId: string) =>
  getFirestore().collection(DEV_NOTES_COL).doc(deviceId).collection("entries");

const store = mkFsContentStore<DeviceNote>(col);

export const notesRepoFs = composeContentRepo(store);
