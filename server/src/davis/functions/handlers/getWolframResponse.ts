import { object, string } from "yup";
import { FunctionHandlerError, FunctionHandlerReturnType } from "..";
import { getWolframResponse } from "../../../services/wolfram";

const payloadSchema = object({
  input: string().required(),
});

export const handleGetWolframResponse = async (
  payload: string
): FunctionHandlerReturnType => {
  let input: string;
  try {
    const parsedPayload = await payloadSchema.validate(JSON.parse(payload));
    input = parsedPayload.input;
  } catch {
    throw new FunctionHandlerError("Wolfram input is invalid.");
  }

  const returnValue = await getWolframResponse(input);

  return {
    returnValue,
    audioComponents: [],
  };
};
