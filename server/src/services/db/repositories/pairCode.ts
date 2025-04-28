import { UserId } from "./user";

export interface PairRequest {
  userId: UserId;
  createdAt: Date;
}

export interface PairCodeStore {
  create(userId: string): Promise<string>; // returns pair code
  consume(code: string): Promise<PairRequest>; // throws if invalid/expired
}

export type PairCodeRepo = PairCodeStore;
export const composePairCodeRepo = (s: PairCodeStore): PairCodeRepo => s;
