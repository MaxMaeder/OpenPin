import { DeviceId, UserId } from "src/services/db";

export const getUserRID = (userId: UserId) => `user:${userId}`;
export const getDevRID = (devId: DeviceId) => `device:${devId}`;
