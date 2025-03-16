import axios, { AxiosError } from "axios";

const instance = axios.create({
  baseURL: "/",
  //baseURL: "http://localhost:8080",
});

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

interface ErrorResponse {
  error?: string;
}

const handleError = (error: AxiosError): ApiError => {
  if (error.response && error.response.data) {
    const data = error.response.data as ErrorResponse;
    const errorMessage = data.error || "Unknown API error";
    return new ApiError(errorMessage);
  }

  return new ApiError("An unexpected error occurred");
};

let authToken: string | undefined;

const api = {
  setAuthToken: (newToken?: string) => {
    authToken = newToken;
    if (!authToken) delete instance.defaults.headers.common["Authorization"];
    else
      instance.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
  },
  loginUser: async (username: string, password: string): Promise<string> => {
    try {
      const res = await instance.post("/api/dash/login", {
        username,
        password,
      });

      return res.data.token;
    } catch (error) {
      throw handleError(error as AxiosError<unknown>);
    }
  },
  uploadFirmware: async (deviceId: string, binaryFile: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("deviceId", deviceId);
      formData.append("file", binaryFile);

      await instance.post("/api/dash/firmware-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      throw handleError(error as AxiosError<unknown>);
    }
  },
  getMediaDownloadUrl: (mediaName: string) =>
    `/api/dash/media-download/${mediaName}?token=${authToken}`,
};

export default api;
