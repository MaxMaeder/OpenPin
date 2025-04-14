import { ParsedVoiceRequest } from "./parser";
import * as translateSST from "src/services/speech/translateSST";
import * as TTS from "src/services/speech/TTS";
import * as SST from "src/services/speech/SST";
import { translate } from "src/services/translate";
import createHttpError from "http-errors";
import { changeVolume } from "src/services/audio";
import { Response, NextFunction } from "express";
import { AbstractVoiceHandler } from "./common";
import { getRandomCannedMsg, NO_SPEECH_MSGS } from "src/config/cannedMsgs";
import { STORE_VOICE_RECORDINGS } from "src/config/logging";

class Handler extends AbstractVoiceHandler {
  constructor(req: ParsedVoiceRequest, res: Response, next: NextFunction) {
    super(req, res, next);
  }

  public async run() {
    await super.run();

    if (!this.context) throw new Error("Device context null");

    const { uri: voiceFileUri, name: voiceFileName } = await this.uploadVoiceData();

    const languagePool = [
      this.context.settings.myLanguage,
      this.context.settings.translateLanguage,
    ];

    let recognizedResult: translateSST.TranslateSSTResult;
    try {
      recognizedResult = await translateSST.recognize(voiceFileUri, languagePool);
    } catch (e) {
      if (e instanceof SST.NoRecognitionError) {
        console.log("No speech recognized");

        const speech = getRandomCannedMsg(NO_SPEECH_MSGS);

        const audioData = await TTS.speak(speech, this.getSpeechConfig());
        this.sendResponse(audioData);
        return;
      }

      throw e;
    }

    console.log("Recognized speech", recognizedResult);

    const sourceLang = recognizedResult.languageCode;
    const targetLanguage = languagePool.find((lang) => lang !== sourceLang);

    if (!sourceLang || !targetLanguage) {
      throw createHttpError(500, "Couldn't determine languages!");
    }

    const { translatedText } = await translate(
      recognizedResult.transcript,
      sourceLang,
      targetLanguage
    );

    let audioData = await TTS.speak(translatedText, this.getSpeechConfig(targetLanguage));

    if (targetLanguage != this.context.settings.myLanguage) {
      audioData = await changeVolume(audioData, this.context.settings.translateVolumeBoost);
    }

    if (!STORE_VOICE_RECORDINGS) {
      this.runLazyWork(async () => {
        await this.bucket.file(voiceFileName).delete();
      });
    }

    this.sendResponse(audioData);
  }
}

export const handleTranslate = async (
  req: ParsedVoiceRequest,
  res: Response,
  next: NextFunction
) => {
  const handler = new Handler(req, res, next);
  await handler.run();
};
