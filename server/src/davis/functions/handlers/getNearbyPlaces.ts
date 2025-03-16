import { object, string } from "yup";
import { FunctionHandlerError, FunctionHandlerReturnType } from "..";
import { DeviceData } from "../../../dbTypes";
import { getNearbyPlaces } from "../../../services/maps";

const payloadSchema = object({
  query: string().required(),
});

export const handleGetNearbyPlaces = async (
  payload: string,
  deviceId: string,
  deviceData: DeviceData
): FunctionHandlerReturnType => {
  let query: string;
  try {
    const parsedPayload = await payloadSchema.validate(JSON.parse(payload));
    query = parsedPayload.query;
  } catch {
    throw new FunctionHandlerError("No place search query provided.");
  }

  const nearbyPlaces = await getNearbyPlaces(query, {
    latitude: deviceData.latitude,
    longitude: deviceData.longitude,
    radius: 1600,
  });

  return {
    returnValue: JSON.stringify(nearbyPlaces),
    audioComponents: [],
  };
};
