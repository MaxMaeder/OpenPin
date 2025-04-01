import { Socket } from "socket.io";
import { doesUserHaveDevice } from "src/services/database/userData";
import { AnyObject, ObjectSchema } from "yup";
import { NotFoundError } from "../errors";

type AuthenticatedHandler<T> = (
  socket: Socket,
  payload: T
) => Promise<void>;

export const withAuthAndValidation = <T extends AnyObject>(
  schema: ObjectSchema<T>,
  handler: AuthenticatedHandler<T>
) => {
  return (socket: Socket) => async (payload: unknown) => {
    const userId = socket.data.userId as string;

    let validatedPayload = await schema.validate(payload, { strict: true }) as T;

    const hasAccess = await doesUserHaveDevice(userId, validatedPayload.id);
    if (!hasAccess) {
      throw new NotFoundError("Device does not exist");
    }

    await handler(socket, validatedPayload);
  };
};