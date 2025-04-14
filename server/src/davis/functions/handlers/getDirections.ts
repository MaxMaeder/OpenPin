import { object, string } from "yup";
import { FunctionHandlerError, FunctionHandlerReturnType } from "..";
import { getDirections } from "../../../services/maps";
import { LatLng } from "@googlemaps/google-maps-services-js";
import { DavisToolContext } from "src/davis";

const payloadSchema = object({
  fromAddress: string(),
  toAddress: string().required(),
});

export const handleGetDirections = async (
  payload: string,
  context: DavisToolContext
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
    lat: context.data.latitude,
    lng: context.data.longitude,
  };

  const directions = await getDirections(
    fromAddress || currentLocation,
    toAddress
  );

  return JSON.stringify(directions);
};
