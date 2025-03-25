import axios from "axios";
import admin from "firebase-admin";
import firebaseKey from "../keys/firebaseKey";

const getGoogleClient = async () => {
  const credential = admin.app().options.credential;
  if (!credential) throw Error("No credential");
  const token = await credential.getAccessToken();

  const projectId = firebaseKey.projectId;

  return axios.create({
    baseURL: `https://translation.googleapis.com/v3/projects/${projectId}/locations/global`,
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });
};

export interface GoogleTranslateResponse {
  translations: {
    translatedText: string;
    detectedLanguageCode?: string;
    model?: string;
  }[];
}

export const translate = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<{ translatedText: string; detectedLanguageCode?: string }> => {
  const translateClient = await getGoogleClient();

  const requestBody = {
    contents: [text],
    targetLanguageCode: targetLanguage,
    sourceLanguageCode: sourceLanguage,
    mimeType: "text/plain",
  };

  const response = await translateClient.post<GoogleTranslateResponse>(
    ":translateText",
    requestBody
  );

  const result = response.data.translations[0];

  return {
    translatedText: result?.translatedText || "",
    detectedLanguageCode: result?.detectedLanguageCode,
  };
};
