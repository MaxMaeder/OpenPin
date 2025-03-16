import axios from "axios";

const getKey = () => process.env.WOLFRAM_KEY as string;

const getClient = () =>
  axios.create({
    baseURL: "https://www.wolframalpha.com/api/v1",
    params: {
      appid: getKey(),
    },
  });

export const getWolframResponse = async (input: string) => {
  const client = getClient();

  const response = await client.get("/llm-api", {
    params: {
      input,
    },
  });

  return response.data as string;
};
