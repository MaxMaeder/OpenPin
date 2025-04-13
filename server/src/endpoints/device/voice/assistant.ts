import * as SST from "src/services/speech/SST";
import * as TTS from "src/services/speech/TTS";

import { AbstractVoiceHandler } from "./common";
import {
  addDeviceMsg,
  clearDeviceMsgs,
  DeviceMessage,
  getDeviceMsgs,
} from "src/services/database/device/messages";

import { ParsedVoiceRequest } from "./parser";
import { Response, NextFunction } from "express";
import { DavisMessage, doDavis } from "src/davis";
import {
  sendMsgsUpdate,
  sendSettingsUpdate,
} from "src/sockets/msgBuilders/device";
import { STORE_VOICE_RECORDINGS } from "src/config/logging";

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
};

class Handler extends AbstractVoiceHandler {
  constructor(req: ParsedVoiceRequest, res: Response, next: NextFunction) {
    super(req, res, next);
  }

  public async run() {
    await super.run();

    if (!this.deviceData || !this.deviceSettings)
      throw new Error("Device data/settings null");

    const recognizedSpeech = await SST.recognize(this.req.audioBuffer);

    if (this.deviceSettings.clearMessages) {
      await clearDeviceMsgs(this.deviceId);
      sendSettingsUpdate(this.deviceId, {
        clearMessages: false,
      });
      this.deviceSettings.clearMessages = false;
    }

    const { entries: msgs } = await getDeviceMsgs(this.deviceId);
    const msgContext = msgs.flatMap(convToDavisMsg);

    const { assistantMessage } = await doDavis({
      deviceId: this.deviceId,
      deviceData: this.deviceData,
      deviceSettings: this.deviceSettings,
      msgContext,
      recognizedSpeech,
      imageBuffer: this.req.imageBuffer,
    });

    const msgDraft: Omit<DeviceMessage, "date"> = {
      userMsg: recognizedSpeech,
      assistantMsg: assistantMessage,
    };

    if (this.req.imageBuffer) {
      msgDraft.userImgId = this.deviceData.latestImage;
    }

    // Save conversation context
    const msgEntry = await addDeviceMsg(
      this.deviceId,
      msgDraft,
      this.deviceSettings.messagesToKeep
    );

    sendMsgsUpdate(this.deviceId, {
      entries: [msgEntry],
    });

    const audioData = await TTS.speak(assistantMessage, this.getSpeechConfig());

    if (STORE_VOICE_RECORDINGS) {
      this.runLazyWork(async () => {
        this.uploadVoiceData();
      });
    }

    this.writeDeviceData();
    this.sendResponse(audioData);
  }
}

export const handleAssistant = async (
  req: ParsedVoiceRequest,
  res: Response,
  next: NextFunction
) => {
  const handler = new Handler(req, res, next);
  await handler.run();
};
