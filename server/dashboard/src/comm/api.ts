import axios, { AxiosError } from "axios";
import { User } from "src/state/slices/authSlice";

const instance = axios.create({
  baseURL: "/",
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

const api = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      //console.log(email, password);
      const { data } = await instance.post<{ user: User }>("/api/dash/auth/login", {
        email,
        password,
      });
      return data.user;
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  },

  signup: async (email: string, password: string): Promise<User> => {
    try {
      const { data } = await instance.post<{ user: User }>("/api/dash/auth/signup", {
        email,
        password,
      });
      return data.user;
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  },

  me: async (): Promise<User> => {
    try {
      const { data } = await instance.get<User>("/api/dash/auth/me");
      return data;
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await instance.post("/api/dash/auth/logout");
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    try {
      await instance.post("/auth/reset-password", { email });
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  },
  getMediaDownloadUrl: (_: string, mediaName: string) =>
    //`/api/dash/media-download/${mediaName}?token=${token}`,
    `/api/dash/media-download/${mediaName}`,
  getPairQrUrl: (token: string) => `/api/dash/pair-qr.png?token=${token}`,
};

export default api;
