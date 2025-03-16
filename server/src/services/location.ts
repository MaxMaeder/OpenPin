import { now } from "lodash";
import { DeviceData, LocationSource } from "../dbTypes";
import { LOCATION_WORSE_UPDATE_TIME } from "../config";

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const updateDeviceLocation = (
  deviceData: DeviceData,
  locationUpdate: DeviceLocation,
  source: LocationSource
) => {
  const accuracy = deviceData.locationAccuracy;

  if (
    !accuracy ||
    accuracy >= locationUpdate.accuracy || // Accuracy in meters, lower better
    now() >= (deviceData.latestLocationUpdate || 0) + LOCATION_WORSE_UPDATE_TIME
  ) {
    deviceData.latitude = locationUpdate.latitude;
    deviceData.longitude = locationUpdate.longitude;

    deviceData.locationAccuracy = locationUpdate.accuracy;
    deviceData.latestLocationUpdate = now();
    deviceData.locationSource = source;
  }
};
