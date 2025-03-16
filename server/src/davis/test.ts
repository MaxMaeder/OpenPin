import * as fs from "fs";
import { getAudioStream, recognize } from "../services/speech";

const run = async () => {
  const testFilePath = "./test.wav";
  const audioStream = getAudioStream();

  const readStream = fs.createReadStream(testFilePath);
  readStream.on("data", (chunk: Buffer) => {
    audioStream.write(chunk);
  });
  readStream.on("end", async () => {
    audioStream.end();
    try {
      const transcription = await recognize(audioStream);
      console.log("Recognized speech:", transcription);
    } catch (error) {
      console.error("Error during speech recognition:", error);
    }
  });
};

run();
