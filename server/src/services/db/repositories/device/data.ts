import { DeviceId } from ".";

export type LocationSource = "gnss" | "wifi" | "cell" | "tower";

export interface DeviceData {
  latestImage?: string;
  latestImageCaptured?: number;
  lastConnected: number;
  latitude: number;
  longitude: number;
  latestLocationUpdate?: number;
  locationAccuracy?: number;
  locationSource?: LocationSource;
  battery: number;
}

export interface DataStore {
  get(deviceId: DeviceId): Promise<DeviceData>;
  update(deviceId: DeviceId, patch: Partial<DeviceData>): Promise<void>;
}

export type DataRepo = DataStore; // no added helpers for now

export const composeDataRepo = (s: DataStore): DataRepo => s;
