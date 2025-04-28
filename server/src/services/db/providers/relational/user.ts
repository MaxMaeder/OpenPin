import { composeUserRepo, type UserStore } from "../../repositories/user";
import _ from "lodash";
import { INIT_USER_DATA } from "src/config";
import { prisma } from "./prisma";

export const userStoreSql: UserStore = {
  get: async (uid) => {
    const row = await prisma.userData.findUnique({ where: { id: uid } });
    const stored = row ? (row.json as any) : {};
    return _.defaultsDeep({}, stored, INIT_USER_DATA);
  },
  update: async (uid, patch) => {
    await prisma.userData.upsert({
      where: { id: uid },
      update: { json: { ...patch } },
      create: { id: uid, json: { ...INIT_USER_DATA, ...patch } },
    });
  },
};

export const userRepoSql = composeUserRepo(userStoreSql);
