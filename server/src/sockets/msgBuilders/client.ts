import { UserId } from "src/dbTypes";
import { CLIENT_DATA_REQ_DONE } from "../messageTypes";
import { getUserRID } from "../roomIDs";
import { sendToRoom } from "..";

export const sendDataReqDone = (
  id: UserId
) => sendToRoom(getUserRID(id), CLIENT_DATA_REQ_DONE, {});
