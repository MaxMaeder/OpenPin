import { Socket } from "socket.io";
import { getDeviceData } from "../../services/database/deviceData";
import { getDeviceSettings } from "../../services/database/deviceSettings";
import { UserId } from "../../dbTypes";
import { getUserDevices } from "../../services/database/userData";

export const handleDataReq = (socket: Socket) => async () => {
  const userId = socket.data.userId as UserId;

  for (const devId of await getUserDevices(userId)) {
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
