import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import { PAIR_CODES_COL } from "../../config";
import { PairRequest } from "../../dbTypes";

export const getPairRequestRef = (pairCode: string): DocumentReference =>
  getFirestore().collection(PAIR_CODES_COL).doc(pairCode);

export const createPairCode = async (userId: string): Promise<string> => {
  const pairCodesRef = getFirestore().collection(PAIR_CODES_COL);
  const newCodeRef = pairCodesRef.doc();

  await newCodeRef.set({
    userId,
    createdAt: new Date()
  });
  return newCodeRef.id;
}

export const usePairCode = async (pairCode: string): Promise<PairRequest> => {
  const pairCodeRef = getPairRequestRef(pairCode);
  const codeData = (await pairCodeRef.get()).data();

  if (!codeData)
    throw new Error("Pair code does not exist.");

  await pairCodeRef.delete();

  return {
    userId: codeData.userId,
    createdAt: codeData.createdAt.toDate()
  };
};
