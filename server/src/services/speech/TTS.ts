import * as MsftSpeech from "microsoft-cognitiveservices-speech-sdk";
import { MSFT_TTS_FORMAT, MSFT_TTS_REGION } from "src/config";

export const getMsftSpeechConfig = () => {
  const speechConfig = MsftSpeech.SpeechConfig.fromSubscription(
    process.env.MSFT_SPEECH_KEY as string,
    MSFT_TTS_REGION
  );

  speechConfig.speechSynthesisOutputFormat = MSFT_TTS_FORMAT;

  return speechConfig;
};

export const getSynthesizer = () => {
  const config = getMsftSpeechConfig();

  return new MsftSpeech.SpeechSynthesizer(config);
};

export interface SynthesisConfig {
  speed: number;
  voiceName: string;
  language: string;
}

export const speak = async (
  text: string,
  config: SynthesisConfig
): Promise<Buffer> => {
  const synthesizer = getSynthesizer();

  const ssml = `
  <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${config.language}">
    <voice name="${config.voiceName}">
      <prosody rate="${config.speed}">${text}</prosody>
    </voice>
  </speak>`;

  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        synthesizer.close();
        resolve(Buffer.from(result.audioData));
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
};
