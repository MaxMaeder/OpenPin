import { Socket } from "socket.io";
import { UserId } from "../../dbTypes";
import { getUserDevices } from "../../services/database/userData";
import { sendFullDevDetails } from "../msgProducers/devDetails";
import { sendDataReqDone } from "../msgBuilders/client";

export const handleDataReq = (socket: Socket) => async () => {
  const userId = socket.data.userId as UserId;

  for (const devId of await getUserDevices(userId)) {
    await sendFullDevDetails(devId);
  }
  sendDataReqDone(userId);
};
