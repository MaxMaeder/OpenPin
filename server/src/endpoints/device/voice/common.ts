import _ = require("lodash");
import { DeviceData, DeviceId } from "src/dbTypes";
import { getDeviceData, updateDeviceData } from "src/services/olddb/device/data";
import { ParsedVoiceRequest } from "./parser";
import genFileName from "src/util/genFileName";
import { getStorage } from "firebase-admin/storage";
import { getDeviceSettings, updateDeviceSettings } from "src/services/olddb/device/settings";
import { doesDeviceExist } from "src/services/olddb/device/list";
import createHttpError from "http-errors";
import { DeviceSettings, TranslateLanguageKey } from "src/config/deviceSettings";
import { MSFT_TTS_VOICES } from "src/config/speechSynthesis";
import { SynthesisConfig } from "src/services/speech/TTS";
import { Response, NextFunction } from "express";
import { Bucket } from "@google-cloud/storage";
import { DeviceMessage, getDeviceMsgs } from "src/services/olddb/device/messages";

export interface DeviceContext {
  id: DeviceId;

  data: DeviceData;
  settings: DeviceSettings;
  msgs: DeviceMessage[];
}

export interface BucketUploadResult {
  uri: string;
  name: string;
}

export class AbstractVoiceHandler {
  protected readonly req: ParsedVoiceRequest;
  protected readonly res: Response;
  protected readonly next: NextFunction;

  protected context?: DeviceContext;

  protected readonly bucket: Bucket;

  constructor(req: ParsedVoiceRequest, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
    this.next = next;

    // this.deviceId = req.metadata.deviceId;

    this.bucket = getStorage().bucket();
  }

  /**
   * Gets device messages within specified context window from DB
   */
  private async getDeviceMsgs(id: DeviceId, window: number) {
    const result = await getDeviceMsgs(id, {
      limit: window,
    });

    return result.entries.reverse(); // We want newest last
  }

  /**
   * Gets current device data, settings and messages from DB
   */
  private async getDeviceContext() {
    const id = this.req.metadata.deviceId;

    if (!(await doesDeviceExist(id))) throw createHttpError(404, "Device does not exist");

    const [data, settings] = await Promise.all([getDeviceData(id), getDeviceSettings(id)]);

    const msgs = await this.getDeviceMsgs(id, settings.messagesToKeep);

    this.context = {
      id,
      data,
      settings,
      msgs,
    };
  }

  /**
   * Drafts update of common device context from request
   */
  private updateDeviceContext() {
    if (!this.context) throw new Error("Device context null");

    this.context.data.lastConnected = _.now();

    _.assign(this.context.data, _.pick(this.req.metadata, ["latitude", "longitude", "battery"]));
  }

  /**
   * Uploads image, if one exists in request, and drafts update of related device context
   */
  protected async uploadImage(): Promise<BucketUploadResult | undefined> {
    if (!this.context) throw new Error("Device context null");
    if (!this.req.imageBuffer) return;

    const imageName = genFileName(this.context.id, "jpeg");

    const imageFile = await this.bucket.file(imageName);
    imageFile.save(this.req.imageBuffer, {
      contentType: "image/jpeg",
    });

    this.context.data.latestImage = imageName;
    this.context.data.latestImageCaptured = _.now();

    return {
      name: imageName,
      uri: imageFile.cloudStorageURI.toString(),
    };
  }

  /**
   * Run some lazy work
   * Does not block nor return a promise
   */
  protected runLazyWork(work: () => Promise<void>) {
    setImmediate(async () => {
      try {
        await work();
      } catch (e) {
        console.error("Lazy work failed:", e);
      }
    });
  }

  /**
   * Upload voice data from request to bucket, return URI
   */
  protected async uploadVoiceData(): Promise<BucketUploadResult> {
    if (!this.context) throw new Error("Device context null");

    const fileName = genFileName(this.context.id, "ogg");

    const voiceFile = this.bucket.file(fileName);
    await voiceFile.save(this.req.audioBuffer, {
      contentType: "audio/ogg",
    });

    return {
      name: fileName,
      uri: voiceFile.cloudStorageURI.toString(),
    };
  }

  /**
   * Writes device data & settings to DB
   * Does NOT write device msgs
   * Lazy: does not block nor return a promise
   */
  protected writeDeviceContext() {
    this.runLazyWork(async () => {
      if (!this.context) throw new Error("Device context null");

      // There is a DB watcher that will send the update to the client over WS
      // This will scale interestingly

      await Promise.all([
        updateDeviceData(this.context.id, this.context.data),
        updateDeviceSettings(this.context.id, this.context.settings),
      ]);
    });
  }

  /**
   * Gets speech synthesis config based on device settings
   */
  protected getSpeechConfig(language: TranslateLanguageKey = "en-US"): SynthesisConfig {
    if (!this.context) throw new Error("Device context null");

    const voice = MSFT_TTS_VOICES[this.context.settings.voiceName];
    const voiceName = language == "en-US" ? voice.english : voice.multiligual;

    return {
      speed: this.context.settings.voiceSpeed,
      voiceName,
      language,
    };
  }

  /**
   * Sends voice response
   */
  protected sendResponse(audioData: Buffer, metadata: Record<string, unknown> = {}) {
    const metadataBuffer = Buffer.concat([
      Buffer.from(JSON.stringify(metadata), "utf-8"),
      Buffer.from([0]),
    ]);

    if (metadataBuffer.length > 512) {
      throw new Error("Device metadata response exceeds the 512 byte limit.");
    }

    const paddedMetadata = new Uint8Array(512);
    paddedMetadata.set(paddedMetadata);

    const body = Buffer.concat([paddedMetadata, audioData]);
    this.res.status(200).send(body);
  }

  /**
   * Gets device context, and drafts update of common device context from request
   * Should be overridden in subclass
   */
  protected async run() {
    await this.getDeviceContext();
    this.updateDeviceContext();
  }
}
