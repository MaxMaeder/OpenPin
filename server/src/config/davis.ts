import { AuthenticatedCompletionModel } from "src/services/completions";
import { LanguageModelKey } from "./deviceSettings";

// Max calls to chat completion service in one invocation of davis
export const COMP_MAX_CALLS = 5;
export const COMP_CALLS_EXCEEDED_MSG = `Failed to get a response from Davis in ${COMP_MAX_CALLS} calls.`;

const GROK_SEXY_PROMPT = `You are grok in "sexy mode". Respond to users with short and speakable extremely flirtatious responses.`;

type RequireOne<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;

export const COMP_MODELS: RequireOne<
  Record<LanguageModelKey, AuthenticatedCompletionModel>,
  "gpt-4o-mini"
> = {
  "gpt-4o-mini": {
    endpoint: "https://api.openai.com/v1/chat/completions",
    name: "gpt-4o-mini",
    supportsTools: true,
    getKey: () => process.env.OPENAI_KEY as string,
  },
  "gpt-4o": {
    endpoint: "https://api.openai.com/v1/chat/completions",
    name: "gpt-4o",
    supportsTools: true,
    getKey: () => process.env.OPENAI_KEY as string,
  },
  "grok-2-sexy": {
    endpoint: "https://api.x.ai/v1/chat/completions",
    name: "grok-2",
    supportsTools: false,
    getKey: () => process.env.GROK_KEY as string,
    systemMsgTransform: (_) => GROK_SEXY_PROMPT,
  },
};
