import axios from "axios";

interface StockQuoteResponse {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
}

const getKey = () => process.env.FINNHUB_KEY as string;

const getClient = () =>
  axios.create({
    baseURL: "https://finnhub.io/api/v1",
    params: {
      token: getKey(),
    },
  });

export const getStockQuote = async (symbol: string) => {
  const client = getClient();

  const response = await client.get("/quote", {
    params: {
      symbol,
    },
  });

  return response.data as StockQuoteResponse;
};
