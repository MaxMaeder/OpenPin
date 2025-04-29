import { DeviceId } from ".";

export interface DeviceContent {
  date: Date;
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

export interface ContentStore<T extends DeviceContent> {
  list(deviceId: DeviceId, config?: PaginationConfig): Promise<PaginatedResult<T>>;
  add(deviceId: DeviceId, data: Omit<T, "date">, pruneTo?: number): Promise<WithId<T>>;
  update(deviceId: DeviceId, id: string, patch: Partial<T>): Promise<void>;
  remove(deviceId: DeviceId, id: string): Promise<void>;
  clear(deviceId: DeviceId): Promise<void>;
}

export type ContentRepo<T extends DeviceContent> = ContentStore<T>; // no added helpers for now

export const composeContentRepo = <T extends DeviceContent>(
  store: ContentStore<T>
): ContentRepo<T> => store;
