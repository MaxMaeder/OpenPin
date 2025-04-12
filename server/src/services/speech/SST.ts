import axios from "axios";
import { GROQ_SST_MODEL } from "src/config";
import FormData from "form-data";

const whisperClient = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  headers: {
    Authorization: `Bearer ${process.env.GROQ_KEY as string}`,
  },
});

export const recognize = async (audioBuffer: Buffer): Promise<string> => {
  const formData = new FormData();
  formData.append("file", audioBuffer, "audio.ogg");
  formData.append("model", GROQ_SST_MODEL);

  const response = await whisperClient.post("/audio/transcriptions", formData);

  return response.data.text;
};
