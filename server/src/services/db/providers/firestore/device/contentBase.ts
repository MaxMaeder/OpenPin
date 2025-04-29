import { CollectionReference, Timestamp, getFirestore } from "firebase-admin/firestore";
import { DeviceId } from "src/services/db/repositories/device";
import type {
  ContentStore,
  PaginationConfig,
  PaginatedResult,
  DeviceContent,
} from "src/services/db/repositories/device/content";

const fs = getFirestore();

type FsColFactory = (deviceId: string) => CollectionReference;

export const mkFsContentStore = <T extends DeviceContent>(
  colFactory: FsColFactory
): ContentStore<T> => {
  return {
    list: async (
      deviceId: DeviceId,
      config: PaginationConfig = { limit: 10 }
    ): Promise<PaginatedResult<T>> => {
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

    add: async (deviceId, data, pruneTo?: number) => {
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

    update: async (deviceId, id, patch) => {
      await colFactory(deviceId).doc(id).set(patch, { merge: true });
    },

    remove: async (deviceId, id) => {
      await colFactory(deviceId).doc(id).delete();
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
};
