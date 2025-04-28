import { INIT_DEVICE_SETTINGS } from "src/config/deviceSettings";
import { DeviceSettings } from "src/services/db";
import { composeSettingsRepo, SettingsStore } from "src/services/db/repositories/device/settings";
import { prisma } from "../prisma";
import _ from "lodash";

export const settingsStoreSql: SettingsStore = {
  get: async (deviceId) => {
    const row = await prisma.deviceSettings.findUnique({ where: { id: deviceId } });
    const stored = row ? (row.json as Partial<DeviceSettings>) : {};
    return _.defaultsDeep({}, stored, INIT_DEVICE_SETTINGS);
  },
  update: async (deviceId, patch) => {
    await prisma.deviceSettings.upsert({
      where: { id: deviceId },
      update: { json: patch },
      create: { id: deviceId, json: { ...INIT_DEVICE_SETTINGS, ...patch } },
    });
  },
};

export const settingsRepoSql = composeSettingsRepo(settingsStoreSql);
