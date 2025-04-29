import { UserId, DeviceId } from "src/services/db";
import { io } from "..";
import { getDevRID, getUserRID } from "../roomIDs";
import { sendFullDevDetails } from "./devDetails";

export const sendNewDevDetails = async (userId: UserId, deviceId: DeviceId) => {
  if (!io) return;

  // Get all sockets connected in this user room
  const sockets = await io.in(getUserRID(userId)).fetchSockets();

  // Add each socket to the new device's room
  sockets.forEach((socket) => {
    socket.join(getDevRID(deviceId));
  });

  // Send new device's data to its room
  await sendFullDevDetails(deviceId);
};
