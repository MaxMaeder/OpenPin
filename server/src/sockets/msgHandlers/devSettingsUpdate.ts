import _ = require("lodash");

import { ObjectSchema, boolean, number, object, string } from "yup";
import { updateDeviceSettings } from "../../services/database/device/settings";
import { sendSettingsUpdate } from "../msgBuilders/device";
import { withAuthAndValidation } from "./common";
import { ASSISTANT_VOICES, AssistantVoice, DeviceSettings, LANGUAGE_MODELS, LanguageModel, TRANSLATE_LANGUAGES, TranslateLanguage } from "src/config/deviceSettings";

interface DeviceSettingsPayload extends Partial<DeviceSettings> {
  id: string;
}

const payloadSchema: ObjectSchema<DeviceSettingsPayload> = object({
  id: string().required(),
  // General
  displayName: string(),
  deviceDisabled: boolean(),
  // Assistant
  messagesToKeep: number().integer().min(0).max(50),
  llmName: string().oneOf(Object.keys(LANGUAGE_MODELS) as LanguageModel[]),
  visionLlmName: string().oneOf(Object.keys(LANGUAGE_MODELS) as LanguageModel[]),
  llmPrompt: string(),
  visionLlmPrompt: string(),
  clearMessages: boolean().isTrue(), // Can only clear, can't cancel
  // Translate
  myLanguage: string().oneOf(Object.keys(TRANSLATE_LANGUAGES) as TranslateLanguage[]),
  translateLanguage: string().oneOf(Object.keys(TRANSLATE_LANGUAGES) as TranslateLanguage[]),
  translateVolumeBoost: number().min(1).max(2),
  // Voice
  voiceName: string().oneOf(Object.keys(ASSISTANT_VOICES) as AssistantVoice[]),
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
