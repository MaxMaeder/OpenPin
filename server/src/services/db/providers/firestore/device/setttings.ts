import { getFirestore } from "firebase-admin/firestore";
import _ from "lodash";
import { INIT_DEVICE_SETTINGS } from "src/config/deviceSettings";
import { composeSettingsRepo, SettingsStore } from "src/services/db/repositories/device/settings";
import { DeviceSettings } from "src/services/db";
import { DEV_SETTINGS_COL } from "src/config/db";

const fs = getFirestore();

export const settingsStoreFs: SettingsStore = {
  get: async (deviceId) => {
    const snap = await fs.collection(DEV_SETTINGS_COL).doc(deviceId).get();
    const stored = snap.exists ? (snap.data() as Partial<DeviceSettings>) : {};
    return _.defaultsDeep({}, stored, INIT_DEVICE_SETTINGS);
  },
  update: async (deviceId, patch) => {
    await fs.collection(DEV_SETTINGS_COL).doc(deviceId).set(patch, { merge: true });
  },
};

export const settingsRepoFs = composeSettingsRepo(settingsStoreFs);
