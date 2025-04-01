import { FieldValue } from "firebase-admin/firestore";

// export type DeviceMessages = {
//   msgs: Message[];
// };

export type UserId = string;
export type DeviceId = string;

export type UserData = {
  deviceIds: DeviceId[];
};

export type PairRequest = {
  userId: UserId;
  createdAt: Date;
}

export type LocationSource = "gnss" | "wifi" | "cell" | "tower";

export type DeviceData = {
  latestImage?: string;
  latestImageCaptured?: number;
  lastConnected: number;
  latitude: number;
  longitude: number;
  latestLocationUpdate?: number;
  locationAccuracy?: number;
  locationSource?: LocationSource;
  battery: number;
};

export type WifiNetwork = {
  ssid: string;
  password?: string;
};

type FirestoreUpdate<T> = {
  [P in keyof T]?: T[P] | FieldValue;
};