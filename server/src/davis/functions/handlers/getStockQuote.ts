import { object, string } from "yup";
import { FunctionHandlerError, FunctionHandlerReturnType } from "..";
import { getStockQuote } from "../../../services/markets";

const payloadSchema = object({
  symbol: string().required(),
});

export const handleGetStockQuote = async (
  payload: string
): FunctionHandlerReturnType => {
  let symbol: string;
  try {
    const parsedPayload = await payloadSchema.validate(JSON.parse(payload));
    symbol = parsedPayload.symbol;
  } catch {
    throw new FunctionHandlerError("Stock symbol is invalid.");
  }

  const quote = await getStockQuote(symbol);

  const dollarsf = (dollars: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(dollars);

  const returnValue = JSON.stringify({
    current: dollarsf(quote.c),
    high: dollarsf(quote.h),
    low: dollarsf(quote.l),
    open: dollarsf(quote.o),
    preClose: dollarsf(quote.pc),
  });

  return {
    returnValue,
    audioComponents: [],
  };
};
