import { getLocalTime, LocalTime } from "../services/maps";
import {
  AssistantToolCall,
  AuthenticatedCompletionModel,
  CompletionMessage,
  doChatCompletion,
} from "../services/completions";
import { formatInTimeZone } from "date-fns-tz";
import { functions, FunctionHandlerError } from "./functions";
import { COMP_MAX_CALLS, COMP_MODELS } from "../config/davis";
import { DeviceContext } from "src/endpoints/device/voice/common";
import { DeviceNote, getDeviceNotes } from "src/services/database/device/notes";
import { COMP_CALLS_EXCEEDED_MSG } from "src/config/davis";
import { getNoteSlug } from "./functions/handlers/upsertNote";
import { WithId } from "src/services/database/device/content";
import { addHours } from "date-fns/addHours";

interface CompletionPrompt {
  text: string;
  vision: string;
}

export interface DavisDetails {
  context: DeviceContext;
  userMsg: string;
  userImg?: Buffer;
}

export interface DavisToolContext extends DeviceContext {
  time: LocalTime;
  notes: WithId<DeviceNote>[];
}

export interface DavisResponse {
  completionCalls: number;
  toolCalls: string[];
  assistantMessage: string;
}

class DavisEngine {
  private readonly context: DeviceContext;

  private readonly userMsg: string;
  private readonly userImg?: Buffer;

  private time?: LocalTime;
  private notes?: WithId<DeviceNote>[];
  // private prompt?: CompletionPrompt;

  private completionMsgs: CompletionMessage[] = [];

  constructor(details: DavisDetails) {
    this.context = details.context;
    this.userMsg = details.userMsg;
    this.userImg = details.userImg;
  }

  /**
   * Gets the local time, tz, etc from device location
   */
  private async getTime() {
    // If the location is not known, we'll be at (lat: 0, lng: 0), which is GMT (tz: 0)
    // which is a good fallback
    const { latitude, longitude } = this.context.data;
    this.time = await getLocalTime(latitude, longitude);
  }

  /**
   * Gets all device notes from DB
   */
  private async getNotes() {
    const results = await getDeviceNotes(this.context.id, {
      limit: 1000, // Fetch all notes
    });

    this.notes = results.entries;
  }

  private static formatDate(date: Date) {
    return formatInTimeZone(date, "UTC", "h:mm aaa, MMM do yyyy");
  }

  private static formatBattery(percent: number) {
    return `${(percent * 100).toFixed(0)}%`;
  }

  private static formatNotes(notes: DeviceNote[], tzOffset: number) {
    return notes
      .map(
        (note) =>
          `Note slug: ${getNoteSlug(note)},\n` +
          `name: ${note.title}, ` +
          `date: ${this.formatDate(addHours(note.date, tzOffset))}\n` +
          note.content
      )
      .join("\n");
  }

  /**
   * Adds useful device context to the specified user prompt
   */
  private addPromptContext(userPrompt: string) {
    if (!this.time) throw new Error("LocalTime is null");
    if (!this.notes) throw new Error("Notes are null");

    return `
    UTC time: ${DavisEngine.formatDate(this.time.utcTime)}, 
    local time: ${DavisEngine.formatDate(this.time.localTime)},
    timezone: ${this.time.tsName}.
    Device battery charge: ${DavisEngine.formatBattery(this.context.data.battery)}.

    Notes: \n${DavisEngine.formatNotes(this.notes, this.time.tzOffset)}
    
    ${userPrompt}`;
  }

  private createPrompt(): CompletionPrompt {
    const { llmPrompt, visionLlmPrompt } = this.context.settings;

    return {
      text: this.addPromptContext(llmPrompt),
      vision: this.addPromptContext(visionLlmPrompt),
    };
  }

  private createMsgContext() {
    const hasImg = !!this.userImg;

    const prompt = this.createPrompt();

    this.completionMsgs.push({
      role: "system",
      content: hasImg ? prompt.vision : prompt.text,
    });
    console.log(this.completionMsgs);

    const msgHistory = this.context.msgs.flatMap<CompletionMessage>((msg) => [
      {
        role: "user",
        content: msg.userMsg,
      },
      {
        role: "assistant",
        content: msg.assistantMsg,
      },
    ]);

    this.completionMsgs.push(...msgHistory);

    const userMsg: CompletionMessage = {
      role: "user",
      content: this.userMsg,
      image: this.userImg,
    };

    this.completionMsgs.push(userMsg);
  }

  private getModel(): AuthenticatedCompletionModel {
    const hasImg = !!this.userImg;

    const { llmName: textLlmName, visionLlmName } = this.context.settings;
    const llmName = hasImg ? visionLlmName : textLlmName;

    return COMP_MODELS[llmName] ?? COMP_MODELS["gpt-4o-mini"];
  }

  private getToolContext(): DavisToolContext {
    if (!this.time) throw new Error("LocalTime is null");
    if (!this.notes) throw new Error("Notes is null");

    return {
      ...this.context,
      time: this.time,
      notes: this.notes,
    };
  }

  private async doToolCall(toolCall: AssistantToolCall) {
    const calledFunction = functions.find((fn) => fn.definition.name == toolCall.function.name);

    if (!calledFunction) {
      console.warn("No matching function handler found");

      this.completionMsgs.push({
        role: "tool",
        content: JSON.stringify({
          error: "No matching tool handler found",
        }),
        tool_call_id: toolCall.id,
      });
      return;
    }

    try {
      const returnValue = await calledFunction.handler(
        toolCall.function.arguments,
        this.getToolContext()
      );

      this.completionMsgs.push({
        role: "tool",
        content: returnValue,
        tool_call_id: toolCall.id,
      });
    } catch (error) {
      console.warn("Davis tool call failed", error);

      this.completionMsgs.push({
        role: "tool",
        content: JSON.stringify({
          error: (error as FunctionHandlerError).message,
        }),
        tool_call_id: toolCall.id,
      });
    }
  }

  private async doCompletionIteration(): Promise<string | undefined> {
    const assistantMsg = await doChatCompletion(
      this.getModel(),
      this.completionMsgs,
      functions.map((f) => f.definition)
    );

    this.completionMsgs.push(assistantMsg);
    const toolCalls = assistantMsg.tool_calls || [];

    if (toolCalls.length > 0) {
      await Promise.all(toolCalls.map((toolCall) => this.doToolCall(toolCall)));
      return;
    } else {
      return assistantMsg.content;
    }
  }

  public async run(): Promise<string> {
    await Promise.all([this.getTime(), this.getNotes()]);
    this.createMsgContext();

    for (let i = 0; i < COMP_MAX_CALLS; i++) {
      const result = await this.doCompletionIteration();
      if (result) return result;
    }

    return COMP_CALLS_EXCEEDED_MSG;
  }
}

export const doDavis = async (details: DavisDetails): Promise<string> => {
  const engine = new DavisEngine(details);

  const response = await engine.run();
  return response;
};
