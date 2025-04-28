import { object, string, ValidationError } from "yup";
import { FunctionHandlerError, FunctionHandlerReturnType } from "..";
import { DavisToolContext } from "src/davis";
import {
  addDeviceNote,
  DeviceNote,
  DeviceNoteDraft,
  updateDeviceNote,
} from "src/services/olddb/device/notes";
import _ from "lodash";
import { WithId } from "src/services/olddb/device/content";
import { sendNotesUpdate } from "src/sockets/msgBuilders/device";

export const getNoteSlug = (note: DeviceNote) =>
  note.title
    .toLowerCase() // convert to lowercase
    .trim() // remove leading/trailing whitespace
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric characters (excluding space and hyphen)
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens

const payloadSchema = object({
  slug: string(),
  title: string().when("slug", {
    is: (val: string | undefined) => !val, // if slug is not present
    then: (schema) => schema.required("Title is required if no slug provided"),
    otherwise: (schema) => schema,
  }),
  content: string().required(),
});

export const handleUpsertNote = async (
  payload: string,
  context: DavisToolContext
): FunctionHandlerReturnType => {
  let slug: string | undefined;
  let title: string | undefined;
  let content: string;

  try {
    const parsedPayload = await payloadSchema.validate(JSON.parse(payload));
    slug = parsedPayload.slug;
    title = parsedPayload.title;
    content = parsedPayload.content;
  } catch (e) {
    if (e instanceof ValidationError) {
      throw new FunctionHandlerError(e.message);
    }

    throw new FunctionHandlerError("Payload invalid.");
  }

  const findNoteFromSlug = (slug: string): WithId<DeviceNote> => {
    const note = context.notes.find((n) => getNoteSlug(n) == slug);
    if (!note) throw new FunctionHandlerError("Note not found for slug.");
    return note;
  };

  if (slug) {
    const storedNote = findNoteFromSlug(slug);
    storedNote.content = content;
    if (title) storedNote.title = title;

    const noteUpdate = _.pick(storedNote, ["title", "content"]);

    const note = await updateDeviceNote(context.id, storedNote.id, noteUpdate);
    if (!note) {
      throw new FunctionHandlerError("Failed to find note to update in DB.");
    }

    sendNotesUpdate(context.id, {
      entries: [note],
    });

    return `Note '${note.title}' updated.`;
  } else {
    const noteDraft: DeviceNoteDraft = {
      title: title!, // We know title will be here if no slug
      content,
    };
    const note = await addDeviceNote(context.id, noteDraft);

    sendNotesUpdate(context.id, {
      entries: [note],
    });

    return `Note '${note.title}' created.`;
  }
};
