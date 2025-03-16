import { Request, Response, json } from "express";
import { array, number, object, string, ValidationError } from "yup";
import { getDeviceData, updateDeviceData } from "../services/deviceStore";
import { updateDeviceLocation } from "../services/location";
import { getWiFiLocation } from "../services/maps";

const wifiNetworksSchema = array()
  .of(
    object({
      bssid: string().required(),
      rssi: number().required(),
      channel: number().required(),
    })
  )
  .required();

export const parseUpdateDevLocWiFi = json({ type: () => true });

export const handleUpdateDevLocWiFi = async (req: Request, res: Response) => {
  const deviceId = req.params.deviceId;

  try {
    const networks = await wifiNetworksSchema.validate(req.body, {
      strict: true,
    });
    console.log(JSON.stringify(networks));

    const deviceData = await getDeviceData(deviceId);
    const location = await getWiFiLocation(
      networks.map((network) => ({
        macAddress: network.bssid,
        signalStrength: network.rssi,
        channel: network.channel,
      }))
    );

    console.log(JSON.stringify(location));

    updateDeviceLocation(deviceData, location, "wifi");

    await updateDeviceData(deviceId, deviceData);

    // Don't send any body back, more data for dev to recv
    return res.status(200).send();
  } catch (error) {
    const statusCode = error instanceof ValidationError ? 400 : 500;
    console.error((error as Error).message);
    return res.apiError(statusCode, (error as Error).message);
  }
};
