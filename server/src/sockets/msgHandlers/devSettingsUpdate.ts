import _ = require("lodash");

import { ObjectSchema, boolean, number, object, string } from "yup";
import { updateDeviceSettings } from "../../services/database/device/settings";
import { sendSettingsUpdate } from "../msgBuilders/device";
import { withAuthAndValidation } from "./common";
import {
  ASSISTANT_VOICES,
  AssistantVoiceKey,
  DeviceSettings,
  getModelsForInterface,
  TextModelKey,
  TRANSLATE_LANGUAGES,
  TranslateLanguageKey,
  VisionModelKey,
} from "src/config/deviceSettings";

interface DeviceSettingsPayload extends Partial<DeviceSettings> {
  id: string;
}

const textModelSchema = string().oneOf(
  getModelsForInterface({ supportText: true }) as TextModelKey[]
);
const visionModelSchema = string().oneOf(
  getModelsForInterface({ supportVision: true }) as VisionModelKey[]
);

const languageSchema = string().oneOf(
  TRANSLATE_LANGUAGES.map((model) => model.value) as TranslateLanguageKey[]
);
const voiceNameSchema = string().oneOf(
  ASSISTANT_VOICES.map((model) => model.value) as AssistantVoiceKey[]
);

const payloadSchema: ObjectSchema<DeviceSettingsPayload> = object({
  id: string().required(),
  // General
  displayName: string(),
  deviceDisabled: boolean(),
  // Assistant
  messagesToKeep: number().integer().min(0).max(50),
  llmName: textModelSchema,
  visionLlmName: visionModelSchema,
  llmPrompt: string(),
  visionLlmPrompt: string(),
  clearMessages: boolean().isTrue(), // Can only clear, can't cancel
  // Translate
  myLanguage: languageSchema,
  translateLanguage: languageSchema,
  translateVolumeBoost: number().min(1).max(3),
  // Voice
  voiceName: voiceNameSchema,
  voiceSpeed: number().min(0.5).max(1.5),
});

export const handleDevSettingsUpdate = withAuthAndValidation(
  payloadSchema,
  async (socket, payload) => {
    const deviceId = payload.id;

    const settings: Partial<DeviceSettings> = _.omit(payload, "id");
    await updateDeviceSettings(deviceId, settings);

    sendSettingsUpdate(deviceId, settings, [socket.id]);
  }
);
