import { json, Request, Response } from "express";
import createHttpError from "http-errors";
import { doesDeviceExist } from "src/services/database/device/list";
import * as yup from "yup";
import _ from "lodash";
import { getDeviceData } from "src/services/database/device/data";
import { ConditionName, getWeather } from "src/services/weather";
import { getLocalTime, getRevGeocoding } from "src/services/maps";

const reqSchema = yup.object({
  deviceId: yup.string().required(),
});

type WeatherConditions = "rainy" | "thunderstorm" | "cloudy" | "sunny" | "snow";

interface HomeData {
  location?: string;

  temp?: string;
  conditions?: WeatherConditions;

  time: number;
}

export const parseGetHomeData = json();

const convertConditions = (cond: ConditionName): WeatherConditions => {
  switch (cond) {
    case "Rain":
    case "Drizzle":
      return "rainy";
    case "Thunderstorm":
    case "Tornado":
      return "thunderstorm";
    case "Mist":
    case "Smoke":
    case "Ash":
    case "Haze":
    case "Dust":
    case "Fog":
    case "Clouds":
    case "Sand":
    case "Squall":
      return "cloudy";
    case "Clear":
      return "sunny";
    case "Snow":
      return "snow";
  }
};

export const handleGetHomeData = async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    await reqSchema.validate(req.body);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      throw createHttpError(400, err.message);
    }
    throw err;
  }

  const deviceId = req.body.deviceId;
  if (!(await doesDeviceExist(deviceId))) throw createHttpError(404, "Device does not exist");

  const { latitude: lat, longitude: lng } = await getDeviceData(deviceId);

  let [weather, { city }, { localTime }] = await Promise.all([
    getWeather(lat, lng),
    getRevGeocoding(lat, lng),
    getLocalTime(lat, lng),
  ]);

  const tempStr = `${Math.round(weather.currentTemp)} F`;

  // TODO: Temp fix
  if (city?.trim() == "Deerfield Beach") {
    city = "DFB";
  }

  const resBody: HomeData = {
    location: city,
    temp: tempStr,
    conditions: convertConditions(weather.currentConditions),
    time: localTime.getTime(),
  };

  res.status(200).send(resBody);
};
