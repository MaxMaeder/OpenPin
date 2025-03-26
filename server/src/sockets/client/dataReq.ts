import {
  getDeviceData,
  getDeviceIds,
  getDeviceSettings,
} from "../../services/deviceStore";

import { Socket } from "socket.io";

export const handleDataReq = (socket: Socket) => async () => {
  console.log("HERE 1");
  for (const devId of await getDeviceIds()) {
    socket.emit("dev_data_update", {
      id: devId,
      ...(await getDeviceData(devId)),
    });

    socket.emit("dev_settings_update", {
      id: devId,
      ...(await getDeviceSettings(devId)),
    });
  }
};
