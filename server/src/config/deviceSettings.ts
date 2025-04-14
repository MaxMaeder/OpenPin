interface LanguageModel {
  value: string;
  label: string;
}

export interface ModelInterfaces {
  supportText?: boolean;
  supportVision?: boolean;
}

export const LANGUAGE_MODELS = [
  { value: "gpt-4o", label: "GPT-4o", supportVision: true },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", supportText: true },
  { value: "grok-2-sexy", label: "Grok 2 (Sexy Mode)", supportText: true },
  { value: "grok-3", label: "Grok 3" },
  { value: "llama-3-2-11b", label: "Llama 3.2 11B" },
  { value: "llama-3-2-90b", label: "Llama 3.2 90B" },
  { value: "gemini-2-0-flash-lite", label: "Gemini 2.0 Flash Lite" },
  { value: "gemini-2-0-flash", label: "Gemini 2.0 Flash" },
  { value: "gemini-2-5-pro", label: "Gemini 2.5 Pro" },
  { value: "claude-3-5", label: "Claude 3.5 Sonnet" },
  { value: "claude-3-7", label: "Claude 3.7 Sonnet" },
] as const satisfies readonly (LanguageModel & ModelInterfaces)[];

export type LanguageModelKey = (typeof LANGUAGE_MODELS)[number]["value"];

export type VisionModelKey = Extract<
  (typeof LANGUAGE_MODELS)[number],
  { supportVision: true }
>["value"];
export type TextModelKey = Extract<
  (typeof LANGUAGE_MODELS)[number],
  { supportText: true }
>["value"];

export const TRANSLATE_LANGUAGES = [
  { value: "en-US", label: "English (United States)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "de-DE", label: "German" },
  { value: "it-IT", label: "Italian" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "ja-JP", label: "Japanese" },
  { value: "ko-KR", label: "Korean" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "hi-IN", label: "Hindi (India)" },
] as const;

export type TranslateLanguageKey =
  (typeof TRANSLATE_LANGUAGES)[number]["value"];

export const ASSISTANT_VOICES = [
  { value: "davis", label: "The Davis Voice" },
  { value: "andrew", label: "Andrew" },
  { value: "derek", label: "Derek" },
  { value: "nancy", label: "Nancy" },
  { value: "jenny", label: "Jenny" },
] as const;

export type AssistantVoiceKey = (typeof ASSISTANT_VOICES)[number]["value"];

export const CHAT_COMP_PROMPT = `You are the user's assistant running from an AI Pin, and your name is Davis. Keep your responses concise and informal. 
You are holding a conversation with the user, so your responses should be helpful, but not overly wordy, as a rule of thumb, they should be able to be spoken in about 5-10 seconds. 
Don't ask the user any follow-up questions. Respond with pure english text, without any special symbols beyond basic punctuation.

When responding to a user request to change the state of WiFi, after calling the corresponding function, say EXACTLY "WiFi turned [state]" where state is on or off. 
If the function has already been called NEVER call it again.

When responding to a user request to play music, after calling the corresponding function, say "Playing [song name] by [artist] on Apple Music".

When responding to a user request to get directions, respond with the first couple of steps the user needs to take. Tell the user to ask again for next steps ONLY IF you couldn't 
fit all steps concisely in one message. If the user wants directions from their current location, you do NOT need to call the get location function first. 

If the user requests the current weather, call the corresponding function. In addition to user queries about the weather, use this function if the user asks about the UV, wind speed, 
high/low daily temp, current temp/humidity, or when sunrise/sunset is.
You do not need to lookup the user's current location before calling the weather function.
If the corresponding function has already been called, respond to the user with the weather. You do not need to use all of the data in the function response in your response to the user, 
only what they asked for. If the user asks for the weather, simply respond with the conditions (windy, sunny, etc), current temp, and the high and low. 
As a rule of thumb, try to keep your response to one sentence.

If the user requests the latest news, use the search function to look the summary of news up on the internet, and return those summaries to the user.

Example prompt: How's it going Davis? Answer: I'm good, thanks for asking!
Example prompt: What's my status? Answer: you are near 8026 Appleton Rd, the weather is Sunny it is 60 degrees out.
Example prompt: <speech unintelligible> Answer: Sorry, I couldn't hear you, can you repeat that?
`;

export interface DeviceSettings {
  // General
  displayName?: string;
  deviceDisabled: boolean;
  // Assistant
  llmName: TextModelKey;
  visionLlmName: VisionModelKey;
  llmPrompt: string;
  visionLlmPrompt: string;
  messagesToKeep: number;
  clearMessages: boolean;
  // Translate
  myLanguage: TranslateLanguageKey;
  translateLanguage: TranslateLanguageKey;
  translateVolumeBoost: number;
  // Voice
  voiceName: AssistantVoiceKey;
  voiceSpeed: number;
}

export const INIT_DEVICE_SETTINGS: DeviceSettings = {
  // General
  deviceDisabled: false,
  // Assistant
  llmName: "gpt-4o-mini",
  visionLlmName: "gpt-4o",
  llmPrompt: CHAT_COMP_PROMPT,
  visionLlmPrompt: CHAT_COMP_PROMPT,
  messagesToKeep: 20,
  clearMessages: false,
  // Translate
  myLanguage: "en-US",
  translateLanguage: "es-ES",
  translateVolumeBoost: 1.5,
  // Voice
  voiceName: "davis",
  voiceSpeed: 1.2,
};

export const getModelsForInterface = (
  interfaces: ModelInterfaces
): LanguageModelKey[] => {
  return LANGUAGE_MODELS.filter((model) => {
    if (
      interfaces.supportText &&
      (!("supportText" in model) || !model.supportText)
    )
      return false;
    if (
      interfaces.supportVision &&
      (!("supportVision" in model) || !model.supportVision)
    )
      return false;
    return true;
  }).map((model) => model.value);
};
