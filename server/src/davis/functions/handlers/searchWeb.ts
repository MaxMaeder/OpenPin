import { object, string } from "yup";
import { FunctionHandlerError, FunctionHandlerReturnType } from "..";
import { getSearchResults } from "../../../services/search";

const payloadSchema = object({
  query: string().required(),
});

export const handleSearchWeb = async (
  payload: string
): FunctionHandlerReturnType => {
  let query: string;
  try {
    const parsedPayload = await payloadSchema.validate(JSON.parse(payload));
    query = parsedPayload.query;
  } catch {
    throw new FunctionHandlerError("No web search query provided.");
  }

  const results = await getSearchResults(query);
  return JSON.stringify(results);
};
