import axios from "axios";

const getKey = () => process.env.BING_KEY as string;

interface WebPagesItem {
  name: string;
  snippet: string;
}

interface WebPages {
  webSearchUrl: string;
  totalEstimatedMatches: number;
  value: WebPagesItem[];
}

interface SearchResponse {
  webPages: WebPages;
}

export const getSearchResults = async (query: string) => {
  const searchClient = axios.create({
    baseURL: "https://api.bing.microsoft.com/v7.0",
    headers: {
      "Ocp-Apim-Subscription-Key": getKey(),
    },
  });

  const res = await searchClient.get("/search", {
    params: {
      q: query,
      mkt: "en-us",
    },
  });

  const { webPages } = res.data as SearchResponse;

  return webPages.value.map((page) => ({
    title: page.name,
    snippet: page.snippet,
  }));
};
