import { Request, Response } from "express";
import {
  doesDevExist,
  getDeviceSettings,
  updateDeviceSettings,
} from "../services/deviceStore";
import { file as tmpFile } from "tmp-promise";

import { FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { sendSettingsUpdate } from "../sockets";
import parseRange from "range-parser";

const removeQueuedUpdate = async (deviceId: string) => {
  await updateDeviceSettings(deviceId, {
    doFirmwareUpdate: false,
    firmwareUpdateFile: FieldValue.delete(),
  });
  sendSettingsUpdate(deviceId, {
    doFirmwareUpdate: false,
    firmwareUpdateFile: null,
  });
};

export const handleDownloadFirmware = async (req: Request, res: Response) => {
  const deviceId = req.params.deviceId;

  if (!(await doesDevExist(deviceId))) {
    return res.apiError(404, "Device does not exist.");
  }

  const deviceSettings = await getDeviceSettings(deviceId);

  if (!deviceSettings.doFirmwareUpdate) {
    return res.apiError(400, "No firmware update requested.");
  }

  if (!deviceSettings.firmwareUpdateFile) {
    return res.apiError(400, "Firmware update file not specified.");
  }

  const bucket = getStorage().bucket();
  const file = bucket.file(deviceSettings.firmwareUpdateFile);

  try {
    const [metadata] = await file.getMetadata();

    if (!metadata) {
      return res.apiError(404, "Firmware update file not found.");
    }

    // Remove update from queue once update file successfully downloaded
    const fileSize = metadata.size;
    if (req.headers.range) {
      const ranges = parseRange(fileSize, req.headers.range, {
        combine: true,
      }) as parseRange.Ranges;

      if (ranges.type == "bytes" && ranges[0].end == fileSize - 1) {
        removeQueuedUpdate(deviceId);
      }
    }

    const { path, cleanup } = await tmpFile();
    await file.download({ destination: path });

    const handleDownloadError = () => {
      cleanup();
      return res.apiError(500, "Error sending firmware update file.");
    };

    res.on("finish", cleanup);
    res.on("error", handleDownloadError);

    res.sendFile(path, (err) => {
      if (err) {
        handleDownloadError();
      }
    });
  } catch (error) {
    return res.apiError(500, "Error retrieving firmware update file.");
  }
};
