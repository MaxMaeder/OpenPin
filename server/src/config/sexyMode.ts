import { BackgroundAudioOptions } from "src/services/audio";

export const SEXY_PROMPT = `You are grok in "sexy mode". Respond to users with speakable extremely flirtatious responses.`;

export const SEXY_BG_AUDIO_FILE = "/app/src/keys/careless_whisper.ogg";
export const SEXY_BG_AUDIO_CONFIG: BackgroundAudioOptions = {
  startOffset: 2,
  volume: 0.3,
  preDelay: 0.5,
  postDelay: 5,
};
