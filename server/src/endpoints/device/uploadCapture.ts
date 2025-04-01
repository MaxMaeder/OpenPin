import { NextFunction, Request, Response } from "express";
import { getStorage } from "firebase-admin/storage";
import createHttpError from "http-errors";
import { now } from "lodash";
import multer from "multer";
import { DeviceId } from "src/dbTypes";
import { addDeviceCapture, DeviceCapture } from "src/services/database/device/captures";
import { getDeviceData, updateDeviceData } from "src/services/database/device/data";
import { doesDeviceExist } from "src/services/database/device/list";
import { sendCapturesUpdate, sendDataUpdate } from "src/sockets/msgBuilders/device";
import genFileName from "src/util/genFileName";
import * as yup from "yup";

const captureFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.originalname.match(/\.(jpg|jpeg|mp4)$/i)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only .jpg, .jpeg, or .mp4 files are allowed."));
  }
};

const multerCapture = multer({ storage: multer.memoryStorage(), fileFilter: captureFileFilter });

export const parseUploadCapture = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const upload = multerCapture.single("file");

  upload(req, res, (err) => {
    if (err) {
      throw createHttpError(500, err);
    }

    next();
  });
};

const uploadSchema = yup.object({
  deviceId: yup.string().required(),
});

type FileTypeInfo = {
  fileExt: "jpeg" | "mp4"
  contentType: string;
  captureType: DeviceCapture["type"];
};

const inferFileType = (filename: string): FileTypeInfo => {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "jpg":
    case "jpeg":
      return {
        fileExt: "jpeg",
        contentType: "image/jpeg",
        captureType: "image"
      };
    case "mp4":
      return {
        fileExt: "mp4",
        contentType: "video/mp4",
        captureType: "video"
      };
    default:
      throw createHttpError(400, "Unsupported file type");
  }
}

const updateLatestImage = async (deviceId: DeviceId, captureId: string) => {
  const deviceData = await getDeviceData(deviceId);

  deviceData.latestImage = captureId;
  deviceData.latestImageCaptured = now();

  await updateDeviceData(deviceId, deviceData);
  sendDataUpdate(deviceId, deviceData);
}

export const handleUploadCapture = async (req: Request, res: Response) => {

  if (!req.file) {
    throw createHttpError(400, "No file uploaded");
  }

  try {
    await uploadSchema.validate(req.body)
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      throw createHttpError(400, err.message);
    }
    throw err;
  }

  const deviceId = req.body.deviceId;
  if (!(await doesDeviceExist(deviceId)))
    throw createHttpError(404, "Device does not exist");

  const { fileExt, contentType, captureType } = inferFileType(req.file.originalname);

  const bucket = getStorage().bucket();

  const fileName = genFileName(deviceId, fileExt);
  const file = bucket.file(fileName);
  await file.save(req.file.buffer, {
    contentType,
  });

  const captureDraft: Omit<DeviceCapture, "date"> = {
    type: captureType,
    mediaId: fileName
  };

  const captureEntry = await addDeviceCapture(
    deviceId,
    captureDraft,
  );

  sendCapturesUpdate(deviceId, {
    entries: [
      captureEntry
    ]
  });

  if (captureType == "image") {
    await updateLatestImage(deviceId, fileName);
  }

  res.status(200).send();
};
