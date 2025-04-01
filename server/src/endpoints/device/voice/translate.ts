import { ParsedAssistantRequest } from "./parser";
import * as speech from "src/services/speech";
import express from "express";
import genFileName from "src/util/genFileName";
import { getStorage } from "firebase-admin/storage";
import { genCommonDevRes, handleCommonDevData } from "./common";
import { translate } from "src/services/translate";
import createHttpError from "http-errors";
import { assembleAudioComponents, AudioSpeechComponent } from "src/services/audio";

export const handleTranslate = async (
  req: ParsedAssistantRequest,
  res: express.Response
) => {
  const bucket = getStorage().bucket();

  const { deviceId, audioFormat, audioBitrate } = req.metadata;
  const { deviceData, deviceSettings } = await handleCommonDevData(
    req,
    deviceId
  );

  const fileName = genFileName(deviceId, audioFormat);
  const file = bucket.file(fileName);

  await file.save(req.audioBuffer, {
    contentType: "audio/ogg",
  });

  const gcsUri = `gs://${bucket.name}/${fileName}`;

  const languagePool = [
    deviceSettings.myLanguage,
    deviceSettings.translateLanguage,
  ];

  const recognizedResult = await speech.googleRecognize(gcsUri, languagePool);

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

  console.log("Translated speech", translatedText);

  const resMetadata = await genCommonDevRes(
    deviceId,
    deviceData,
    deviceSettings
  );

  const audioComponents: AudioSpeechComponent[] = [
    {
      type: "speech",
      text: translatedText,
      languageCode: targetLanguage
    }
  ]

  const audioData = await assembleAudioComponents(
    audioComponents, 
    {
      bitrate: audioBitrate,
      spacing: 0.5,
    }
  );

  const assistantRes = Buffer.concat([resMetadata, Buffer.from(audioData)]);

  res.send(assistantRes);
};
