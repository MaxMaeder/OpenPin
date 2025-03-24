import * as MsftSpeech from "microsoft-cognitiveservices-speech-sdk";
import { PassThrough } from "stream";
import FormData from "form-data";
import axios from "axios";
import admin from "firebase-admin";

import {
  MSFT_TTS_FORMAT,
  MSFT_TTS_LANGUAGE,
  MSFT_TTS_REGION,
  MSFT_TTS_VOICE,
  GROQ_SST_MODEL,
  MSFT_TTS_MULTILINGUAL_VOICE,
} from "../config";
import firebaseKey from "../keys/firebaseKey";

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

const getGoogleClient = async () => {
  const credential = admin.app().options.credential;
  if (!credential) throw Error("No credential");
  const token = await credential.getAccessToken();

  const projectId = firebaseKey.projectId;

  return axios.create({
    baseURL: `https://speech.googleapis.com/v2/projects/${projectId}/locations/global/recognizers/_`,
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });
};

export interface GoogleRecognizeResponse {
  results: {
    alternatives: {
      transcript: string;
      confidence?: number;
    }[];
    languageCode?: string;
  }[];
}

export const googleRecognize = async (
  gcsUri: string,
  languageCodes: string[]
) => {
  const googleSpeechClient = await getGoogleClient();

  const requestBody = {
    config: {
      languageCodes,
      model: "latest_short",
      autoDecodingConfig: {},
    },
    uri: gcsUri,
  };

  const response = await googleSpeechClient.post<GoogleRecognizeResponse>(
    ":recognize",
    requestBody
  );

  const { results } = response.data;

  const transcript = results
    ?.flatMap((result) => result.alternatives || [])
    .map((alt) => alt.transcript?.trim())
    .filter((t): t is string => Boolean(t))
    .join(" ");

  const detectedLanguage = results[0]?.languageCode;

  return {
    transcript: transcript || "",
    languageCode: detectedLanguage,
  };
};

export const getMsftSpeechConfig = () => {
  const speechConfig = MsftSpeech.SpeechConfig.fromSubscription(
    process.env.MSFT_SPEECH_KEY as string,
    MSFT_TTS_REGION
  );

  speechConfig.speechRecognitionLanguage = MSFT_TTS_LANGUAGE;
  speechConfig.speechSynthesisLanguage = MSFT_TTS_LANGUAGE;
  speechConfig.speechSynthesisVoiceName = MSFT_TTS_VOICE;
  speechConfig.speechSynthesisOutputFormat = MSFT_TTS_FORMAT;

  return speechConfig;
};

export const getSynthesizer = (
  format?: MsftSpeech.SpeechSynthesisOutputFormat,
  languageCode?: string
) => {
  const config = getMsftSpeechConfig();

  if (format) {
    config.speechSynthesisOutputFormat = format;
  }

  if (languageCode && languageCode != MSFT_TTS_LANGUAGE) {
    config.speechSynthesisLanguage = languageCode;
    config.speechSynthesisVoiceName = MSFT_TTS_MULTILINGUAL_VOICE;
  }

  return new MsftSpeech.SpeechSynthesizer(config);
};

export const speak = async (
  text: string,
  format?: MsftSpeech.SpeechSynthesisOutputFormat,
  languageCode?: string
): Promise<ArrayBuffer> => {
  const synthesizer = getSynthesizer(format, languageCode);

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
