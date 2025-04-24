import { Request, Response } from "express";
import _ from "lodash";
import fs from "fs";
// import { Reader } from "wav";

const POD_PATH = "/app/src/keys/pc-test.ogg"; // OGG version

export const handleGetPodcast = async (req: Request, res: Response) => {
  console.log("REQ");
  const fileStream = fs.createReadStream(POD_PATH);

  res.writeHead(200, {
    "Content-Type": "audio/ogg",
    Connection: "close",
  });

  fileStream.pipe(res);

  req.on("close", () => {
    fileStream.destroy();
  });

  fileStream.on("error", (err) => {
    console.error("Stream error:", err.message);
    res.destroy();
  });
};
