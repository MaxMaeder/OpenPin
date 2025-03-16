import * as jwt from "jsonwebtoken";

import {
  APPLE_KEY_ID,
  APPLE_PRIVATE_KEY,
  APPLE_TEAM_ID,
} from "../../../keys/appleKey";
import { AudioFormat } from "../../../services/audio";
import {
  FunctionHandlerError,
  FunctionHandlerResponse,
  FunctionHandlerReturnType,
} from "..";

import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import listToString from "../../../util/listToString";
import spotifyKey from "../../../keys/spotifyKey";
import { object, string } from "yup";

// eslint-disable-next-line spaced-comment
/// <reference types="@types/apple-music-api" />

const getAppleJwt = () => {
  const now = Math.floor(Date.now() / 1000); // Current Unix time in seconds
  const exp = now + 604800; // Expiration time (1 wk)

  const header = {
    alg: "ES256",
    kid: APPLE_KEY_ID,
  };

  const payload = {
    iss: APPLE_TEAM_ID,
    iat: now,
    exp: exp,
  };

  return jwt.sign(payload, APPLE_PRIVATE_KEY, {
    algorithm: "ES256",
    header: header,
  });
};

const getSpotifyClient = async () => {
  const client = new SpotifyWebApi(spotifyKey);

  const tokenRes = await client.clientCredentialsGrant();
  client.setAccessToken(tokenRes.body.access_token);

  return client;
};

interface ISCRResults {
  data: Array<AppleMusicApi.Song>;
}

const fetchAudio = async (url: string): Promise<Buffer> => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
};

const createCommandResponse = (
  songName: string,
  songArtist: string,
  audioBuffer: Buffer,
  audioFormat: AudioFormat
): FunctionHandlerResponse => {
  return {
    returnValue: JSON.stringify({
      action: "play-start",
      songName,
      songArtist,
    }),
    audioComponents: [
      {
        type: "buffer",
        buffer: audioBuffer,
        format: audioFormat,
        filter: {
          filter: "volume",
          options: "0.25",
        },
      },
    ],
  };
};

const payloadSchema = object({
  query: string().required(),
});

export const handlePlayMusic = async (
  payload: string
): FunctionHandlerReturnType => {
  const spotifyClient = await getSpotifyClient();

  const appleJwt = getAppleJwt();
  const appleMusicClient = axios.create({
    baseURL: "https://api.music.apple.com/v1/",
    headers: { Authorization: `Bearer ${appleJwt}` },
  });

  let query: string;
  try {
    const parsedPayload = await payloadSchema.validate(JSON.parse(payload));
    query = parsedPayload.query;
  } catch {
    throw new FunctionHandlerError("No song search query provided.");
  }

  const searchRes = await spotifyClient.searchTracks(query, {
    limit: 1,
  });

  const searchTracks = searchRes.body.tracks?.items;
  if (!searchTracks || searchTracks.length === 0) {
    throw new FunctionHandlerError("No songs found for search.");
  }

  const topTrack = searchTracks[0];
  if (topTrack.preview_url) {
    return createCommandResponse(
      topTrack.name,
      listToString(topTrack.artists.map((a) => a.name)),
      await fetchAudio(topTrack.preview_url),
      "mp3"
    );
  }

  const topTrackIsrc = topTrack.external_ids.isrc;
  if (!topTrackIsrc) {
    throw new FunctionHandlerError("Searched song does not have a ISRC.");
  }

  const isrcLookupReq = await appleMusicClient.get("catalog/us/songs", {
    params: {
      "filter[isrc]": topTrackIsrc,
    },
  });

  const irscLookupRes = isrcLookupReq.data as ISCRResults;

  if (irscLookupRes.data.length == 0) {
    throw new FunctionHandlerError(
      "Could not find song matching ISRC in Apple Music."
    );
  }

  const trackAttributes = irscLookupRes.data[0].attributes;
  if (!trackAttributes) {
    throw new FunctionHandlerError("Song has no attributes.");
  }

  const trackPreviews = trackAttributes.previews;
  if (!trackPreviews || trackPreviews.length === 0) {
    throw new FunctionHandlerError("Could not find song playback candidate.");
  }

  return createCommandResponse(
    trackAttributes.name,
    trackAttributes.artistName,
    await fetchAudio(trackPreviews[0].url),
    "m4a"
  );
};
