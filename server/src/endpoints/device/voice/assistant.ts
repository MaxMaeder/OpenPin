import * as SST from "src/services/speech/SST";
import * as TTS from "src/services/speech/TTS";
import { AbstractVoiceHandler } from "./common";
import {
  addDeviceMsg,
  DeviceMessageDraft,
} from "src/services/database/device/messages";
import { ParsedVoiceRequest } from "./parser";
import { Response, NextFunction } from "express";
import { doDavis } from "src/davis";
import {
  sendMsgsUpdate,
  sendSettingsUpdate,
} from "src/sockets/msgBuilders/device";
import { STORE_VOICE_RECORDINGS } from "src/config/logging";

class Handler extends AbstractVoiceHandler {
  constructor(req: ParsedVoiceRequest, res: Response, next: NextFunction) {
    super(req, res, next);
  }

  public async run() {
    await super.run();

    if (!this.context) throw new Error("Device context null");

    const userMsg = await SST.recognize(this.req.audioBuffer);

    if (this.context.settings.clearMessages) {
      sendSettingsUpdate(this.context.id, {
        clearMessages: false,
      });

      this.context.msgs = [];
      this.context.settings.clearMessages = false;
    }

    const assistantMsg = await doDavis({
      context: this.context,
      userMsg,
      userImg: this.req.imageBuffer,
    });

    const msgDraft: DeviceMessageDraft = {
      userMsg,
      assistantMsg,
    };

    if (this.req.imageBuffer) {
      msgDraft.userImgId = this.context.data.latestImage;
    }

    this.runLazyWork(async () => {
      if (!this.context) throw new Error("Device context null");

      const msgEntry = await addDeviceMsg(
        this.context.id,
        msgDraft,
        this.context.settings.messagesToKeep
      );

      sendMsgsUpdate(this.context.id, {
        entries: [msgEntry],
      });
    });

    const audioData = await TTS.speak(assistantMsg, this.getSpeechConfig());

    if (STORE_VOICE_RECORDINGS) {
      this.runLazyWork(async () => {
        this.uploadVoiceData();
      });
    }

    this.writeDeviceContext();
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
