import { DeviceId, UserId } from "src/dbTypes";

export const getUserRID = (userId: UserId) => `user:${userId}`;
export const getDevRID = (devId: DeviceId) => `device:${devId}`;
