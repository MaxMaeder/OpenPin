import * as MsftSpeech from "microsoft-cognitiveservices-speech-sdk";
import { PassThrough } from "stream";
import FormData from "form-data";
import axios from "axios";

import {
  MSFT_TTS_FORMAT,
  MSFT_TTS_LANGUAGE,
  MSFT_TTS_REGION,
  MSFT_TTS_VOICE,
  GROQ_SST_MODEL,
} from "../config";

const whisperClient = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  headers: {
    Authorization: `Bearer ${process.env.GROQ_KEY as string}`,
  },
});

export const getAudioStream = (): PassThrough => {
  return new PassThrough();
};

export const recognize = async (audioStream: PassThrough): Promise<string> => {
  const formData = new FormData();
  formData.append("file", audioStream, "audio.wav");
  formData.append("model", GROQ_SST_MODEL);

  const response = await whisperClient.post("/audio/transcriptions", formData);

  return response.data.text;
};

export const getMsftSpeechConfig = () => {
  const speechConfig = MsftSpeech.SpeechConfig.fromSubscription(
    process.env.SPEECH_KEY as string,
    MSFT_TTS_REGION
  );

  speechConfig.speechRecognitionLanguage = MSFT_TTS_LANGUAGE;
  speechConfig.speechSynthesisLanguage = MSFT_TTS_LANGUAGE;
  speechConfig.speechSynthesisVoiceName = MSFT_TTS_VOICE;
  speechConfig.speechSynthesisOutputFormat = MSFT_TTS_FORMAT;

  return speechConfig;
};

export const getSynthesizer = (
  format?: MsftSpeech.SpeechSynthesisOutputFormat
) => {
  const config = getMsftSpeechConfig();
  if (format) {
    config.speechSynthesisOutputFormat = format;
  }
  return new MsftSpeech.SpeechSynthesizer(config);
};

export const speak = async (
  text: string,
  format?: MsftSpeech.SpeechSynthesisOutputFormat
): Promise<ArrayBuffer> => {
  const synthesizer = getSynthesizer(format);

  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        synthesizer.close();
        resolve(result.audioData);
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
};
