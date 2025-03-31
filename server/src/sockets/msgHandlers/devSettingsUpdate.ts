import _ = require("lodash");

import { DeviceSettings, WifiNetwork } from "../../dbTypes";
import { ObjectSchema, array, boolean, number, object, string } from "yup";
import { UPDATE_FREQ_TIMES } from "../../config";
import { updateDeviceSettings } from "../../services/database/device/settings";
import { sendSettingsUpdate } from "../msgBuilders/device";
import { withAuthAndValidation } from "./common";

interface DeviceSettingsPayload extends Partial<DeviceSettings> {
  id: string;
}

const percentageSchema = number().min(0).max(1);

const updateFreqSchema = number()
  .integer()
  .min(0)
  .max(UPDATE_FREQ_TIMES.length - 1);

const wifiNetworkSchema: ObjectSchema<WifiNetwork> = object({
  ssid: string().max(32).required(),
  password: string().max(63),
});

const payloadSchema: ObjectSchema<DeviceSettingsPayload> = object({
  id: string().required(),
  // General
  displayName: string(),
  hologramId: string(),
  captureImage: boolean(),
  deviceDisabled: boolean(),
  updateFreq: updateFreqSchema,
  lowBattUpdateFreq: updateFreqSchema,
  speakerVol: percentageSchema,
  lightLevel: percentageSchema,
  // Conversation History
  messagesToKeep: number().integer().min(0).max(50),
  llmPrompt: string(),
  visionLlmPrompt: string(),
  clearMessages: boolean().isTrue(), // Can only clear, can't cancel
  userSmsNumber: string(),
  // Translate
  myLanguage: string(),
  translateLanguage: string(),
  // WiFi
  enableWifi: boolean(),
  enableBluetooth: boolean(),
  enableGnss: boolean(),
  wifiNetworks: array().of(wifiNetworkSchema).max(10),
  // Firmware
  doFirmwareUpdate: boolean(),
  firmwareUpdateFile: string(),
  uploadedFirmwareFiles: array().of(string().required()),
});

export const handleDevSettingsUpdate = withAuthAndValidation(
  payloadSchema,
  async (socket, payload) => {
    const deviceId = payload.id;

    const settings: Partial<DeviceSettings> = _.omit(payload, "id");
    await updateDeviceSettings(deviceId, settings);

    sendSettingsUpdate(deviceId, settings);
  });
