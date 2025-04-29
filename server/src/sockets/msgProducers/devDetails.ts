import { db, DeviceId } from "src/services/db";
import {
  sendCapturesUpdate,
  sendDataUpdate,
  sendMsgsUpdate,
  sendNotesUpdate,
  sendSettingsUpdate,
} from "../msgBuilders/device";

export const sendFullDevDetails = async (deviceId: DeviceId) => {
  sendDataUpdate(deviceId, await db.device.data.get(deviceId));
  sendSettingsUpdate(deviceId, await db.device.settings.get(deviceId));

  sendCapturesUpdate(deviceId, await db.device.captures.list(deviceId));
  sendNotesUpdate(deviceId, await db.device.notes.list(deviceId));
  sendMsgsUpdate(deviceId, await db.device.msgs.list(deviceId));
};
