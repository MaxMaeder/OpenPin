import { FunctionDefinition } from "openai/resources";
import { handleGetWeather } from "./handlers/getWeather";
import { handleGetLocation } from "./handlers/getLocation";
import { handleSearchWeb } from "./handlers/searchWeb";
import { handleGetNearbyPlaces } from "./handlers/getNearbyPlaces";
import { handleGetDirections } from "./handlers/getDirections";
import { handleGetStockQuote } from "./handlers/getStockQuote";
import { handleGetWolframResponse } from "./handlers/getWolframResponse";
import { handleSearchWikipedia } from "./handlers/searchWikipedia";
import { DavisToolContext } from "..";
import { handleUpsertNote } from "./handlers/upsertNote";

export type FunctionHandlerReturnType = Promise<string>;

interface DavisFunction {
  // Function is only available for a single invocation of the completion
  //  service. This avoids function-calling loops.
  definition: FunctionDefinition;
  handler: (payload: string, context: DavisToolContext) => FunctionHandlerReturnType;
}

export class FunctionHandlerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FunctionHandlerError";
  }
}

export const functions: Array<DavisFunction> = [
  {
    definition: {
      name: "create_note",
      description:
        "Create a note. Notes serve two purposes: (1) a long-term memory for the assistant (2) a way to share long content with the user. " +
        "Example uses of notes: 'Add a reminder to pick up dry cleaning', 'Remember I'm allergic to peanuts'," +
        "'create a draft of that speech I was telling you about'",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title of the note to create.",
          },
          content: {
            type: "string",
            description: "The text contents of the note.",
          },
        },
        required: ["title", "content"],
      },
    },
    handler: handleUpsertNote,
  },
  {
    definition: {
      name: "update_note",
      description: "Updates a note.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "The slug of the note to update.",
          },
          title: {
            type: "string",
            description: "An optional new title for the note.",
          },
          content: {
            type: "string",
            description: "The full, updated text contents of the note.",
          },
        },
        required: ["slug", "content"],
      },
    },
    handler: handleUpsertNote,
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
