import {
  Client,
  GeocodeResult,
  GeolocateResponseData,
  LatLng,
  PlaceType2,
  TravelMode,
  UnitSystem,
} from "@googlemaps/google-maps-services-js";
import { addHours } from "date-fns";
import { stripHtml } from "string-strip-html";

const client = new Client();
const getKey = () => process.env.GOOGLE_KEY as string;

export class MapsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MapsError";
  }
}

export const getLocalTime = async (lat: number, lng: number) => {
  const now = new Date();

  const res = await client.timezone({
    params: {
      timestamp: now.getTime() / 1000, // timestamp in seconds
      location: {
        lat,
        lng,
      },
      key: getKey(),
    },
  });

  if (res.data.status != "OK") {
    return {
      offset: 0,
      timezoneName: "UTC",
      utcTime: now,
      localTime: now,
    };
  }

  const { dstOffset, rawOffset, timeZoneName: timezoneName } = res.data;
  const totalOffset = (dstOffset + rawOffset) / 60 / 60; // Conv. seconds to hrs

  return {
    offset: totalOffset,
    timezoneName,
    utcTime: now,
    localTime: addHours(now, totalOffset),
  };
};

interface GeocodingResponse {
  address: string;
  city?: string;
  plusCode?: string;
  latitude: number;
  longitude: number;
}

const extractCity = (res: GeocodeResult) => {
  const cityComponent = res.address_components.find((component) =>
    component.types.includes(PlaceType2.locality)
  );
  return cityComponent?.short_name;
};

export const getGeocoding = async (
  address: string
): Promise<GeocodingResponse> => {
  const res = await client.geocode({
    params: {
      address,
      key: getKey(),
    },
  });

  const { results } = res.data;
  if (results.length == 0) {
    throw new MapsError("No Geocoding results.");
  }

  const topResult = results[0];

  return {
    address: topResult.formatted_address,
    city: extractCity(topResult),
    plusCode: topResult.plus_code?.global_code,
    latitude: topResult.geometry.location.lat,
    longitude: topResult.geometry.location.lng,
  };
};

export const getRevGeocoding = async (
  lat: number,
  lng: number
): Promise<GeocodingResponse> => {
  const res = await client.reverseGeocode({
    params: {
      latlng: {
        lat,
        lng,
      },
      key: getKey(),
    },
  });

  const { results } = res.data;
  if (results.length == 0) {
    throw new MapsError("No Reverse Geocoding results.");
  }

  const topResult = results[0];

  return {
    address: topResult.formatted_address,
    city: extractCity(topResult),
    plusCode: topResult.plus_code?.global_code,
    latitude: topResult.geometry.location.lat,
    longitude: topResult.geometry.location.lng,
  };
};

interface NearbyPlacesDetails {
  radius: number;
  latitude: number;
  longitude: number;
}

export const getNearbyPlaces = async (
  query: string,
  details: NearbyPlacesDetails
) => {
  const res = await client.textSearch({
    params: {
      query,
      location: {
        lat: details.latitude,
        lng: details.longitude,
      },
      radius: details.radius,
      key: getKey(),
    },
  });

  return res.data.results.map((result) => ({
    name: result.name,
    openNow: result.opening_hours?.open_now,
    description: result.editorial_summary,
    address: result.formatted_address,
    plusCode: result.plus_code?.global_code,
  }));
};

export const getDirections = async (
  origin: string | LatLng,
  destination: string | LatLng,
  mode?: TravelMode,
  units?: UnitSystem
) => {
  const res = await client.directions({
    params: {
      origin,
      destination,
      mode: mode || TravelMode.walking,
      units: units || UnitSystem.imperial,
      key: getKey(),
    },
  });

  const { routes } = res.data;
  if (routes.length == 0) {
    throw new MapsError("No route from origin to destination.");
  }

  const bestRoute = routes[0];
  const routeLeg = bestRoute.legs[0]; // Only ever one leg in our use case

  return {
    fare: bestRoute.fare,
    travelTime: routeLeg.duration.text,
    distance: routeLeg.distance.text,
    instructions: routeLeg.steps.map((step) => ({
      maneuver: stripHtml(step.html_instructions).result,
      distance: step.distance.text,
      duration: step.duration.text,
    })),
  };
};

export interface WiFiAccessPoint {
  macAddress: string;
  signalStrength: number;
  channel: number;
}

export interface WiFiGeolocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const getWiFiLocation = async (
  accessPoints: WiFiAccessPoint[]
): Promise<WiFiGeolocation> => {
  const res = await client.geolocate({
    params: {
      key: getKey(),
    },
    data: {
      considerIp: false,
      wifiAccessPoints: accessPoints,
    },
  });

  const { location, accuracy } = res.data as GeolocateResponseData;

  return {
    latitude: location.lat,
    longitude: location.lng,
    accuracy,
  };
};
