import _ = require("lodash");

import { ObjectSchema, boolean, number, object, string } from "yup";
import { updateDeviceSettings } from "../../services/database/device/settings";
import { sendSettingsUpdate } from "../msgBuilders/device";
import { withAuthAndValidation } from "./common";
import { 
  ASSISTANT_VOICES,
  AssistantVoice,
  DeviceSettings,
  LANGUAGE_MODELS,
  LanguageModel,
  TRANSLATE_LANGUAGES,
  TranslateLanguage
} from "src/config/deviceSettings";

interface DeviceSettingsPayload extends Partial<DeviceSettings> {
  id: string;
}

const llmNameSchema = string().oneOf(LANGUAGE_MODELS.map(model => model.value) as LanguageModel[]);
const languageSchema = string().oneOf(TRANSLATE_LANGUAGES.map(model => model.value) as TranslateLanguage[]);
const voiceNameSchema = string().oneOf(ASSISTANT_VOICES.map(model => model.value) as AssistantVoice[]);

const payloadSchema: ObjectSchema<DeviceSettingsPayload> = object({
  id: string().required(),
  // General
  displayName: string(),
  deviceDisabled: boolean(),
  // Assistant
  messagesToKeep: number().integer().min(0).max(50),
  llmName: llmNameSchema,
  visionLlmName: llmNameSchema,
  llmPrompt: string(),
  visionLlmPrompt: string(),
  clearMessages: boolean().isTrue(), // Can only clear, can't cancel
  // Translate
  myLanguage: languageSchema,
  translateLanguage: languageSchema,
  translateVolumeBoost: number().min(1).max(2),
  // Voice
  voiceName: voiceNameSchema,
  voiceSpeed: number().min(0.5).max(1.5)
});

export const handleDevSettingsUpdate = withAuthAndValidation(
  payloadSchema,
  async (socket, payload) => {
    const deviceId = payload.id;

    const settings: Partial<DeviceSettings> = _.omit(payload, "id");
    await updateDeviceSettings(deviceId, settings);

    sendSettingsUpdate(deviceId, settings);
  });
