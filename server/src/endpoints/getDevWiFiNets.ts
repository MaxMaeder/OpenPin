import { Request, Response } from "express";
import { doesDevExist, getDeviceSettings } from "../services/deviceStore";

export const handleGetDevWiFiNets = async (req: Request, res: Response) => {
  const deviceId = req.params.deviceId;

  if (!(await doesDevExist(deviceId))) {
    return res.apiError(404, "Device does not exist.");
  }

  const deviceSettings = await getDeviceSettings(deviceId);

  res.status(200).send(deviceSettings.wifiNetworks);
};
