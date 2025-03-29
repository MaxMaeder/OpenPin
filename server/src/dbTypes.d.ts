import { FieldValue } from "firebase-admin/firestore";

export type DeviceMessages = {
  msgs: Message[];
};

export type Message = {
  role: "system" | "assistant" | "user";
  content: string;
};

export type UserId = string;
export type DeviceId = string;

export type UserData = {
  deviceIds: DeviceId[];
};

export type LocationSource = "gnss" | "wifi" | "cell" | "tower";

export type DeviceData = {
  latestImage?: string;
  latestImageCaptured?: number;
  lastConnected: number;
  latitude: number;
  longitude: number;
  latestLocationUpdate?: number;
  locationAccuracy?: number;
  locationSource?: LocationSource;
  battery: number;
};

export type WifiNetwork = {
  ssid: string;
  password?: string;
};

export type DeviceSettings = {
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
};

type FirestoreUpdate<T> = {
  [P in keyof T]?: T[P] | FieldValue;
};