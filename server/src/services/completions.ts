import {
  ChatCompletion,
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  FunctionDefinition,
} from "openai/resources";
import OpenAI from "openai";

export interface CompletionModel {
  endpoint: string;
  name: string;

  supportsTools: boolean;
  systemMsgTransform?: (msg: string) => string;
}

export interface AuthenticatedCompletionModel extends CompletionModel {
  getKey: () => string;
}

export interface SystemMessage {
  role: "system";
  content: string;
}

export interface ToolMessage {
  role: "tool";
  content: string;
  tool_call_id: string;
}

export interface UserMessage {
  role: "user";
  content: string;
  image?: Buffer;
}

export type AssistantToolCall = ChatCompletionMessageToolCall;
export interface AssistantMessage {
  role: "assistant";
  content?: string;
  tool_calls?: AssistantToolCall[];
}

export type CompletionMessage =
  | SystemMessage
  | ToolMessage
  | UserMessage
  | AssistantMessage;

const transformCompletionMsg =
  (model: CompletionModel) =>
  (msg: CompletionMessage): ChatCompletionMessageParam => {
    if (msg.role == "system" && model.systemMsgTransform) {
      return {
        role: "system",
        content: model.systemMsgTransform(msg.content),
      };
    }

    if (msg.role != "user") return msg;

    const content: ChatCompletionContentPart[] = [
      {
        type: "text",
        text: msg.content,
      },
    ];

    if (msg.image) {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${msg.image.toString("base64")}`,
        },
      });
    }

    return {
      role: "user",
      content,
    };
  };

export class NoCompletionError extends Error {
  constructor(message: string = "No completion received from model") {
    super(message);
    this.name = "NoCompletionError";
  }
}

const parseResponse = (res: ChatCompletion): AssistantMessage => {
  if (!res.choices[0]) throw new NoCompletionError();

  return {
    role: "assistant",
    content: res.choices[0].message.content ?? undefined,
    tool_calls: res.choices[0].message.tool_calls,
  };
};

const getCompletion = async (
  model: AuthenticatedCompletionModel,
  msgs: ChatCompletionMessageParam[],
  tools: ChatCompletionTool[]
): Promise<AssistantMessage> => {
  if (!model.supportsTools) {
    tools = [];
  }

  const body = {
    messages: msgs,
    model: model.name,
    tools,
  };

  const options = {
    path: model.endpoint,
  };

  const res = await new OpenAI({
    apiKey: model.getKey(),
  }).chat.completions.create(body, options);

  return parseResponse(res);
};

export const doChatCompletion = async (
  model: AuthenticatedCompletionModel,
  msgs: CompletionMessage[],
  functions: FunctionDefinition[]
): Promise<AssistantMessage> => {
  const transformedMsgs = msgs.map(transformCompletionMsg(model));

  const tools: ChatCompletionTool[] = functions.map((fn) => ({
    type: "function",
    function: fn,
  }));

  return await getCompletion(model, transformedMsgs, tools);
};
