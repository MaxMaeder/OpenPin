import _ = require("lodash");

import { DeviceSettings, UserId, WifiNetwork } from "../../dbTypes";
import { ObjectSchema, array, boolean, number, object, string } from "yup";

import { Socket } from "socket.io";
import { UPDATE_FREQ_TIMES } from "../../config";
import { doesUserHaveDevice } from "../../services/database/userData";
import { updateDeviceSettings } from "../../services/database/deviceSettings";

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

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export const handleDevSettingsUpdate =
  (socket: Socket) => async (payload: DeviceSettingsPayload) => {
    const userId = socket.data.userId as UserId;
    
    await payloadSchema.validate(payload, { strict: true });
    const deviceId = payload.id;
    
    if (!(await doesUserHaveDevice(userId, deviceId))) {
      throw new NotFoundError("Device does not exist");
    }

    const settings: Partial<DeviceSettings> = _.omit(payload, "id");
    updateDeviceSettings(deviceId, settings);

    socket.to(deviceId).emit("dev_settings_update", {
      id: deviceId,
      ...settings,
    });
  };
