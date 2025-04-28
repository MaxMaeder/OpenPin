import { DeviceId, UserData } from "src/dbTypes";

export interface UserRepo {
  get(uid: string): Promise<UserData>;
  update(uid: string, patch: Partial<UserData>): Promise<void>;
  addDevice(uid: string, deviceId: DeviceId): Promise<void>;
  hasDevice(uid: string, deviceId: DeviceId): Promise<boolean>;
}
