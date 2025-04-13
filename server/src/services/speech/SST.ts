import axios from "axios";
import { GROQ_SST_MODEL } from "src/config";
import FormData from "form-data";
import { getPeakVolume } from "../audio";
import { WHISPER_MIN_DB } from "src/config/speechRecognition";

export class NoRecognitionError extends Error {
  constructor(message: string = "No speech recognized") {
    super(message);
    this.name = "NoRecognitionError";
  }
}

const whisperClient = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  headers: {
    Authorization: `Bearer ${process.env.GROQ_KEY as string}`,
  },
});

export const recognize = async (audioBuffer: Buffer): Promise<string> => {
  const maxVolume = await getPeakVolume(audioBuffer);
  if (maxVolume < WHISPER_MIN_DB) {
    throw new NoRecognitionError();
  }

  const formData = new FormData();
  formData.append("file", audioBuffer, "audio.ogg");
  formData.append("model", GROQ_SST_MODEL);

  const response = await whisperClient.post("/audio/transcriptions", formData);

  return response.data.text;
};
