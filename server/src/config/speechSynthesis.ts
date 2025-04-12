import { SpeechSynthesisOutputFormat } from "microsoft-cognitiveservices-speech-sdk";
import { AssistantVoice } from "./deviceSettings";

export const MSFT_TTS_REGION = "eastus";
export const MSFT_TTS_FORMAT =
  SpeechSynthesisOutputFormat.Ogg16Khz16BitMonoOpus;

interface MsftTTSVoice {
  english: string;
  multiligual: string;
}

export const MSFT_TTS_VOICES: Record<AssistantVoice, MsftTTSVoice> = {
  davis: {
    english: "en-US-DavisNeural",
    multiligual: "en-US-DavisMultilingualNeural",
  },
  andrew: {
    english: "en-US-AndrewNeural",
    multiligual: "en-US-AndrewMultilingualNeural",
  },
  derek: {
    english: "en-US-DerekNeural",
    multiligual: "en-US-DerekMultilingualNeural",
  },
  nancy: {
    english: "en-US-NancyNeural",
    multiligual: "en-US-NancyMultilingualNeural",
  },
  jenny: {
    english: "en-US-JennyNeural",
    multiligual: "en-US-JennyMultilingualNeural",
  },
};
