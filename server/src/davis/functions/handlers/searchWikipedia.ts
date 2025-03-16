import { object, string } from "yup";
import { FunctionHandlerError, FunctionHandlerReturnType } from "..";
import wiki from "wikipedia";

interface WikiSearchResult {
  title: string;
  pageid: number;
}

const payloadSchema = object({
  query: string().required(),
});

export const handleSearchWikipedia = async (
  payload: string
): FunctionHandlerReturnType => {
  let query: string;
  try {
    const parsedPayload = await payloadSchema.validate(JSON.parse(payload));
    query = parsedPayload.query;
  } catch {
    throw new FunctionHandlerError("No wikipedia query provided.");
  }

  const searchResults = await wiki.search(query, {
    limit: 2,
  });

  const resultsSummary = await Promise.all(
    (searchResults.results as WikiSearchResult[]).map(async ({ title }) => {
      const page = await wiki.page(title);

      const summary = await page.summary();

      return {
        title,
        summary: summary.extract,
      };
    })
  );

  return {
    returnValue: JSON.stringify(resultsSummary),
    audioComponents: [],
  };
};
