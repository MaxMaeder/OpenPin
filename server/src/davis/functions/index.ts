import { FunctionDefinition } from "openai/resources";
import { DeviceData, DeviceSettings } from "../../dbTypes";

import { InputAudioComponent } from "../../services/audio";
import { handlePlayMusic } from "./handlers/playMusic";
import { handleGetWeather } from "./handlers/getWeather";
import { handleToggleSetting } from "./handlers/toggleSetting";
import { handleGetLocation } from "./handlers/getLocation";
import { handleSearchWeb } from "./handlers/searchWeb";
import { handleGetNearbyPlaces } from "./handlers/getNearbyPlaces";
import { handleGetDirections } from "./handlers/getDirections";
import { handleGetStockQuote } from "./handlers/getStockQuote";
import { handleGetWolframResponse } from "./handlers/getWolframResponse";
import { handleSearchWikipedia } from "./handlers/searchWikipedia";

export interface FunctionHandlerResponse {
  returnValue: string;
  audioComponents: InputAudioComponent[];
}

export type FunctionHandlerReturnType = Promise<FunctionHandlerResponse>;

interface DavisFunction {
  // Function is only available for a single invocation of the completion
  //  service. This avoids function-calling loops.
  availableOnce?: boolean;
  definition: FunctionDefinition;
  handler: (
    payload: string,
    deviceId: string,
    deviceData: DeviceData,
    deviceSettings: DeviceSettings
  ) => FunctionHandlerReturnType;
}

export class FunctionHandlerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FunctionHandlerError";
  }
}

export const functions: Array<DavisFunction> = [
  {
    availableOnce: true,
    definition: {
      name: "play_music",
      description: "Plays music on the user's device",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "The search term to lookup the song to play. " +
              "Ex: 'Dancing Queen Abba'",
          },
        },
        required: ["query"],
      },
    },
    handler: handlePlayMusic,
  },
  {
    definition: {
      name: "get_weather",
      description:
        "Gets the weather in the specified location, " +
        "or the user's current location if not specified",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description:
              "The location to lookup the weather for, " +
              "such as a city-state pair etc. If the user does not specify a " +
              "location, or requests the weather in their current location, " +
              "do not fill in this parameter",
          },
        },
      },
    },
    handler: handleGetWeather,
  },
  {
    availableOnce: true,
    definition: {
      name: "toggle_wifi",
      description: "Turn's the device's WiFi on/off",
      parameters: {
        type: "object",
        properties: {
          transformation: {
            type: "string",
            description:
              "How to change the state of the WiFi. Either 'on', 'off' " +
              "or 'toggle' to turn WiFi on if off, off if on.",
          },
        },
        required: ["transformation"],
      },
    },
    handler: handleToggleSetting("enableWifi", "WiFi", [
      "turned on",
      "turned off",
    ]),
  },
  {
    definition: {
      name: "get_location",
      description: "Get's the device's current location",
    },
    handler: handleGetLocation,
  },
  {
    definition: {
      name: "search_nearby_places",
      description: "Searches for nearby places by the specified query.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "The search term to lookup nearby places by. " +
              "This can be anything from 'restaurants', to 'FedEx', etc.",
          },
        },
        required: ["query"],
      },
    },
    handler: handleGetNearbyPlaces,
  },
  {
    definition: {
      name: "get_directions",
      description:
        "Gets directions to the specified street address from the " +
        "specified street address, or the user's current location " +
        "if none specified.",
      parameters: {
        type: "object",
        properties: {
          fromAddress: {
            type: "string",
            description:
              "The street address to start the directions from, if the " +
              "user does not specify a location, or requests from their " +
              "current location, do not fill in this parameter.",
          },
          toAddress: {
            type: "string",
            description: "The street address to get directions to.",
          },
        },
        required: ["toAddress"],
      },
    },
    handler: handleGetDirections,
  },
  {
    definition: {
      name: "search_web",
      description:
        "Searches the web for the specified query. " +
        "Use this and Wikipedia to answer all queries related to a  " +
        "specific event in the last 5 years, or anything else " +
        "you are unsure about.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search term to lookup on the web.",
          },
        },
        required: ["query"],
      },
    },
    handler: handleSearchWeb,
  },
  {
    definition: {
      name: "search_wikipedia",
      description:
        "Searches Wikipedia for the specified query. " +
        "Use this and the web to answer all queries related to a  " +
        "specific event in the last 5 years, or anything else " +
        "you are unsure about.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search term to lookup on the web.",
          },
        },
        required: ["query"],
      },
    },
    handler: handleSearchWikipedia,
  },
  {
    definition: {
      name: "stock_quote",
      description: "Gets the market quote for the specified stock symbol.",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "The stock symbol to lookup.",
          },
        },
        required: ["symbol"],
      },
    },
    handler: handleGetStockQuote,
  },
  {
    definition: {
      name: "wolfram",
      description:
        "Processes natural language queries about entities " +
        "in chemistry, physics, geography, history, art, astronomy, and more." +
        "in addition, performs mathematical calculations, date and unit " +
        "conversions, formula solving, etc. Uses WolframAlpha.",
      parameters: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "The input query to WolframAlpha.",
          },
        },
        required: ["input"],
      },
    },
    handler: handleGetWolframResponse,
  },
];
