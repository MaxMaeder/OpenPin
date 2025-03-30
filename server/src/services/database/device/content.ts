export interface DeviceContent {
  date: Date; // Required for sorting and pagination
}

export interface PaginationConfig {
  startAfter?: Date;
  limit: number;
}

export type WithId<T> = T & { id: string };

export interface PaginatedResult<T> {
  entries: WithId<T>[];
  nextStartAfter?: Date;
}

export const getDeviceContent = async <T extends DeviceContent>(
  deviceId: string,
  getRef: (deviceId: string) => FirebaseFirestore.CollectionReference,
  config: PaginationConfig = { limit: 10 }
): Promise<PaginatedResult<T>> => {
  let query = getRef(deviceId)
    .orderBy("date", "desc")
    .limit(config.limit);

  if (config.startAfter) {
    query = query.startAfter(config.startAfter);
  }

  const snapshot = await query.get();

  if (snapshot.empty) {
    return { entries: [], nextStartAfter: undefined };
  }

  const entries = snapshot.docs.map(doc => ({
    ...(doc.data() as T),
    id: doc.id,
  }));
  const nextStartAfter = entries.length > 0 ? entries[entries.length - 1].date : undefined;

  return { entries, nextStartAfter };
};

export const addDeviceContent = async <T extends DeviceContent>(
  deviceId: string,
  data: Omit<T, 'date'>,
  addRef: (deviceId: string) => FirebaseFirestore.CollectionReference,
  maxEntries?: number
): Promise<void> => {
  const collectionRef = addRef(deviceId);

  // Add the new entry with current timestamp
  await collectionRef.add({
    ...data,
    date: new Date(),
  });

  // If no pruning is needed, stop here
  if (!maxEntries) return;

  // Fetch all entries ordered by date descending (newest first)
  const snapshot = await collectionRef
    .orderBy('date', 'desc')
    .get();

  const allDocs = snapshot.docs;

  // If we exceed the max, delete the oldest
  if (allDocs.length > maxEntries) {
    const docsToDelete = allDocs.slice(maxEntries); // Oldest extras
    const batch = collectionRef.firestore.batch();

    docsToDelete.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
  }
};

export const deleteDeviceContent = async (
  deviceId: string,
  id: string,
  getRef: (deviceId: string) => FirebaseFirestore.CollectionReference
): Promise<void> => {
  const docRef = getRef(deviceId).doc(id);
  await docRef.delete();
};


export const clearDeviceContent = async (
  deviceId: string,
  getRef: (deviceId: string) => FirebaseFirestore.CollectionReference
): Promise<void> => {
  const collectionRef = getRef(deviceId);
  const snapshot = await collectionRef.get();

  if (snapshot.empty) return;

  const batch = collectionRef.firestore.batch();

  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};
