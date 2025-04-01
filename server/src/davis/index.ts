// index.ts
import { DeviceData } from "../dbTypes";
import { getLocalTime } from "../services/maps";
import { doChatCompletion } from "../services/completions";
import { formatInTimeZone } from "date-fns-tz";
import { functions, FunctionHandlerError } from "./functions";
import { InputAudioComponent } from "../services/audio";
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
  functionCalls: string[];
  assistantMessage: string;
  audioComponents: InputAudioComponent[];
}

const formatDate = (date: Date) =>
  formatInTimeZone(date, "UTC", "h:mm aaa, MMM do yyyy");
const formatBattery = (percent: number) => `${(percent * 100).toFixed(0)}%`;

const sortComponents = (
  items: InputAudioComponent[]
): InputAudioComponent[] => {
  return items.slice().sort((a, b) => {
    if (a.type === "speech" && b.type !== "speech") {
      return -1;
    } else if (a.type !== "speech" && b.type === "speech") {
      return 1;
    } else {
      return 0;
    }
  });
};

/**
 * Build the system instructions that define the custom query/action syntax.
 * This function also dynamically lists all available functions.
 */
const buildFunctionInstructions = (functions: Array<any>): string => {
  let instructions = `You are Davis, an assistant that can perform two types of operations:

1. QUERY: Use this when you need to retrieve data or information.
   Syntax:

   QUERY
   {
     "name": "<query_name>",
     "arguments": { ... }
   }
   END QUERY

2. ACTION: Use this when you want to trigger an operation that performs an action
   (which might not necessarily return data).
   Syntax:
   ACTION
   {
     "name": "<action_name>",
     "arguments": { ... }
   }
   END ACTION

When you receive results from a QUERY/ACTION call, they will be provided in the following format:

For QUERY:
QUERY
{
  "name": "<query_name>",
  "arguments": { ... }
}
QUERY RESULT
<result data (JSON or plain text)>
END QUERY

For ACTION:
ACTION
{
  "name": "<action_name>",
  "arguments": { ... }
}
ACTION RESULT
<result data (JSON or plain text)>
END ACTION

Please use the above syntax for any calls you wish to perform. Each call must start and end with the correct uppercase text, as defined above.

Implicity call the required QUERY(s) and/or ACTION(s) you need to respond to the user.
Ex: user asks directions -> you run directions query -> you respond to user

Simply output the correct syntax for your desired QUERY(s) or ACTION(s) in your message for the user.
The system will detect this, run the QUERY(s) or perform the ACTION(s), and send you another message with the results.
Use these results to respond to the users message, or make more calls.

The available QUERY(s) you can run and ACTION(s) you can take are as follows:
`;
  functions.forEach(fn => {
    const name = fn.definition.name;
    const description = fn.definition.description;
    const params = fn.definition.parameters
      ? JSON.stringify(fn.definition.parameters, null, 2)
      : "No parameters";
    instructions += `- ${name}: ${description}. Parameters: ${params}\n`;
  });
  return instructions;
};

/**
 * Parses the assistant's output looking for our QUERY/ACTION blocks.
 * Expected blocks are of the form:
 *
 * QUERY
 * { ...json... }
 * END QUERY
 *
 * ACTION
 * { ...json... }
 * END ACTION
 *
 * Returns an array of parsed calls with the type and JSON content.
 */
type ParsedCall = {
  type: "query" | "action";
  json: any;
};

const parseFunctionCalls = (message: string): ParsedCall[] => {
  const calls: ParsedCall[] = [];
  const regex = /(QUERY|ACTION)\s*([\s\S]*?)\s*END\s*(QUERY|ACTION)/gi;
  let match;
  while ((match = regex.exec(message)) !== null) {
    const typeStart = match[1].toLowerCase();
    const content = match[2].trim();
    // (Assume the opening and closing block types match)
    try {
      const json = JSON.parse(content);
      if (json && json.name) {
        calls.push({
          type: typeStart as "query" | "action",
          json,
        });
      }
    } catch (e) {
      console.error("Failed to parse function call JSON:", e);
    }
  }
  return calls;
};

export const doDavis = async (
  davisDetails: DavisDetails
): Promise<DavisResponse> => {
  const functionCallsMade: string[] = [];
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

    // Build system prompt with our new instructions plus device context.
    let { llmPrompt, visionLlmPrompt } = davisDetails.deviceSettings;
    const functionInstructions = buildFunctionInstructions(functions);
    llmPrompt = functionInstructions + "\n\n" + llmPrompt;
    [llmPrompt, visionLlmPrompt] = addDeviceContext(llmPrompt, llmPrompt);

    const audioComponents: InputAudioComponent[] = [];

    for (let i = 0; i < CHAT_COMP_MAX_CALLS; i++) {
      console.log(msgContext)

      const { message: assistantMessage, msgContext: updatedMsgContext } =
        await doChatCompletion(
          {
            llmPrompt,
            visionLlmPrompt,
          },
          msgContext,
          [], // We no longer need to pass function definitions separately.
          davisDetails.recognizedSpeech,
          davisDetails.imageBuffer
        );

      msgContext = updatedMsgContext;

      // Look for QUERY/ACTION blocks in the assistant's message.
      const parsedCalls = parseFunctionCalls(assistantMessage!);
      if (parsedCalls.length === 0) {
        // No function calls found – this is our final answer.
        assistantResMsg = assistantMessage!;
        return {
          completionCalls: i + 1,
          functionCalls: functionCallsMade,
          assistantMessage: assistantResMsg,
          audioComponents: sortComponents([
            ...audioComponents,
            {
              type: "speech",
              text: assistantMessage || "No response from Davis, please try again",
            },
          ]),
        };
      } else {
        // For every call block, find and run the corresponding function.
        for (const call of parsedCalls) {
          const calledFunction = functions.find(
            (fn) => fn.definition.name === call.json.name
          );
          if (!calledFunction) {
            console.error("No matching function handler found for", call.json.name);
            msgContext.push({
              role: "assistant",
              content: `${call.type.toUpperCase()}\n${JSON.stringify(
                call.json,
                null,
                2
              )}\n${call.type.toUpperCase()} RESULT\n{"error": "No matching function handler found"}\nEND ${call.type.toUpperCase()}`,
            });
            continue;
          }
          try {
            const { returnValue, audioComponents: functionAudioComponents } =
              await calledFunction.handler(
                call.json.arguments,
                davisDetails.deviceId,
                davisDetails.deviceData,
                davisDetails.deviceSettings
              );
            msgContext.push({
              role: "assistant",
              content: `${call.type.toUpperCase()}\n${JSON.stringify(
                call.json,
                null,
                2
              )}\n${call.type.toUpperCase()} RESULT\n${returnValue}\nEND ${call.type.toUpperCase()}`,
            });
            functionCallsMade.push(call.json.name);
            audioComponents.push(...functionAudioComponents);
          } catch (error) {
            console.error(error);
            audioComponents.push({
              type: "speech",
              text: (error as FunctionHandlerError).message,
            });
            msgContext.push({
              role: "assistant",
              content: `${call.type.toUpperCase()}\n${JSON.stringify(
                call.json,
                null,
                2
              )}\n${call.type.toUpperCase()} RESULT\n{"error": "${(error as FunctionHandlerError).message}"}\nEND ${call.type.toUpperCase()}`,
            });
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }

  return {
    completionCalls: CHAT_COMP_MAX_CALLS,
    functionCalls: functionCallsMade,
    assistantMessage: assistantResMsg,
    audioComponents: [
      {
        type: "speech",
        text: "Error getting a response from Davis, please try again",
      },
    ],
  };
};
