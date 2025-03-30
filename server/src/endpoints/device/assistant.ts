import * as speech from "../../services/speech";

import { genCommonDevRes, handleCommonDevData } from "./util/common";
import { addDeviceMsg, DeviceMessage, getDeviceMsgs } from "../../services/database/device/messages";

import { ParsedAssistantRequest } from "./util/parser";
import { PassThrough } from "stream";
import { VOICE_SAMPLES_PER_S } from "../../config";
import { combineAudioComponents } from "../../services/audio";
import express from "express";
import ffmpeg from "fluent-ffmpeg";
import genFileName from "../../util/genFileName";
import { getStorage } from "firebase-admin/storage";
import { DavisMessage, doDavis } from "../../davis";

export const convToDavisMsg = (deviceMsg: DeviceMessage): DavisMessage[] => {
  return [
    {
      role: "user",
      content: deviceMsg.userMsg,
    },
    {
      role: "assistant",
      content: deviceMsg.assistantMsg,
    },
  ];
}

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

      const { entries: msgs } = await getDeviceMsgs(deviceId);

      const msgContext = msgs.flatMap(convToDavisMsg);

      const { assistantMessage, audioComponents } = await doDavis({
        deviceId,
        deviceData,
        deviceSettings,
        msgContext,
        recognizedSpeech,
        imageBuffer: req.imageBuffer,
      });

      // TODO: very hacky, no images
      addDeviceMsg(
        deviceId, 
        {
          userMsg: recognizedSpeech,
          assistantMsg: assistantMessage,
        },
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
