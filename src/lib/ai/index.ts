import { generateWithGemini, isGeminiConfigured } from "./gemini";

export interface AIProvider {
  name: string;
  isAvailable: () => boolean;
  generateStructuredContent: (
    prompt: string,
    systemInstruction?: string,
    timeoutMs?: number
  ) => Promise<string>;
}

// Extensible provider implementation - default to Gemini using @google/genai
export const defaultAIProvider: AIProvider = {
  name: "Google Gemini",
  isAvailable: () => isGeminiConfigured(),
  generateStructuredContent: async (
    prompt: string,
    systemInstruction?: string,
    timeoutMs?: number
  ) => {
    return await generateWithGemini(prompt, systemInstruction, undefined, timeoutMs);
  },
};
