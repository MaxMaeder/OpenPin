import { Timestamp } from "firebase-admin/firestore";

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

  // Next start after will always be specified in responses from DB,
  // either a Date or null if no more records exist
  //
  // However, PaginatedResult can also be used in cases (ex: sending partial updates to client via socket),
  // where we don't know the date which the data starts after. In these cases it should be undefined.
  nextStartAfter?: Date | null;
}

export const getDeviceContent = async <T extends DeviceContent>(
  deviceId: string,
  getRef: (deviceId: string) => FirebaseFirestore.CollectionReference,
  config: PaginationConfig = { limit: 10 }
): Promise<PaginatedResult<T>> => {
  let query = getRef(deviceId).orderBy("date", "desc").limit(config.limit);

  if (config.startAfter) {
    query = query.startAfter(Timestamp.fromDate(config.startAfter));
  }

  const snapshot = await query.get();

  if (snapshot.empty) {
    return { entries: [], nextStartAfter: null };
  }

  const entries = snapshot.docs.map((doc) => {
    const data = doc.data() as T;

    return {
      ...data,
      date: (data.date as unknown as Timestamp).toDate(),
      id: doc.id,
    };
  });
  const nextStartAfter =
    entries.length > 0 ? entries[entries.length - 1].date : null;

  return { entries, nextStartAfter };
};

export const addDeviceContent = async <T extends DeviceContent>(
  deviceId: string,
  data: Omit<T, "date">,
  addRef: (deviceId: string) => FirebaseFirestore.CollectionReference,
  maxEntries?: number
): Promise<WithId<T>> => {
  const collectionRef = addRef(deviceId);

  // Create the new entry including the current timestamp
  const newData = {
    ...data,
    date: new Date(),
  };

  // Add the new entry to Firestore and get its DocumentReference
  const docRef = await collectionRef.add(newData);

  // If pruning is requested, fetch and delete the oldest extras
  if (maxEntries) {
    const snapshot = await collectionRef.orderBy("date", "desc").get();
    const allDocs = snapshot.docs;

    if (allDocs.length > maxEntries) {
      const docsToDelete = allDocs.slice(maxEntries);
      const batch = collectionRef.firestore.batch();

      docsToDelete.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();
    }
  }

  // Return the inserted entry along with its generated document ID
  return { id: docRef.id, ...newData } as WithId<T>;
};

export const updateDeviceContent = async <T extends DeviceContent>(
  deviceId: string,
  id: string,
  data: Partial<Omit<T, "date">>,
  getRef: (deviceId: string) => FirebaseFirestore.CollectionReference
): Promise<WithId<T> | null> => {
  const docRef = getRef(deviceId).doc(id);

  // Check if the document exists
  const snapshot = await docRef.get();
  if (!snapshot.exists) return null;

  await docRef.update(data);

  // Return the updated document
  const updatedSnapshot = await docRef.get();
  const updatedData = updatedSnapshot.data() as T;

  return {
    ...updatedData,
    date: (updatedData.date as unknown as Timestamp).toDate(),
    id: updatedSnapshot.id,
  };
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

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};
