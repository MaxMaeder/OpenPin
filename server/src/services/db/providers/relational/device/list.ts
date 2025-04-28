import { composeListRepo, ListStore } from "src/services/db/repositories/device/list";
import { prisma } from "../prisma";

export const listStoreSql: ListStore = {
  create: async (deviceId) => {
    await prisma.device.create({ data: { id: deviceId } });
  },
  exists: async (deviceId) => {
    return !!(await prisma.device.findUnique({ where: { id: deviceId }, select: { id: true } }));
  },
};

export const listRepoSql = composeListRepo(listStoreSql);
