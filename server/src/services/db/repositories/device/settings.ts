import {
  AssistantVoiceKey,
  TextModelKey,
  TranslateLanguageKey,
  VisionModelKey,
} from "src/config/deviceSettings";
import { DeviceId } from ".";

export interface DeviceSettings {
  // General
  displayName?: string;
  deviceDisabled: boolean;
  // Assistant
  llmName: TextModelKey;
  visionLlmName: VisionModelKey;
  llmPrompt: string;
  visionLlmPrompt: string;
  messagesToKeep: number;
  clearMessages: boolean;
  // Translate
  myLanguage: TranslateLanguageKey;
  translateLanguage: TranslateLanguageKey;
  translateVolumeBoost: number;
  // Voice
  voiceName: AssistantVoiceKey;
  voiceSpeed: number;
}

export interface SettingsStore {
  get(deviceId: DeviceId): Promise<DeviceSettings>;
  update(deviceId: DeviceId, patch: Partial<DeviceSettings>): Promise<void>;
}

export type SettingsRepo = SettingsStore; // no added helpers for now

export const composeSettingsRepo = (s: SettingsStore): SettingsRepo => s;
