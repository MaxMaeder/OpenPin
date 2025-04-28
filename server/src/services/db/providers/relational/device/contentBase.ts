import { PrismaClient } from "@prisma/client";
import type { DeviceId } from "src/dbTypes";
import type {
  ContentStore,
  PaginationConfig,
  WithId,
  PaginatedResult,
  DeviceContent,
} from "../../../repositories/device/content";

const prisma = new PrismaClient();

// Assumes a table named <prefix>Entry with columns:
// id        String   @id @default(cuid())
// deviceId  String   @index
// date      DateTime @index
// json      Json

export function mkSqlContentStore<T extends DeviceContent>(
  table: keyof PrismaClient,
  pruneTo?: number
): ContentStore<T> {
  const model = prisma[table] as any;
  return {
    async list(
      deviceId: DeviceId,
      config: PaginationConfig = { limit: 10 }
    ): Promise<PaginatedResult<T>> {
      const rows = await model.findMany({
        where: {
          deviceId,
          ...(config.startAfter ? { date: { lt: config.startAfter } } : {}),
        },
        orderBy: { date: "desc" },
        take: config.limit,
      });

      if (!rows.length) return { entries: [], nextStartAfter: null };

      const entries: WithId<T>[] = rows.map((r: any) => ({ id: r.id, ...(r.json as T) }));
      const nextStartAfter = entries[entries.length - 1].date ?? null;

      return { entries, nextStartAfter };
    },

    async add(deviceId, data) {
      const now = new Date();
      const row = await model.create({
        data: { deviceId, date: now, json: { ...data } },
      });

      if (pruneTo) {
        const extra = await model.findMany({
          where: { deviceId },
          orderBy: { date: "desc" },
          skip: pruneTo,
          select: { id: true },
        });
        if (extra.length) {
          await model.deleteMany({ where: { id: { in: extra.map((e: any) => e.id) } } });
        }
      }
      return { ...(data as T), date: now, id: row.id };
    },

    update: async (_deviceId, id, patch) => {
      await model.update({ where: { id }, data: { json: { ...patch } } });
    },

    remove: async (_deviceId, id) => {
      await model.delete({ where: { id } });
    },

    clear: async (deviceId) => {
      await model.deleteMany({ where: { deviceId } });
    },
  };
}
