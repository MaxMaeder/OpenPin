import type { UserRepo } from "../../repositories/user";
import { PrismaClient } from "@prisma/client";
import _ from "lodash";
import { INIT_USER_DATA } from "src/config";

const prisma = new PrismaClient();

export const userRepoSql: UserRepo = {
  async get(uid) {
    const row = await prisma.userData.findUnique({ where: { id: uid } });
    const stored = row ? (row.json as any) : {};
    return _.defaultsDeep({}, stored, INIT_USER_DATA);
  },
  async update(uid, patch) {
    await prisma.userData.upsert({
      where: { id: uid },
      update: { json: { ...patch } },
      create: { id: uid, json: { ...INIT_USER_DATA, ...patch } },
    });
  },
  async addDevice(uid, deviceId) {
    const cur = await this.get(uid);
    if (!cur.deviceIds.includes(deviceId)) {
      cur.deviceIds.push(deviceId);
      await this.update(uid, { deviceIds: cur.deviceIds });
    }
  },
  async hasDevice(uid, deviceId) {
    const cur = await this.get(uid);
    return cur.deviceIds.includes(deviceId);
  },
};
