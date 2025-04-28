import { CollectionReference, Timestamp, getFirestore } from "firebase-admin/firestore";
import type { DeviceId } from "src/dbTypes";
import type {
  DeviceContentRepo,
  PaginationConfig,
  PaginatedResult,
  DeviceContent,
} from "../../../repositories/device/content";

const fs = getFirestore();

type FsColFactory = (deviceId: string) => CollectionReference;

export function mkFsDeviceContentRepo<T extends DeviceContent>(
  colFactory: FsColFactory,
  pruneTo?: number
): DeviceContentRepo<T> {
  return {
    async list(
      deviceId: DeviceId,
      config: PaginationConfig = { limit: 10 }
    ): Promise<PaginatedResult<T>> {
      let q = colFactory(deviceId).orderBy("date", "desc").limit(config.limit);
      if (config.startAfter) q = q.startAfter(Timestamp.fromDate(config.startAfter));

      const snap = await q.get();
      if (snap.empty) return { entries: [], nextStartAfter: null };

      const entries = snap.docs.map((doc) => {
        const data = doc.data() as T;

        return {
          ...data,
          date: (data.date as unknown as Timestamp).toDate(),
          id: doc.id,
        };
      });
      const nextStartAfter = entries[entries.length - 1].date ?? null;

      return { entries, nextStartAfter };
    },

    async add(deviceId, data) {
      const col = colFactory(deviceId);
      const now = new Date();
      const ref = await col.add({ ...data, date: now });

      // Optional pruning of old records
      if (pruneTo) {
        const snap = await col.orderBy("date", "desc").get();
        const extras = snap.docs.slice(pruneTo);
        if (extras.length) {
          const batch = fs.batch();
          extras.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      }
      return { ...(data as T), date: now, id: ref.id };
    },

    update: async (_deviceId, id, patch) => {
      await colFactory(_deviceId).doc(id).set(patch, { merge: true });
    },

    remove: async (_deviceId, id) => {
      await colFactory(_deviceId).doc(id).delete();
    },

    clear: async (deviceId) => {
      const col = colFactory(deviceId);
      const snap = await col.listDocuments();
      if (!snap.length) return;
      const batch = fs.batch();
      snap.forEach((d) => batch.delete(d));
      await batch.commit();
    },
  };
}
