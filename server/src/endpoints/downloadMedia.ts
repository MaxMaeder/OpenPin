import { Request, Response } from "express";

import { getStorage } from "firebase-admin/storage";

export const handleDownloadMedia = async (req: Request, res: Response) => {
  const fileName = req.params.name;

  const bucket = getStorage().bucket();
  const file = bucket.file(fileName);

  try {
    const [metadata] = await file.getMetadata();

    if (!metadata) {
      return res.apiError(404, "File not found.");
    }

    res.set("Content-Type", metadata.contentType);

    const stream = file.createReadStream();
    stream.on("error", () => {
      return res.apiError(500, "Error reading from file.");
    });

    return stream.pipe(res);
  } catch (error) {
    return res.apiError(500, "Error retrieving file.");
  }
};
