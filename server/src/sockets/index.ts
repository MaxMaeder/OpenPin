import { UserId } from "../dbTypes";
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { handleDataReq } from "./msgHandlers/dataReq";
import { handleDevSettingsUpdate } from "./msgHandlers/devSettingsUpdate";
import { authUserSocket } from "../auth";
import { getUserDevices } from "src/services/database/userData";
import { startDevDataUpdates } from "./msgProducers/devDataUpdates";
import { CLIENT_DATA_REQ } from "./messageTypes";
import { getDevRID, getUserRID } from "./roomIDs";

export let io: Server | undefined;

export const setupSocket = (server: HttpServer) => {
  io = new Server(server, {
    path: "/dash-link/",
  });
  io.use(authUserSocket);

  io.on("connection", (socket) => {
    try {
      socket.on(CLIENT_DATA_REQ, handleDataReq(socket));
      socket.on("client_dev_settings_update", handleDevSettingsUpdate(socket));

      const userId = socket.data.userId as UserId;
      joinRooms(socket, userId);
    } catch (error) {
      console.error("Error while setting up socket connection", error)
    }
  });

  startDevDataUpdates();
};

const joinRooms = async (socket: Socket, userId: UserId) => {
  try {
    const userDevices = await getUserDevices(userId);

    // Each socket joins a room for the signed-in user
    // + a room per device that user owns
    socket.join(getUserRID(userId))
    socket.join(userDevices.map(getDevRID));
  } catch (err) {
    console.error("Error while adding socket to rooms", err);
  }
}