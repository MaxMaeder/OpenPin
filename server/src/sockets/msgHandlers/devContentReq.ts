import { date, object, ObjectSchema, string } from "yup";
import { sendCapturesUpdate, sendMsgsUpdate, sendNotesUpdate } from "../msgBuilders/device";
import { withAuthAndValidation } from "./common";
import { db } from "src/services/db";

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
    const captures = await db.device.captures.list(payload.id, {
      startAfter: payload.startAfter,
      limit: 10,
    });
    sendCapturesUpdate(payload.id, captures);
  }
);

export const handleDeleteCaptureReq = withAuthAndValidation(
  deleteContentSchema,
  async (_, payload) => {
    await db.device.captures.remove(payload.id, payload.entryId);
  }
);

export const handleMoreNotesReq = withAuthAndValidation(moreContentSchema, async (_, payload) => {
  const notes = await db.device.notes.list(payload.id, {
    startAfter: payload.startAfter,
    limit: 10,
  });
  sendNotesUpdate(payload.id, notes);
});

export const handleDeleteNoteReq = withAuthAndValidation(
  deleteContentSchema,
  async (_, payload) => {
    await db.device.notes.remove(payload.id, payload.entryId);
  }
);

export const handleMoreMsgsReq = withAuthAndValidation(moreContentSchema, async (_, payload) => {
  const messages = await db.device.msgs.list(payload.id, {
    startAfter: payload.startAfter,
    limit: 10,
  });
  sendMsgsUpdate(payload.id, messages);
});

export const handleDeleteMsgsReq = withAuthAndValidation(
  deleteContentSchema,
  async (_, payload) => {
    await db.device.msgs.remove(payload.id, payload.entryId);
  }
);
