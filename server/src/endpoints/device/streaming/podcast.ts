import { Request, Response } from "express";
import _ from "lodash";
import fs from "fs";
import { Reader } from "wav";

const POD_PATH = "/app/src/keys/test-audio.wav";

export const handleGetPodcast = async (req: Request, res: Response) => {
  // 1) Open the WAV file on disk
  const fileStream = fs.createReadStream(POD_PATH);

  // 2) Reader parses the RIFF header and emits raw PCM
  const wavReader = new Reader();
  wavReader.on("format", fmt => {
    /* fmt = { audioFormat, sampleRate, bitsPerSample, channels, ... } */
    // Tell the client what we’re sending (16‑bit little‑endian PCM here)
    res.writeHead(200, {
      "Content-Type": `audio/L${fmt.bitDepth}; rate=${fmt.sampleRate}; channels=${fmt.channels}`,
      "Connection":   "close"
    });
    //res.setHeader("Transfer-Encoding", "chunked");

    // 3) Pipe pure PCM bytes straight to the response socket (TCP)
    wavReader.pipe(res);
  });

  // 4) Start the flow
  fileStream.pipe(wavReader);

  req.on("close", () => {
    // Client hung up → stop reading the file
    fileStream.destroy();
  });
}