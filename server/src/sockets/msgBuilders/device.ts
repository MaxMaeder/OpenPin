import { DeviceData, DeviceId, DeviceSettings } from "src/dbTypes";
import { io } from "..";
import { 
  DEV_CAPTURES_UPDATE,
  DEV_DATA_UPDATE,
  DEV_MESSAGES_UPDATE,
  DEV_NOTES_UPDATE,
  DEV_SETTINGS_UPDATE 
} from "../messageTypes";
import { getDevRID } from "../roomIDs";
import { DeviceNote } from "src/services/database/device/notes";
import { WithId } from "src/services/database/device/content";
import { DeviceMessage } from "src/services/database/device/messages";
import { DeviceCapture } from "src/services/database/device/captures";

export const sendDataUpdate = (
  id: DeviceId,
  data: Partial<DeviceData>
) => {
  if (!io) return;
  io.to(getDevRID(id)).emit(DEV_DATA_UPDATE, {
    id,
    ...data,
  });
};

export const sendSettingsUpdate = (
  id: DeviceId,
  settings: Partial<DeviceSettings>
) => {
  if (!io) return;
  io.to(getDevRID(id)).emit(DEV_SETTINGS_UPDATE, {
    id,
    ...settings,
  });
};

export const sendCapturesUpdate = (
  id: DeviceId,
  captures: WithId<DeviceCapture>[]
) => {
  if (!io) return;
  io.to(getDevRID(id)).emit(DEV_CAPTURES_UPDATE, {
    id,
    entries: captures,
  });
}

export const sendNotesUpdate = (
  id: DeviceId,
  notes: WithId<DeviceNote>[]
) => {
  if (!io) return;
  io.to(getDevRID(id)).emit(DEV_NOTES_UPDATE, {
    id,
    entries: notes,
  });
}

export const sendMessagesUpdate = (
  id: DeviceId,
  messages: WithId<DeviceMessage>[]
) => {
  if (!io) return;
  io.to(getDevRID(id)).emit(DEV_MESSAGES_UPDATE, {
    id,
    entries: messages,
  });
}
