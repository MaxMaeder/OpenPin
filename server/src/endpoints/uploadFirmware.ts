import { NextFunction, Request, Response } from "express";
import {
  doesDevExist,
  getDeviceSettings,
  getDeviceSettingsRef,
} from "../services/deviceStore";

import { getStorage } from "firebase-admin/storage";
import multer from "multer";
import { sendSettingsUpdate } from "../sockets";

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.originalname.match(/\.(bin)$/)) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error("Invalid file type. Only .bin files are allowed."));
  }
};

const multerInstance = multer({ storage: multer.memoryStorage(), fileFilter });

export const parseUploadFirmware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const fileUpload = multerInstance.single("file");

  fileUpload(req, res, (err) => {
    if (err) {
      return res.apiError(400, (err as Error).message);
    }

    next();
  });
};

const addFirmwareToDB = async (deviceId: string, fileName: string) => {
  const { uploadedFirmwareFiles } = await getDeviceSettings(deviceId);
  uploadedFirmwareFiles.push(fileName);

  sendSettingsUpdate(deviceId, {
    uploadedFirmwareFiles,
  });

  await getDeviceSettingsRef(deviceId).update({ uploadedFirmwareFiles });
};

export const handleUploadFirmware = async (req: Request, res: Response) => {
  const bucket = getStorage().bucket();

  try {
    const deviceId = req.body.deviceId;

    if (!deviceId) {
      return res.apiError(400, "'deviceId' is required.");
    } else if (!req.file) {
      return res.apiError(400, "No file uploaded.");
    }

    if (!(await doesDevExist(deviceId))) {
      return res.apiError(404, "Device does not exist.");
    }

    const fileName = `${new Date().getTime()}-${deviceId}-${
      req.file.originalname
    }`;

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      res.apiError(500, err.message);
    });
    blobStream.on("finish", () => {
      addFirmwareToDB(deviceId, fileName);
      res.apiOk("Firmware binary uploaded.");
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    return res.apiError(500, (error as Error).message);
  }
};
