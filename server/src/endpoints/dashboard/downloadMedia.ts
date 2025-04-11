import { Request, Response } from "express";

import { getStorage } from "firebase-admin/storage";
import createHttpError from "http-errors";
import { foreverCacheRes } from "src/util/caching";

export const handleDownloadMedia = async (req: Request, res: Response) => {
  const fileName = req.params.name;

  const bucket = getStorage().bucket();
  const file = bucket.file(fileName);

  const [metadata] = await file.getMetadata();

  if (!metadata) {
    return createHttpError(404, "File not found.");
  }

  res.set("Content-Type", metadata.contentType);
  foreverCacheRes(res);

  const stream = file.createReadStream();
  stream.on("error", () => {
    return createHttpError(500, "Error reading from file.");
  });

  return stream.pipe(res);
};
