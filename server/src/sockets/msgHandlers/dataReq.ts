import { Socket } from "socket.io";
import { sendFullDevDetails } from "../msgProducers/devDetails";
import { sendDataReqDone } from "../msgBuilders/client";
import { db, UserId } from "src/services/db";

export const handleDataReq = (socket: Socket) => async () => {
  const userId = socket.data.userId as UserId;

  for (const devId of await db.user.getDevices(userId)) {
    await sendFullDevDetails(devId);
  }
  sendDataReqDone(userId);
};
