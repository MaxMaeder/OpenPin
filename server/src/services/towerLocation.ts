import axios from "axios";
import { DeviceLocation } from "./location";

const genAuthHeader = () => {
  const key = process.env.HOLOGRAM_KEY as string;
  return `Basic ${Buffer.from(`apikey:${key}`).toString("base64")}`;
};

const hologramClient = axios.create({
  baseURL: "https://dashboard.hologram.io/api/1",
  headers: {
    Authorization: genAuthHeader(),
  },
});

interface HologramDevLastSession {
  latitude: number;
  longitude: number;
  range: number;
}

interface HologramDevData {
  lastsession: HologramDevLastSession;
}

interface HologramDevRes {
  data: HologramDevData;
}

export const getCellTowerLocation = async (
  hologramId: string
): Promise<DeviceLocation> => {
  const res = await hologramClient.get(`/devices/${hologramId}`);

  if (!res.data?.data?.lastsession) {
    throw Error("Device location is unknown in Hologram");
  }

  const resData = res.data as HologramDevRes;

  const { latitude, longitude, range } = resData.data.lastsession;

  return {
    latitude,
    longitude,
    accuracy: range,
  };
};
