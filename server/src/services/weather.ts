import axios from "axios";

type WeatherUnits = "imperial" | "metric";

interface CurrentWeather {
  temp: number;
  humidity: number;
  uvi: number;
  wind_speed: number;
}

interface DailyTemp {
  min: number;
  max: number;
}

interface DailyWeather {
  sunrise: number;
  sunset: number;
  temp: DailyTemp;
  pop: number;
}

interface WeatherResponse {
  current: CurrentWeather;
  daily: DailyWeather[];
}

const getKey = () => process.env.OPEN_WEATHER_KEY as string;

export const getWeather = async (
  lat: number,
  lng: number,
  units?: WeatherUnits
) => {
  const weatherClient = axios.create({
    baseURL: "https://api.openweathermap.org/data/3.0",
    params: {
      appid: getKey(),
    },
  });

  const res = await weatherClient.get("/onecall", {
    params: {
      lat,
      lon: lng,
      units: units || "imperial",
      exclude: "minutely,hourly,alerts",
    },
  });

  const { current, daily } = res.data as WeatherResponse;

  return {
    low: daily[0].temp.min,
    high: daily[0].temp.max,
    probOfPercip: daily[0].pop,
    sunrise: new Date(daily[0].sunrise * 1000),
    sunset: new Date(daily[0].sunset * 1000),
    currentTemp: current.temp,
    currentHumidity: current.humidity,
    currentUvi: current.uvi,
    currentWindSpeed: current.wind_speed,
  };
};
