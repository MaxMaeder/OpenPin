/* eslint-disable quotes */
/* eslint-disable max-len */
import { SpeechSynthesisOutputFormat } from "microsoft-cognitiveservices-speech-sdk";
import { DeviceData, UserData } from "src/services/db";

export const REQ_METADATA_SIZE = 512;

export const VOICE_SAMPLES_PER_S = 8000;
export const VOICE_BITS_PER_SAMPLE = 16;
export const VOICE_NUM_CHANNELS = 1;

export const GROQ_SST_MODEL = "whisper-large-v3-turbo";

export const MSFT_TTS_REGION = "eastus";
export const MSFT_TTS_LANGUAGE = "en-US";
export const MSFT_TTS_VOICE = "en-US-DavisNeural";
export const MSFT_TTS_MULTILINGUAL_VOICE = "en-US-DavisMultilingualNeural";
export const MSFT_TTS_FORMAT = SpeechSynthesisOutputFormat.Ogg16Khz16BitMonoOpus;

export const DEV_MSGS_NUM = 10;

export const TEST_TEXT = "This is a test of the audio pipeline. This is the end of the test.";

export const LOW_BATTERY_PERCENT = 0.2;

// How long after a more accurate location update before we should
// update location with current but less accurate location
export const LOCATION_WORSE_UPDATE_TIME = 10 * 60 * 1000;

export const INIT_USER_DATA: UserData = {
  deviceIds: [],
};

export const INIT_DEVICE_DATA: DeviceData = {
  lastConnected: 0,
  latitude: 0,
  longitude: 0,
  battery: 0,
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
