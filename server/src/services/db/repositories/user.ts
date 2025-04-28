import { DeviceId } from "src/dbTypes";

export type UserId = string;
export type UserData = {
  deviceIds: DeviceId[];
};

export interface UserStore {
  get(uid: string): Promise<UserData>;
  update(uid: string, patch: Partial<UserData>): Promise<void>;
}

export interface UserRepo extends UserStore {
  addDevice(uid: string, deviceId: DeviceId): Promise<void>;
  getDevices(uid: string): Promise<DeviceId[]>;
  hasDevice(uid: string, deviceId: DeviceId): Promise<boolean>;
}

export const composeUserRepo = (store: UserStore): UserRepo => {
  return {
    ...store,

    getDevices: async (uid) => {
      return (await store.get(uid)).deviceIds;
    },

    hasDevice: async (uid, deviceId) => {
      return (await store.get(uid)).deviceIds.includes(deviceId);
    },

    addDevice: async (uid, deviceId) => {
      const data = await store.get(uid);
      if (!data.deviceIds.includes(deviceId)) {
        const updated = { deviceIds: [...data.deviceIds, deviceId] };
        await store.update(uid, updated);
      }
    },
  };
};
