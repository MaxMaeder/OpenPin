import { DeviceData } from "../dbTypes";
import { getLocalTime } from "../services/maps";
import { doChatCompletion } from "../services/completions";
import { formatInTimeZone } from "date-fns-tz";
import { functions, FunctionHandlerError } from "./functions";
import { ChatCompletionMessageParam } from "openai/resources";
import { CHAT_COMP_MAX_CALLS } from "../config";
import { DeviceSettings } from "src/config/deviceSettings";

export type DavisMessage = {
  role: "system" | "assistant" | "user";
  content: string;
};

interface DavisDetails {
  deviceId: string;
  deviceData: DeviceData;
  deviceSettings: DeviceSettings;
  msgContext: DavisMessage[];
  recognizedSpeech: string;
  imageBuffer: Buffer | undefined;
}

interface DavisResponse {
  completionCalls: number;
  toolCalls: string[];
  assistantMessage: string;
}

const formatDate = (date: Date) =>
  formatInTimeZone(date, "UTC", "h:mm aaa, MMM do yyyy");
const formatBattery = (percent: number) => `${(percent * 100).toFixed(0)}%`;

export const doDavis = async (
  davisDetails: DavisDetails
): Promise<DavisResponse> => {
  const toolCallsMade: string[] = [];
  let assistantResMsg = "ERROR: no response";

  try {
    const { latitude, longitude, battery } = davisDetails.deviceData;
    const time = await getLocalTime(latitude, longitude);

    const addDeviceContext = (...prompts: string[]) =>
      prompts.map(
        (prompt) =>
          `
UTC time: ${formatDate(time.utcTime)}, 
local time: ${formatDate(time.localTime)},
timezone: ${time.timezoneName}.
Device battery charge: ${formatBattery(battery)}.

${prompt}`
      );

    let { msgContext }: { msgContext: ChatCompletionMessageParam[] } =
      davisDetails;

    let { llmPrompt, visionLlmPrompt } = davisDetails.deviceSettings;
    [llmPrompt, visionLlmPrompt] = addDeviceContext(llmPrompt, visionLlmPrompt);

    for (let i = 0; i < CHAT_COMP_MAX_CALLS; i++) {
      const {
        message: assistantMessage,
        toolCalls: assistantToolCalls,
        msgContext: updatedMsgContext,
      } = await doChatCompletion(
        {
          llmPrompt,
          visionLlmPrompt,
        },
        msgContext,
        functions.map((f) => f.definition),
        davisDetails.recognizedSpeech,
        davisDetails.imageBuffer
      );

      msgContext = updatedMsgContext;

      if (assistantToolCalls.length > 0) {
        msgContext.push({
          role: "assistant",
          tool_calls: assistantToolCalls,
        });

        for (const toolCall of assistantToolCalls) {
          toolCallsMade.push(toolCall.function.name);

          const calledFunction = functions.find(
            (fn) => fn.definition.name == toolCall.function.name
          );

          if (!calledFunction) {
            console.error("No matching function handler found");

            msgContext.push({
              role: "tool",
              content: JSON.stringify({
                error: "No matching tool handler found",
              }),
              tool_call_id: toolCall.id,
            });

            continue;
          }

          try {
            const returnValue = await calledFunction.handler(
              toolCall.function.arguments,
              davisDetails.deviceId,
              davisDetails.deviceData,
              davisDetails.deviceSettings
            );

            msgContext.push({
              role: "tool",
              content: returnValue,
              tool_call_id: toolCall.id,
            });
          } catch (error) {
            console.error(error);

            msgContext.push({
              role: "tool",
              content: JSON.stringify({
                error: (error as FunctionHandlerError).message,
              }),
              tool_call_id: toolCall.id,
            });
          }
        }
      } else {
        if (assistantMessage) assistantResMsg = assistantMessage;

        return {
          completionCalls: i + 1,
          toolCalls: toolCallsMade,
          assistantMessage: assistantResMsg,
        };
      }
    }
  } catch (e) {
    console.error(e);
  }

  return {
    completionCalls: CHAT_COMP_MAX_CALLS,
    toolCalls: toolCallsMade,
    assistantMessage: assistantResMsg,
  };
};
