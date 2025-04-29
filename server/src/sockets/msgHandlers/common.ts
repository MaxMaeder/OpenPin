import { Socket } from "socket.io";
import { AnyObject, ObjectSchema } from "yup";
import { NotFoundError } from "../errors";
import { db } from "src/services/db";

type AuthenticatedHandler<T> = (socket: Socket, payload: T) => Promise<void>;

export const withAuthAndValidation = <T extends AnyObject>(
  schema: ObjectSchema<T>,
  handler: AuthenticatedHandler<T>
) => {
  return (socket: Socket) => async (payload: unknown) => {
    const userId = socket.data.userId as string;

    let validatedPayload = (await schema.validate(payload, { strict: true })) as T;

    const hasAccess = await db.user.hasDevice(userId, validatedPayload.id);
    if (!hasAccess) {
      throw new NotFoundError("Device does not exist");
    }

    await handler(socket, validatedPayload);
  };
};
