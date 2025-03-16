import * as express from "express";
import * as speech from "../services/speech";

import { ValidationError, object, string } from "yup";

// eslint-disable-next-line max-len
import { SpeechSynthesisOutputFormat } from "microsoft-cognitiveservices-speech-sdk";

export const parseGenSpeech = express.json({ type: () => true });

export const handleGenSpeech = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const speechSchema = object({
      text: string().required(),
    });

    const speechReq = await speechSchema.validate(req.body, { strict: true });

    const audioStream = await speech.speak(
      speechReq.text,
      SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm
    );

    res.send(Buffer.from(audioStream));
  } catch (error) {
    const statusCode = error instanceof ValidationError ? 400 : 500;
    return res.apiError(statusCode, (error as Error).message);
  }
};
