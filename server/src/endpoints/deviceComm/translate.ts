import { ParsedAssistantRequest } from "./parser";
import * as speech from "../../services/speech";
import express from "express";
import genFileName from "../../util/genFileName";
import { getStorage } from "firebase-admin/storage";
import { finished } from "stream/promises";
import { genCommonDevRes, handleCommonDevData } from "./common";
import { translate } from "../../services/translate";

// eslint-disable-next-line max-len
import { SpeechSynthesisOutputFormat } from "microsoft-cognitiveservices-speech-sdk";

export const handleTranslate = async (
  req: ParsedAssistantRequest,
  res: express.Response
) => {
  const bucket = getStorage().bucket();

  const { deviceId, audioFormat } = req.metadata;
  const { deviceData, deviceSettings } = await handleCommonDevData(
    req,
    deviceId
  );

  const gcsFileName = genFileName(deviceId, audioFormat);
  const gcsFile = bucket.file(gcsFileName);
  const gcsUri = `gs://${bucket.name}/${gcsFileName}`;

  const writeStream = gcsFile.createWriteStream();

  req.audioStream.pipe(writeStream);
  await finished(writeStream);

  const languagePool = [
    deviceSettings.myLanguage,
    deviceSettings.translateLanguage,
  ];

  const recognizedResult = await speech.googleRecognize(gcsUri, languagePool);

  console.log(recognizedResult);

  const sourceLang = recognizedResult.languageCode;
  const targetLanguage = languagePool.find((lang) => lang !== sourceLang);

  if (!sourceLang || !targetLanguage) {
    throw Error("Couldn't determine languages!");
  }

  const translatedText = await translate(
    recognizedResult.transcript,
    sourceLang,
    targetLanguage
  );

  console.log(translatedText);

  const resMetadata = await genCommonDevRes(
    deviceId,
    deviceData,
    deviceSettings
  );

  const audioData = await speech.speak(
    translatedText.translatedText,
    SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3,
    targetLanguage
  );

  const assistantRes = Buffer.concat([resMetadata, Buffer.from(audioData)]);

  res.send(assistantRes);
};
