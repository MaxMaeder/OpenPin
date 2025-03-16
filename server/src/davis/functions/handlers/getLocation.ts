import { FunctionHandlerReturnType } from "..";
import { DeviceData } from "../../../dbTypes";
import { getRevGeocoding } from "../../../services/maps";

export const handleGetLocation = async (
  payload: string,
  deviceId: string,
  deviceData: DeviceData
): FunctionHandlerReturnType => {
  const { address } = await getRevGeocoding(
    deviceData.latitude,
    deviceData.longitude
  );

  return {
    returnValue: JSON.stringify({
      address,
    }),
    audioComponents: [],
  };
};
