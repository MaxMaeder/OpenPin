import * as speech from "src/services/speech";

import { genCommonDevRes, handleCommonDevData } from "./common";
import { addDeviceMsg, DeviceMessage, getDeviceMsgs } from "src/services/database/device/messages";

import { ParsedAssistantRequest } from "./parser";
import { assembleAudioComponents } from "src/services/audio";
import express from "express";
import genFileName from "src/util/genFileName";
import { getStorage } from "firebase-admin/storage";
import { DavisMessage, doDavis } from "src/davis";
import { sendMsgsUpdate } from "src/sockets/msgBuilders/device";

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
  try {
    const bucket = getStorage().bucket();
    const { deviceId, audioBitrate } = req.metadata;
    const { deviceData, deviceSettings } = await handleCommonDevData(req, deviceId);
    console.log(req.metadata);

    // Get the audio buffer in OGG format from the request
    const audioBuffer: Buffer = req.audioBuffer;

    // Start uploading the OGG file to cloud storage
    const fileName = genFileName(deviceId, "ogg");
    const file = bucket.file(fileName);
    const uploadPromise = file.save(audioBuffer, {
      contentType: "audio/ogg",
    });

    // Process the assistant logic concurrently.
    const assistantPromise = (async () => {
      const recognizedSpeech = await speech.recognize(audioBuffer);
      console.log("Recognized:", recognizedSpeech);

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

      const msgDraft: Omit<DeviceMessage, "date"> = {
        userMsg: recognizedSpeech,
        assistantMsg: assistantMessage
      };

      if (req.imageBuffer) {
        msgDraft.userImgId = deviceData.latestImage;
      }

      // Save conversation context
      const msgEntry = await addDeviceMsg(
        deviceId,
        msgDraft,
        deviceSettings.messagesToKeep
      );

      sendMsgsUpdate(deviceId, {
        entries: [
          msgEntry
        ]
      });

      console.log("Assistant response:", assistantMessage);
      console.log("Audio components:", audioComponents);

      const audioData = await assembleAudioComponents(audioComponents, {
        bitrate: audioBitrate,
        spacing: 0.5,
      });

      const resMetadata = await genCommonDevRes(deviceId, deviceData, deviceSettings);
      const assistantRes = Buffer.concat([resMetadata, audioData]);

      console.log("Assistant done.");

      return assistantRes;
    })();

    // Wait for both the upload and assistant processing to finish.
    const [assistantRes] = await Promise.all([assistantPromise, uploadPromise]);

    res.send(assistantRes);
  } catch (error) {
    next(error);
  }
};

