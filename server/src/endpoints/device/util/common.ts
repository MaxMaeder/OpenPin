import _ = require("lodash");

import { DeviceData, DeviceSettings } from "src/dbTypes";
import { LOW_BATTERY_PERCENT, UPDATE_FREQ_TIMES } from "src/config";
import {
  getDeviceData,
  updateDeviceData,
} from "src/services/database/device/data";
import { getCellTowerLocation } from "src/services/towerLocation";

import { ParsedAssistantRequest } from "./parser";
import { clearDeviceMsgs } from "src/services/database/device/messages";
import genFileName from "src/util/genFileName";
import { getStorage } from "firebase-admin/storage";
import { updateDeviceLocation } from "src/services/location";
import { getDeviceSettings, updateDeviceSettings } from "src/services/database/device/settings";
import { doesUserHaveDevice } from "src/services/database/userData";
import { sendSettingsUpdate } from "src/sockets/msgBuilders/device";

const UINT32_MAX = Math.pow(2, 32) - 1;

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

  if (!doesUserHaveDevice(req.userId, deviceId))
    throw new Error("Device does not exist");

  const deviceSettings = await getDeviceSettings(deviceId);
  const deviceData = await getDeviceData(deviceId);

  deviceData.lastConnected = _.now();

  if (req.metadata.didWifiDisconnect) {
    sendSettingsUpdate(deviceId, {
      enableWifi: false,
    });
    deviceSettings.enableWifi = false;
  }

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
  } else {
    const { hologramId } = deviceSettings;
    if (hologramId) {
      try {
        updateDeviceLocation(
          deviceData,
          await getCellTowerLocation(hologramId),
          "tower"
        );
      } catch (error) {
        // It's ok to ignore error; Hologram just doesn't have location
        console.log(error);
      }
    }
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

const isDevLowBatt = (data: DeviceData) => data.battery < LOW_BATTERY_PERCENT;

const getNextDevUpdate = (
  isLowPower: boolean,
  settings: DeviceSettings
): number => {
  const updateFreq = isLowPower
    ? settings.lowBattUpdateFreq
    : settings.updateFreq;

  return Math.min(UPDATE_FREQ_TIMES[updateFreq], UINT32_MAX);
};

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
  const isLowBatt = isDevLowBatt(deviceData);

  const resData = {
    nextUpdate: getNextDevUpdate(isLowBatt, deviceSettings),
    disabled: deviceSettings.deviceDisabled,
    doUpdate: deviceSettings.doFirmwareUpdate,
    takePic: deviceSettings.captureImage,
    wifi: deviceSettings.enableWifi,
    bt: deviceSettings.enableBluetooth,
    gnss: deviceSettings.enableGnss,
    spkVol: deviceSettings.speakerVol,
    lLevel: deviceSettings.lightLevel,
  };

  if (deviceSettings.captureImage) {
    deviceSettings.captureImage = false;
    sendSettingsUpdate(deviceId, {
      captureImage: false,
    });
  }

  updateDeviceData(deviceId, deviceData);
  updateDeviceSettings(deviceId, deviceSettings);

  return formatDevRes(resData);
};
