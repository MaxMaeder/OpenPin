import { date, object, ObjectSchema, string } from "yup";
import { sendCapturesUpdate, sendMsgsUpdate, sendNotesUpdate } from "../msgBuilders/device";
import { deleteDeviceCapture, getDeviceCaptures } from "src/services/olddb/device/captures";
import { withAuthAndValidation } from "./common";
import { deleteDeviceNote, getDeviceNotes } from "src/services/olddb/device/notes";
import { deleteDeviceMsg, getDeviceMsgs } from "src/services/olddb/device/messages";

interface MoreContentPayload {
  id: string;
  startAfter: Date;
}

interface DeleteContentPayload {
  id: string;
  entryId: string;
}

const moreContentSchema: ObjectSchema<MoreContentPayload> = object({
  id: string().required(),
  startAfter: date().required(),
});

const deleteContentSchema: ObjectSchema<DeleteContentPayload> = object({
  id: string().required(),
  entryId: string().required(),
});

export const handleMoreCapturesReq = withAuthAndValidation(
  moreContentSchema,
  async (_, payload) => {
    const captures = await getDeviceCaptures(payload.id, {
      startAfter: payload.startAfter,
      limit: 10,
    });
    sendCapturesUpdate(payload.id, captures);
  }
);

export const handleDeleteCaptureReq = withAuthAndValidation(
  deleteContentSchema,
  async (_, payload) => {
    await deleteDeviceCapture(payload.id, payload.entryId);
  }
);

export const handleMoreNotesReq = withAuthAndValidation(moreContentSchema, async (_, payload) => {
  const notes = await getDeviceNotes(payload.id, {
    startAfter: payload.startAfter,
    limit: 10,
  });
  sendNotesUpdate(payload.id, notes);
});

export const handleDeleteNoteReq = withAuthAndValidation(
  deleteContentSchema,
  async (_, payload) => {
    await deleteDeviceNote(payload.id, payload.entryId);
  }
);

export const handleMoreMsgsReq = withAuthAndValidation(moreContentSchema, async (_, payload) => {
  const messages = await getDeviceMsgs(payload.id, {
    startAfter: payload.startAfter,
    limit: 10,
  });
  sendMsgsUpdate(payload.id, messages);
});

export const handleDeleteMsgsReq = withAuthAndValidation(
  deleteContentSchema,
  async (_, payload) => {
    await deleteDeviceMsg(payload.id, payload.entryId);
  }
);
