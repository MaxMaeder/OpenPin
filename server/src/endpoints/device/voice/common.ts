import _ = require("lodash");
import { DeviceData } from "src/dbTypes";
import {
  getDeviceData,
  updateDeviceData,
} from "src/services/database/device/data";
import { ParsedVoiceRequest } from "./parser";
import genFileName from "src/util/genFileName";
import { getStorage } from "firebase-admin/storage";
import {
  getDeviceSettings,
  updateDeviceSettings,
} from "src/services/database/device/settings";
import { doesDeviceExist } from "src/services/database/device/list";
import createHttpError from "http-errors";
import { DeviceSettings, TranslateLanguage } from "src/config/deviceSettings";
import { MSFT_TTS_VOICES } from "src/config/speechSynthesis";
import { SynthesisConfig } from "src/services/speech/TTS";
import { Response, NextFunction } from "express";
import { Bucket } from "@google-cloud/storage";

export class AbstractVoiceHandler {
  protected readonly req: ParsedVoiceRequest;
  protected readonly res: Response;
  protected readonly next: NextFunction;

  protected readonly deviceId: string;

  protected deviceData?: DeviceData;
  protected deviceSettings?: DeviceSettings;

  protected readonly bucket: Bucket;

  constructor(req: ParsedVoiceRequest, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
    this.next = next;

    this.deviceId = req.metadata.deviceId;

    this.bucket = getStorage().bucket();
  }

  /**
   * Gets current device data & settings from DB
   */
  private async getDeviceData() {
    if (!(await doesDeviceExist(this.deviceId)))
      throw createHttpError(404, "Device does not exist");

    this.deviceSettings = await getDeviceSettings(this.deviceId);
    this.deviceData = await getDeviceData(this.deviceId);
  }

  /**
   * Drafts update of common device data from request
   */
  private updateDeviceData() {
    if (!this.deviceData) throw new Error("Device data null")!;

    this.deviceData.lastConnected = _.now();

    // We update latest image in writeDeviceData(), since there we can upload the image lazily
    // If we did it here we might run into a race condition where device data was written,
    // pointing to an image not yet uploaded

    _.assign(
      this.deviceData,
      _.pick(this.req.metadata, ["latitude", "longitude", "battery"])
    );
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
  protected async uploadVoiceData() {
    const fileName = genFileName(this.deviceId, "ogg");

    const voiceFile = this.bucket.file(fileName);
    await voiceFile.save(this.req.audioBuffer, {
      contentType: "audio/ogg",
    });

    return voiceFile.cloudStorageURI.toString();
  }

  /**
   * Writes device data & settings to DB
   * Lazy: does not block nor return a promise
   */
  protected writeDeviceData() {
    this.runLazyWork(async () => {
      if (!this.deviceData || !this.deviceSettings)
        throw new Error("Device data/settings null")!;

      if (this.req.imageBuffer) {
        const imageName = genFileName(this.deviceId, "jpeg");

        await this.bucket.file(imageName).save(this.req.imageBuffer, {
          contentType: "image/jpeg",
        });

        this.deviceData.latestImage = imageName;
        this.deviceData.latestImageCaptured = _.now();
      }

      await updateDeviceData(this.deviceId, this.deviceData);
      await updateDeviceSettings(this.deviceId, this.deviceSettings);
    });
  }

  /**
   * Gets speech synthesis config based on device settings
   */
  protected getSpeechConfig(
    language: TranslateLanguage = "en-US"
  ): SynthesisConfig {
    if (!this.deviceSettings) throw new Error("Device settings null")!;

    const voice = MSFT_TTS_VOICES[this.deviceSettings.voiceName];
    const voiceName = language == "en-US" ? voice.english : voice.multiligual;

    return {
      speed: this.deviceSettings.voiceSpeed,
      voiceName,
      language,
    };
  }

  /**
   * Sends voice response
   */
  protected sendResponse(
    audioData: Buffer,
    metadata: Record<string, unknown> = {}
  ) {
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

  protected async run() {
    await this.getDeviceData();
    this.updateDeviceData();
  }
}
