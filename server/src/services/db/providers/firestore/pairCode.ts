import { getFirestore } from "firebase-admin/firestore";
import { PAIR_CODES_COL } from "src/config/db";
import { composePairCodeRepo, PairCodeStore } from "src/services/db/repositories/pairCode";

const fs = getFirestore();

export const pairCodeStoreFs: PairCodeStore = {
  create: async (userId) => {
    const codes = fs.collection(PAIR_CODES_COL);
    const ref = codes.doc();
    await ref.set({ userId, createdAt: new Date() });
    return ref.id;
  },
  consume: async (code) => {
    const ref = fs.collection(PAIR_CODES_COL).doc(code);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("Pair code does not exist");

    const data = snap.data()!;
    await ref.delete();

    return {
      userId: data.userId as string,
      createdAt: (data.createdAt as FirebaseFirestore.Timestamp).toDate(),
    };
  },
};

export const pairCodeRepoFs = composePairCodeRepo(pairCodeStoreFs);
