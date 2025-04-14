export const languageModels = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "grok-2-sexy", label: "Grok 2 (Sexy Mode)" },
  { value: "gpt-4o", label: "GPT-4o", disabled: true },
  { value: "grok-3", label: "Grok 3", disabled: true },
  { value: "llama-3-2-11b", label: "Llama 3.2 11B", disabled: true },
  { value: "llama-3-2-90b", label: "Llama 3.2 90B", disabled: true },
  {
    value: "gemini-2-0-flash-lite",
    label: "Gemini 2.0 Flash Lite",
    disabled: true,
  },
  { value: "gemini-2-0-flash", label: "Gemini 2.0 Flash", disabled: true },
  { value: "gemini-2-5-pro", label: "Gemini 2.5 Pro", disabled: true },
  { value: "claude-3-5", label: "Claude 3.5 Sonnet", disabled: true },
  { value: "claude-3-7", label: "Claude 3.7 Sonnet", disabled: true },
] as const;
