import * as SST from "src/services/speech/SST";
import * as TTS from "src/services/speech/TTS";
import { AbstractVoiceHandler } from "./common";
import {
  addDeviceMsg,
  clearDeviceMsgs,
  DeviceMessageDraft,
} from "src/services/database/device/messages";
import { ParsedVoiceRequest } from "./parser";
import { Response, NextFunction } from "express";
import { doDavis } from "src/davis";
import { sendMsgsUpdate, sendSettingsUpdate } from "src/sockets/msgBuilders/device";
import { STORE_VOICE_RECORDINGS } from "src/config/logging";
import { getRandomCannedMsg, NO_SPEECH_MSGS } from "src/config/cannedMsgs";

class Handler extends AbstractVoiceHandler {
  constructor(req: ParsedVoiceRequest, res: Response, next: NextFunction) {
    super(req, res, next);
  }

  private async sendSpeech(speech: string) {
    const audioData = await TTS.speak(speech, this.getSpeechConfig());
    this.sendResponse(audioData);
  }

  public async run() {
    await super.run();

    if (!this.context) throw new Error("Device context null");

    let userMsg: string;
    try {
      userMsg = await SST.recognize(this.req.audioBuffer);
    } catch (e) {
      if (e instanceof SST.NoRecognitionError) {
        console.log("No speech recognized");

        const speech = getRandomCannedMsg(NO_SPEECH_MSGS);
        await this.sendSpeech(speech);
        return;
      }

      throw e;
    }

    if (this.context.settings.clearMessages) {
      sendSettingsUpdate(this.context.id, {
        clearMessages: false,
      });

      // Need to clear here, since we only upsert at end
      await clearDeviceMsgs(this.context.id);

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

    if (STORE_VOICE_RECORDINGS) {
      this.runLazyWork(async () => {
        this.uploadVoiceData();
      });
    }

    this.writeDeviceContext();
    await this.sendSpeech(assistantMsg);
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
