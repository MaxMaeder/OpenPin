import { json, Request, Response } from "express";
import createHttpError from "http-errors";
import { getDeviceData, updateDeviceData } from "src/services/database/device/data";
import { doesDeviceExist } from "src/services/database/device/list";
import * as yup from "yup";
import _ from "lodash";
import { getWiFiLocation, WiFiAccessPoint } from "src/services/maps";
import { shouldUpdateLocation } from "src/config/location";

const accessPointSchema = yup.object<WiFiAccessPoint>({
  macAddress: yup.string().required(),
  signalStrength: yup.number().required(),
  channel: yup.number().required(),
});

const reqSchema = yup.object({
  deviceId: yup.string().required(),
  wifiAccessPoints: yup.array().of(accessPointSchema).required(),
});

interface LatLng {
  lat: number;
  lng: number;
}

interface ResolvedLocation {
  location: LatLng;
  accuracy: number;
}

export const parseLocateDevice = json();

export const handleLocateDevice = async (req: Request, res: Response) => {
  try {
    await reqSchema.validate(req.body);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      throw createHttpError(400, err.message);
    }
    throw err;
  }

  const accessPoints = req.body.wifiAccessPoints;
  if (accessPoints.length == 0)
    throw createHttpError(400, "Can't find location, no access points.");

  const deviceId = req.body.deviceId;
  if (!(await doesDeviceExist(deviceId))) throw createHttpError(404, "Device does not exist");

  const deviceData = await getDeviceData(deviceId);
  deviceData.lastConnected = _.now();

  if (shouldUpdateLocation(deviceData)) {
    const location = await getWiFiLocation(accessPoints);

    deviceData.latitude = location.latitude;
    deviceData.longitude = location.longitude;
    deviceData.locationAccuracy = location.accuracy;
    deviceData.latestLocationUpdate = _.now();
  }

  await updateDeviceData(deviceId, deviceData);

  const resBody: ResolvedLocation = {
    location: {
      lat: deviceData.latitude,
      lng: deviceData.longitude,
    },
    accuracy: deviceData.locationAccuracy ?? 0,
  };

  res.status(200).send(resBody);
};
