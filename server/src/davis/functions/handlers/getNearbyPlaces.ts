import { object, string } from "yup";
import { FunctionHandlerError, FunctionHandlerReturnType } from "..";
import { getNearbyPlaces } from "../../../services/maps";
import { DavisToolContext } from "src/davis";

const payloadSchema = object({
  query: string().required(),
});

export const handleGetNearbyPlaces = async (
  payload: string,
  context: DavisToolContext
): FunctionHandlerReturnType => {
  let query: string;
  try {
    const parsedPayload = await payloadSchema.validate(JSON.parse(payload));
    query = parsedPayload.query;
  } catch {
    throw new FunctionHandlerError("No place search query provided.");
  }

  let { latitude, longitude } = context.data;
  const nearbyPlaces = await getNearbyPlaces(query, {
    latitude,
    longitude,
    radius: 1600,
  });

  return JSON.stringify(nearbyPlaces);
};
