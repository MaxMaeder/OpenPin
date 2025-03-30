import { DeviceId } from "src/dbTypes";
import { getDeviceData } from "src/services/database/device/data";
import { getDeviceSettings } from "src/services/database/device/settings";
import { 
  sendCapturesUpdate,
  sendDataUpdate,
  sendMessagesUpdate,
  sendNotesUpdate,
  sendSettingsUpdate
} from "../msgBuilders/device";
import { getDeviceCaptures } from "src/services/database/device/captures";
import { getDeviceNotes } from "src/services/database/device/notes";
import { getDeviceMsgs } from "src/services/database/device/messages";

export const sendFullDevDetails = async (deviceId: DeviceId) => {
  sendDataUpdate(deviceId, await getDeviceData(deviceId));
  sendSettingsUpdate(deviceId, await getDeviceSettings(deviceId));

  sendCapturesUpdate(deviceId, (await getDeviceCaptures(deviceId)).entries);
  sendNotesUpdate(deviceId, (await getDeviceNotes(deviceId)).entries);
  sendMessagesUpdate(deviceId, (await getDeviceMsgs(deviceId)).entries);
}