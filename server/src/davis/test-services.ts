import { formatInTimeZone } from "date-fns-tz";
import { getDirections, getGeocoding, getLocalTime } from "../services/maps";
import { getWeather } from "../services/weather";

const formatDate = (date: Date) =>
  formatInTimeZone(date, "UTC", "h:mm aaa, MMM do yyyy");

const run = async () => {
  const time = await getLocalTime(0, 0);
  console.log(time);

  const addDeviceContext = (...prompts: string[]) =>
    prompts.map(
      (prompt) =>
        `
UTC time: ${formatDate(time.utcTime)}, 
local time: ${formatDate(time.localTime)},
timezone: ${time.timezoneName}.

${prompt}`
    );

  console.log(addDeviceContext("pee"));

  await getWeather(0, 0, "imperial");
  await getGeocoding("albany ny");
  console.log(
    await getDirections(
      { lat: 37.558, lng: -77.471 },
      "2700 W Broad St, Richmond, VA 23220, United States"
    )
  );
};
run();
