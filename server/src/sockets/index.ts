import { DEV_DATA_COL } from "../config";
import { DeviceSettings, UserId } from "../dbTypes";
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { getFirestore } from "firebase-admin/firestore";
import { handleDataReq } from "./client/dataReq";
import { handleDevSettingsUpdate } from "./client/devSettingsUpdate";
import { authUserSocket } from "../auth";
import { getUserDevices } from "../services/database/userData";

let io: Server | undefined;

export const setupSocket = (server: HttpServer) => {
  io = new Server(server, {
    path: "/dash-link/",
  });
  io.use(authUserSocket);

  io.on("connection", async (socket) => {
    try {
      const userId = socket.data.userId as UserId;

      // Fetch and join rooms for all devices owned by the user.
      const userDevices = await getUserDevices(userId);
      socket.join(userDevices);

      // Set up event listeners for this socket
      socket.on("client_data_req", handleDataReq(socket));
      socket.on("client_dev_settings_update", handleDevSettingsUpdate(socket));
    } catch (error) {
      console.error(error)
    }
  });

  // Listen for device data changes and emit updates only to the relevant device room.
  getFirestore()
    .collection(DEV_DATA_COL)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          if (!io) return;
          const deviceId = change.doc.id;
          
          // Emit only to the room corresponding to the updated device id.
          io.to(deviceId).emit("dev_data_update", {
            id: deviceId,
            ...change.doc.data(),
          });
        }
      });
    });
};

/*
Use when the backend changes a setting, as events are only dispatched to sockets
automatically when a client changes a setting.
This function now emits to the room for that device id so that only the appropriate user sockets receive the update.
*/
export const sendSettingsUpdate = (
  id: string,
  settings: Partial<DeviceSettings>
) => {
  if (!io) return;
  io.to(id).emit("dev_settings_update", {
    id,
    ...settings,
  });
};
