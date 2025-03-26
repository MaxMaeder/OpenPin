import { DEV_DATA_COL } from "../config";
import { DeviceSettings } from "../dbTypes";
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { getFirestore } from "firebase-admin/firestore";
import { handleDataReq } from "./client/dataReq";
import { handleDevSettingsUpdate } from "./client/devSettingsUpdate";
import { authUserSocket } from "../auth";

let io: Server | undefined;

export const setupSocket = (server: HttpServer) => {
  io = new Server(server, {
    path: "/dash-link/",
  });
  io.use(authUserSocket);

  io.on("connection", (socket) => {
    // Called when new clients request all device data and settings
    // to 'get up to speed'
    socket.on("client_data_req", handleDataReq(socket));

    // Called when client updates device settings
    socket.on("client_dev_settings_update", handleDevSettingsUpdate(socket));
  });

  // Called when device data updated in DB, sent to clients
  getFirestore()
    .collection(DEV_DATA_COL)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          if (!io) return;
          io.emit("dev_data_update", {
            id: change.doc.id,
            ...change.doc.data(),
          });
        }
      });
    });
};

/*
Use when the backend changes a setting, as events are only dispatched to sockets
automatically when a client changes a setting
*/
export const sendSettingsUpdate = (
  id: string,
  settings: Partial<DeviceSettings>
) => {
  if (!io) return;

  io.emit("dev_settings_update", {
    id,
    ...settings,
  });
};
