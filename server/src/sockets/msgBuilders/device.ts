import { DeviceData, DeviceId } from "src/dbTypes";
import { sendToRoom } from "..";
import {
  DEV_CAPTURES_UPDATE,
  DEV_DATA_UPDATE,
  DEV_MSGS_UPDATE,
  DEV_NOTES_UPDATE,
  DEV_SETTINGS_UPDATE,
} from "../messageTypes";
import { getDevRID } from "../roomIDs";
import { DeviceNote } from "src/services/database/device/notes";
import { PaginatedResult } from "src/services/database/device/content";
import { DeviceMessage } from "src/services/database/device/messages";
import { DeviceCapture } from "src/services/database/device/captures";
import { DeviceSettings } from "src/config/deviceSettings";

export const sendDataUpdate = (id: DeviceId, data: Partial<DeviceData>) =>
  sendToRoom(getDevRID(id), DEV_DATA_UPDATE, {
    id,
    ...data,
  });

export const sendSettingsUpdate = (
  id: DeviceId,
  settings: Partial<DeviceSettings>,
  excludeSIDs: string[] = []
) =>
  sendToRoom(
    getDevRID(id),
    DEV_SETTINGS_UPDATE,
    {
      id,
      ...settings,
    },
    excludeSIDs
  );

export const sendCapturesUpdate = (id: DeviceId, captures: PaginatedResult<DeviceCapture>) =>
  sendToRoom(getDevRID(id), DEV_CAPTURES_UPDATE, {
    id,
    entries: captures.entries,
    nextStartAfter: captures.nextStartAfter,
  });

export const sendNotesUpdate = (id: DeviceId, notes: PaginatedResult<DeviceNote>) =>
  sendToRoom(getDevRID(id), DEV_NOTES_UPDATE, {
    id,
    entries: notes.entries,
    nextStartAfter: notes.nextStartAfter,
  });

export const sendMsgsUpdate = (id: DeviceId, messages: PaginatedResult<DeviceMessage>) =>
  sendToRoom(getDevRID(id), DEV_MSGS_UPDATE, {
    id,
    entries: messages.entries,
    nextStartAfter: messages.nextStartAfter,
  });
