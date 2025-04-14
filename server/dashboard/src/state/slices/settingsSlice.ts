import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";

import { RootState } from "../store";
import { languageModels } from "src/assets/languageModels";
import { translateLanguages } from "src/assets/languages";
import { assistantVoices } from "src/assets/voices";

export type LanguageModelKey = (typeof languageModels)[number]["value"];
export type TranslateLanguageKey = (typeof translateLanguages)[number]["value"];
export type AssistantVoiceKey = (typeof assistantVoices)[number]["value"];

export interface DeviceSettings {
  id: string;
  // General
  displayName?: string;
  deviceDisabled: boolean;
  // Assistant
  llmName: LanguageModelKey;
  visionLlmName: LanguageModelKey;
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

const initialSettings: Omit<DeviceSettings, "id"> = {
  // General
  deviceDisabled: false,
  // Assistant
  llmName: "gpt-4o-mini",
  visionLlmName: "gpt-4o-mini",
  llmPrompt: "",
  visionLlmPrompt: "",
  messagesToKeep: 20,
  clearMessages: false,
  // Translate
  myLanguage: "en-US",
  translateLanguage: "es-ES",
  translateVolumeBoost: 1.5,
  // Voice
  voiceName: "davis",
  voiceSpeed: 1.2,
};

export const settingsAdapter = createEntityAdapter<DeviceSettings>();

const initialState = settingsAdapter.getInitialState(initialSettings);

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    upsertSettingsById: settingsAdapter.upsertOne,
    updateSettingsById: settingsAdapter.updateOne,
  },
});

export const { upsertSettingsById, updateSettingsById } = settingsSlice.actions;

export const {
  selectIds: selectDeviceIds,
  selectById: selectSettingsById,
  selectEntities: selectAllSettings,
} = settingsAdapter.getSelectors((state: RootState) => state.settings);

export const selectDeviceNames = createSelector(
  selectAllSettings,
  (settings) => {
    return Object.keys(settings).reduce<Record<string, string>>((acc, id) => {
      acc[id] = settings[id].displayName || id;
      return acc;
    }, {});
  }
);

export default settingsSlice.reducer;
