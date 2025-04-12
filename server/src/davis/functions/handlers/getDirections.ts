import { object, string } from "yup";
import { FunctionHandlerError, FunctionHandlerReturnType } from "..";
import { DeviceData } from "../../../dbTypes";
import { getDirections } from "../../../services/maps";
import { LatLng } from "@googlemaps/google-maps-services-js";

const payloadSchema = object({
  fromAddress: string(),
  toAddress: string().required(),
});

export const handleGetDirections = async (
  payload: string,
  deviceId: string,
  deviceData: DeviceData
): FunctionHandlerReturnType => {
  let fromAddress: string | undefined;
  let toAddress: string;
  try {
    const parsedPayload = await payloadSchema.validate(JSON.parse(payload));
    fromAddress = parsedPayload.fromAddress;
    toAddress = parsedPayload.toAddress;
  } catch {
    throw new FunctionHandlerError("No place search query provided.");
  }

  const currentLocation: LatLng = {
    lat: deviceData.latitude,
    lng: deviceData.longitude,
  };

  const directions = await getDirections(
    fromAddress || currentLocation,
    toAddress
  );

  return JSON.stringify(directions);
};
