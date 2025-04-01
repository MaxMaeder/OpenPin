import { CHAT_COMP_IMG_MODEL, CHAT_COMP_MODEL } from "../config";

import {
  ChatCompletion,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  FunctionDefinition,
} from "openai/resources";
import { CompletionCreateParams } from "groq-sdk/resources/chat";
import Groq from "groq-sdk";
import OpenAI from "openai";

export interface CompletionModel {
  provider: "openai" | "groq";
  name: string;
}

export interface CompletionResponse {
  message?: string;
  toolCalls: ChatCompletionMessageToolCall[];
  msgContext: ChatCompletionMessageParam[];
}

const getCompletion = async (
  model: CompletionModel,
  msgs: ChatCompletionMessageParam[],
  tools?: ChatCompletionTool[]
): Promise<CompletionResponse> => {
  const parseResponse = (res: ChatCompletion): CompletionResponse => ({
    message: res.choices[0]?.message.content || undefined,
    toolCalls: res.choices[0]?.message.tool_calls || [],
    msgContext: msgs.slice(1), // Skip prompt message
  });

  if (model.provider == "openai") {
    const res = await new OpenAI({
      apiKey: process.env.OPENAI_KEY as string,
    }).chat.completions.create({
      messages: msgs,
      model: model.name,
    });

    console.log(JSON.stringify(res, null, 2));

    return parseResponse(res);
  } else {
    const res = await new Groq({
      apiKey: process.env.GROQ_KEY as string,
    }).chat.completions.create({
      messages: msgs as Array<CompletionCreateParams.Message>,
      model: model.name,
    });

    return parseResponse(res as ChatCompletion);
  }
};

interface CompletionPrompts {
  llmPrompt: string;
  visionLlmPrompt: string;
}

export const doChatCompletion = async (
  prompts: CompletionPrompts,
  msgContext: ChatCompletionMessageParam[],
  functions: FunctionDefinition[],
  userMsg: string,
  userImage: Buffer | undefined
): Promise<CompletionResponse> => {
  const completionModel = userImage ? CHAT_COMP_IMG_MODEL : CHAT_COMP_MODEL;
  const completionMsgs: ChatCompletionMessageParam[] = [];

  completionMsgs.push({
    role: "system",
    content: userImage ? prompts.visionLlmPrompt : prompts.llmPrompt,
  });
  completionMsgs.push(...msgContext);

  if (userImage) {
    completionMsgs.push({
      role: "user",
      content: [
        {
          type: "text",
          text: userMsg,
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${userImage.toString("base64")}`,
          },
        },
      ],
    });
  } else {
    completionMsgs.push({
      role: "user",
      content: userMsg,
    });
  }

  const tools: ChatCompletionTool[] = functions.map((fn) => ({
    type: "function",
    function: fn,
  }));

  return await getCompletion(completionModel, completionMsgs, tools);
};
