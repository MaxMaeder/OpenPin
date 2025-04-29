import { composeListRepo, ListStore } from "src/services/db/repositories/device/list";
import { prisma } from "../prisma";

const table = prisma.device;

export const listStoreSql: ListStore = {
  create: async (deviceId) => {
    await table.create({ data: { id: deviceId } });
  },
  exists: async (deviceId) => {
    return !!(await table.findUnique({ where: { id: deviceId }, select: { id: true } }));
  },
};

export const listRepoSql = composeListRepo(listStoreSql);
