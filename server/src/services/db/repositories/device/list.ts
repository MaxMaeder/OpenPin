import { DeviceId } from ".";

export interface ListStore {
  create(deviceId: DeviceId): Promise<void>;
  exists(deviceId: DeviceId): Promise<boolean>;
}

export type ListRepo = ListStore; // no added helpers for now

export const composeListRepo = (s: ListStore): ListRepo => s;
