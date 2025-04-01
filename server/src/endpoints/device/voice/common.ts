import _ = require("lodash");

import { DeviceData } from "src/dbTypes";
import { LOW_BATTERY_PERCENT } from "src/config";
import {
  getDeviceData,
  updateDeviceData,
} from "src/services/database/device/data";

import { ParsedAssistantRequest } from "./parser";
import { clearDeviceMsgs } from "src/services/database/device/messages";
import genFileName from "src/util/genFileName";
import { getStorage } from "firebase-admin/storage";
import { updateDeviceLocation } from "src/services/location";
import { getDeviceSettings, updateDeviceSettings } from "src/services/database/device/settings";
import { sendSettingsUpdate } from "src/sockets/msgBuilders/device";
import { doesDeviceExist } from "src/services/database/device/list";
import createHttpError = require("http-errors");
import { DeviceSettings } from "src/config/deviceSettings";

// Update DB, etc. with data from request
// Call genCommonDevRes() to actually write changes to DB
// (both functions work together)
export const handleCommonDevData = async (
  req: ParsedAssistantRequest,
  deviceId: string
): Promise<{
  deviceData: DeviceData;
  deviceSettings: DeviceSettings;
}> => {
  const bucket = getStorage().bucket();

  if (!(await doesDeviceExist(deviceId)))
    throw createHttpError(404, "Device does not exist");

  const deviceSettings = await getDeviceSettings(deviceId);
  const deviceData = await getDeviceData(deviceId);

  deviceData.lastConnected = _.now();

  if (req.imageBuffer) {
    const imageName = genFileName(deviceId, "jpeg");
    const imageFileStream = bucket.file(imageName).createWriteStream();

    imageFileStream.write(req.imageBuffer);
    imageFileStream.end();

    deviceData.latestImage = imageName;
    deviceData.latestImageCaptured = _.now();
  }

  _.assign(
    deviceData,
    _.pick(req.metadata, ["latitude", "longitude", "battery"])
  );

  if (req.metadata.latitude && req.metadata.longitude) {
    updateDeviceLocation(
      deviceData,
      {
        latitude: req.metadata.latitude,
        longitude: req.metadata.longitude,
        accuracy: 0, // Todo: need from backend
      },
      "gnss"
    );
  }

  if (deviceSettings.clearMessages) {
    await clearDeviceMsgs(deviceId);
    sendSettingsUpdate(deviceId, {
      clearMessages: false,
    });
    deviceSettings.clearMessages = false;
  }

  return { deviceData, deviceSettings };
};

export const isDevLowBatt = (data: DeviceData) => data.battery < LOW_BATTERY_PERCENT;

const formatDevRes = (json: Record<string, unknown>) => {
  // Step 1: Stringify the JSON object
  const jsonString = JSON.stringify(json);

  // Step 2: Convert the string to a buffer, include space for null terminator
  const stringBuffer = Buffer.from(jsonString, "utf-8");
  const withNullTerminator = Buffer.concat([stringBuffer, Buffer.from([0])]);

  if (withNullTerminator.length > 512) {
    throw new Error("Device response exceeds the 512 byte limit.");
  }

  // Step 3: Create a Uint8Array of 512 bytes
  const paddedArray = new Uint8Array(512);

  // Step 4: Copy the JSON with null terminator into the padded array
  paddedArray.set(withNullTerminator);

  return paddedArray;
};

export const genCommonDevRes = async (
  deviceId: string,
  deviceData: DeviceData,
  deviceSettings: DeviceSettings
): Promise<Uint8Array> => {
  const resData = {
    disabled: deviceSettings.deviceDisabled,
  };

  updateDeviceData(deviceId, deviceData);
  updateDeviceSettings(deviceId, deviceSettings);

  return formatDevRes(resData);
};
