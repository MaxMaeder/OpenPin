import { DavisToolContext } from "src/davis";
import { FunctionHandlerReturnType } from "..";
import { getRevGeocoding } from "../../../services/maps";

export const handleGetLocation = async (
  _: string,
  context: DavisToolContext
): FunctionHandlerReturnType => {
  let { latitude, longitude } = context.data;
  const { address } = await getRevGeocoding(latitude, longitude);

  return JSON.stringify({
    address,
  });
};
