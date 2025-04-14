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
