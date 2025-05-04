import axios from "axios";

// Function to get the Bing API key
const getBingKey = () => process.env.BING_KEY as string | undefined;

// Function to get the Brave API key
const getBraveKey = () => process.env.BRAVE_KEY as string;

// Bing Search types
interface BingWebPagesItem {
  name: string;
  snippet: string;
}

interface BingWebPages {
  webSearchUrl: string;
  totalEstimatedMatches: number;
  value: BingWebPagesItem[];
}

interface BingSearchResponse {
  webPages: BingWebPages;
}

// Brave Search types
interface BraveWebPagesItem {
  title: string;
  url: string;
  description: string;
}

interface BraveQuery {
  original: string;
}

interface BraveWebPages {
  type: string;
  results: BraveWebPagesItem[];
}

interface BraveResponse {
  query: BraveQuery;
  web: BraveWebPages;
}

// Common result type for both search engines
interface SearchResult {
  title: string;
  snippet: string;
}

// Bing search implementation
async function bingSearch(query: string): Promise<SearchResult[]> {
  const searchClient = axios.create({
    baseURL: "https://api.bing.microsoft.com/v7.0",
    headers: {
      "Ocp-Apim-Subscription-Key": getBingKey(),
    },
  });

  const res = await searchClient.get("/search", {
    params: {
      q: query,
      mkt: "en-us",
    },
  });

  const { webPages } = res.data as BingSearchResponse;

  return webPages.value.map((page) => ({
    title: page.name,
    snippet: page.snippet,
  }));
}

// Brave search implementation
async function braveSearch(query: string): Promise<SearchResult[]> {
  const searchClient = axios.create({
    baseURL: "https://api.search.brave.com/res/v1/web",
    headers: {
      "X-Subscription-Token": getBraveKey(),
      "Accept": "application/json"
    },
  });

  const res = await searchClient.get("/search", {
    params: {
      q: query,
    },
  });

  const { web } = res.data as BraveResponse;

  return web.results.map((page) => ({
    title: page.title,
    snippet: page.description,
  }));
}

// Combined search implementation
export const getSearchResults = async (query: string): Promise<SearchResult[]> => {
  const bingKey = getBingKey();
  
  try {
    if (bingKey) {
      // If Bing key exists, use Bing search
      return await bingSearch(query);
    } else {
      // Otherwise fall back to Brave search
      return await braveSearch(query);
    }
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
};