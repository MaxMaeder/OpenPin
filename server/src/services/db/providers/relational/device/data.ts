import { composeDataRepo, DataStore } from "src/services/db/repositories/device/data";
import { DeviceData } from "src/services/db";
import { prisma } from "../prisma";
import _ from "lodash";
import { INIT_DEVICE_DATA } from "src/config";

export const dataStoreSql: DataStore = {
  async get(deviceId) {
    const row = await prisma.deviceData.findUnique({ where: { id: deviceId } });
    const stored = row ? (row.json as Partial<DeviceData>) : {};
    return _.defaultsDeep({}, stored, INIT_DEVICE_DATA);
  },
  async update(deviceId, patch) {
    await prisma.deviceData.upsert({
      where: { id: deviceId },
      update: { json: patch },
      create: { id: deviceId, json: { ...INIT_DEVICE_DATA, ...patch } },
    });
  },
};

export const dataRepoSql = composeDataRepo(dataStoreSql);
