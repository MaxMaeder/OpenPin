import _ from "lodash";
import { DeviceData } from "src/dbTypes";

export const LOCATION_UPDATE_INTERVAL = 2 * 60 * 60 * 1000; // 2hrs, in ms

export const shouldUpdateLocation = (data: DeviceData) =>
  _.now() - (data.latestLocationUpdate ?? 0) >= LOCATION_UPDATE_INTERVAL;
