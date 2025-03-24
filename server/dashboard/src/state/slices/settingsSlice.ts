import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";

import { RootState } from "../store";

export interface WifiNetwork {
  ssid: string;
  password?: string;
}

export interface DeviceSettings {
  id: string;
  // General
  displayName?: string;
  hologramId?: string;
  captureImage: boolean;
  deviceDisabled: boolean;
  updateFreq: number;
  lowBattUpdateFreq: number;
  speakerVol: number;
  lightLevel: number;
  // Conversation History
  messagesToKeep: number;
  llmPrompt: string;
  visionLlmPrompt: string;
  clearMessages: boolean;
  userSmsNumber?: string;
  // Translate
  myLanguage: string;
  translateLanguage: string;
  // WiFi
  enableWifi: boolean;
  enableBluetooth: boolean;
  enableGnss: boolean;
  wifiNetworks: WifiNetwork[];
  // Firmware
  doFirmwareUpdate: boolean;
  // If we don't have null, cannot 'clear it out' on frontend after update
  firmwareUpdateFile?: string | null;
  uploadedFirmwareFiles: string[];
}

const initialSettings: Omit<DeviceSettings, "id"> = {
  captureImage: false,
  deviceDisabled: false,
  updateFreq: 2,
  lowBattUpdateFreq: 3,
  speakerVol: 0.8,
  lightLevel: 0,
  messagesToKeep: 20,
  llmPrompt: "",
  visionLlmPrompt: "",
  clearMessages: false,
  myLanguage: "en-US",
  translateLanguage: "es-ES",
  enableWifi: false,
  enableBluetooth: false,
  enableGnss: true,
  wifiNetworks: [],
  doFirmwareUpdate: false,
  uploadedFirmwareFiles: [],
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
