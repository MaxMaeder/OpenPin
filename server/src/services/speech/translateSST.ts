import firebaseKey from "src/keys/firebaseKey";
import admin from "firebase-admin";
import axios from "axios";

const getGoogleClient = async () => {
  const credential = admin.app().options.credential;
  if (!credential) throw Error("No credential");
  const token = await credential.getAccessToken();

  const projectId = firebaseKey.projectId;

  return axios.create({
    baseURL: `https://speech.googleapis.com/v2/projects/${projectId}/locations/global/recognizers/_`,
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });
};

export interface GoogleRecognizeResponse {
  results: {
    alternatives: {
      transcript: string;
      confidence?: number;
    }[];
    languageCode?: string;
  }[];
}

export const recognize = async (mediaId: string, languageCodes: string[]) => {
  const googleSpeechClient = await getGoogleClient();

  const requestBody = {
    config: {
      languageCodes,
      model: "latest_short",
      autoDecodingConfig: {},
    },
    uri: mediaId,
  };

  const response = await googleSpeechClient.post<GoogleRecognizeResponse>(
    ":recognize",
    requestBody
  );

  const { results } = response.data;

  const transcript = results
    ?.flatMap((result) => result.alternatives || [])
    .map((alt) => alt.transcript?.trim())
    .filter((t): t is string => Boolean(t))
    .join(" ");

  const detectedLanguage = results[0]?.languageCode;

  return {
    transcript: transcript || "",
    languageCode: detectedLanguage,
  };
};
