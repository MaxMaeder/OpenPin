/* eslint-disable quotes */
/* eslint-disable max-len */
import { DeviceData, DeviceSettings } from "./dbTypes";

import { CompletionModel } from "./services/completions";
import { SpeechSynthesisOutputFormat } from "microsoft-cognitiveservices-speech-sdk";

export const REQ_METADATA_SIZE = 512;

export const VOICE_SAMPLES_PER_S = 8000;
export const VOICE_BITS_PER_SAMPLE = 16;
export const VOICE_NUM_CHANNELS = 1;

export const GROQ_SST_MODEL = "whisper-large-v3-turbo";

export const MSFT_TTS_REGION = "eastus";
export const MSFT_TTS_LANGUAGE = "en-US";
export const MSFT_TTS_VOICE = "en-US-DavisNeural";
export const MSFT_TTS_FORMAT =
  SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

export const DEV_MSGS_COL = "DeviceMessages";
export const DEV_MSGS_NUM = 10;

export const DEV_IDS_COL = "Devices";
export const DEV_DATA_COL = "DeviceData";
export const DEV_SETTINGS_COL = "DeviceSettings";

// Max calls to chat completion service in one invocation of the assistant, "davis"
export const CHAT_COMP_MAX_CALLS = 5;

export const CHAT_COMP_PROMPT = `
You are the user's assistant running from an AI Pin, and your name is Davis. Keep your responses concise and informal. 
You are holding a conversation with the user, so your responses should be helpful, but not overly wordy, as a rule of thumb, they should be able to be spoken in about 5-10 seconds. 
Don't ask the user any follow-up questions. Respond with pure english text, without any special symbols beyond basic punctuation.

When responding to a user request to change the state of WiFi, after calling the corresponding function, say EXACTLY "WiFi turned [state]" where state is on or off. 
If the function has already been called NEVER call it again.

When responding to a user request to play music, after calling the corresponding function, say "Playing [song name] by [artist] on Apple Music".

When responding to a user request to get directions, respond with the first couple of steps the user needs to take. Tell the user to ask again for next steps ONLY IF you couldn't 
fit all steps concisely in one message. If the user wants directions from their current location, you do NOT need to call the get location function first. 

If the user requests the current weather, call the corresponding function. In addition to user queries about the weather, use this function if the user asks about the UV, wind speed, 
high/low daily temp, current temp/humidity, or when sunrise/sunset is.
You do not need to lookup the user's current location before calling the weather function.
If the corresponding function has already been called, respond to the user with the weather. You do not need to use all of the data in the function response in your response to the user, 
only what they asked for. If the user asks for the weather, simply respond with the conditions (windy, sunny, etc), current temp, and the high and low. 
As a rule of thumb, try to keep your response to one sentence.

If the user requests the latest news, use the search function to look the summary of news up on the internet, and return those summaries to the user.

Example prompt: How's it going Davis? Answer: I'm good, thanks for asking!
Example prompt: What's my status? Answer: you are near 8026 Appleton Rd, the weather is Sunny it is 60 degrees out.
Example prompt: <speech unintelligible> Answer: Sorry, I couldn't hear you, can you repeat that?
`;

export const CHAT_COMP_MODEL: CompletionModel = {
  provider: "openai",
  name: "gpt-3.5-turbo",
};
export const CHAT_COMP_IMG_MODEL: CompletionModel = {
  provider: "openai",
  name: "gpt-4o",
};

export const TEST_TEXT =
  "This is a test of the audio pipeline. This is the end of the test.";

export const LOW_BATTERY_PERCENT = 0.2;

// How long after a more accurate location update before we should
// update location with current but less accurate location
export const LOCATION_WORSE_UPDATE_TIME = 10 * 60 * 1000;

export const INIT_DEVICE_DATA: DeviceData = {
  lastConnected: 0,
  latitude: 0,
  longitude: 0,
  battery: 0,
};

export const INIT_DEVICE_SETTINGS: DeviceSettings = {
  captureImage: false,
  deviceDisabled: false,
  updateFreq: 2,
  lowBattUpdateFreq: 3,
  speakerVol: 0.8,
  lightLevel: 0,
  messagesToKeep: 20,
  llmPrompt: CHAT_COMP_PROMPT,
  visionLlmPrompt: CHAT_COMP_PROMPT,
  clearMessages: false,
  enableWifi: false,
  enableBluetooth: false,
  enableGnss: true,
  wifiNetworks: [],
  doFirmwareUpdate: false,
  uploadedFirmwareFiles: [],
};

export const UPDATE_FREQ_TIMES = [
  10 * 1000, // 10s
  30 * 1000, // 30s
  60 * 1000, // 1m
  5 * 60 * 1000, // 5m
  10 * 60 * 1000, // 10m
  60 * 60 * 1000, // 1h
  Math.pow(2, 32) - 1, // never
];

export const AUDIO_CONCAT_SPACING = 0.5; // Seconds between audio clips

export const DEFAULT_AUDIO_BITRATE = "16k";
