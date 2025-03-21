import * as speech from "../../services/speech";

import { genCommonDevRes, handleCommonDevData } from "./common";
import { getDeviceMsgs, updateDeviceMsgs } from "../../services/messageStore";

import { ParsedAssistantRequest } from "./parser";
import { PassThrough } from "stream";
import { VOICE_SAMPLES_PER_S } from "../../config";
import { combineAudioComponents } from "../../services/audio";
import express from "express";
import ffmpeg from "fluent-ffmpeg";
import genFileName from "../../util/genFileName";
import { getStorage } from "firebase-admin/storage";
import { doDavis } from "../../davis";

export const handleAssistant = async (
  req: ParsedAssistantRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  const bucket = getStorage().bucket();

  const { deviceId, audioBitrate } = req.metadata;
  const { deviceData, deviceSettings } = await handleCommonDevData(
    req,
    deviceId
  );
  console.log(req.metadata);

  const decodeStream = new PassThrough();
  // const test = new PassThrough();
  ffmpeg()
    .input(req.audioStream)
    .inputFormat(req.metadata.audioFormat)
    .format("wav")
    .audioFrequency(VOICE_SAMPLES_PER_S)
    .audioFilters("volume=10")
    .pipe(decodeStream, { end: true })
    .on("error", (err) => {
      console.error("An error processing input audio occurred: " + err.message);
      res.status(500).send({ error: "Error processing input audio" });
    });

  // test.on("data", (data) => {
  //   console.log(data.length);
  // });

  // test.on("end", async () => {
  //   res.send("pee");
  // });
  // return;

  const audioFileStream = bucket
    .file(genFileName(deviceId, "wav"))
    .createWriteStream();

  const audioInStream = speech.getAudioStream();
  decodeStream.on("data", (data) => {
    audioFileStream.write(data);
    audioInStream.write(data);
  });

  decodeStream.on("end", async () => {
    try {
      audioFileStream.end();
      audioInStream.end();

      const recognizedSpeech = await speech.recognize(audioInStream);
      console.log("Recognized: " + recognizedSpeech);

      const msgs = await getDeviceMsgs(deviceId);

      const { assistantMessage, audioComponents } = await doDavis({
        deviceId,
        deviceData,
        deviceSettings,
        msgContext: msgs,
        recognizedSpeech,
        imageBuffer: req.imageBuffer,
      });

      updateDeviceMsgs(
        deviceId,
        recognizedSpeech,
        req.imageBuffer,
        assistantMessage,
        deviceSettings.messagesToKeep
      );

      console.log("Assistant response: " + assistantMessage);
      console.log("Audio components", audioComponents);

      const audioData = await combineAudioComponents(audioComponents, {
        bitrate: audioBitrate,
        spacing: 0.5,
      });

      const resMetadata = await genCommonDevRes(
        deviceId,
        deviceData,
        deviceSettings
      );
      const assistantRes = Buffer.concat([resMetadata, audioData]);

      res.send(assistantRes);
    } catch (error) {
      return next(error);
    }
  });
};

export const handleAssistantError = (
  error: unknown,
  req: ParsedAssistantRequest,
  res: express.Response
) => {
  return res.status(500).send({ error });
};
