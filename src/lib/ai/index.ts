import { generateWithGemini } from "./gemini";

export interface AIProvider {
  generateStructuredContent: (prompt: string, systemInstruction?: string) => Promise<string>;
}

// Extensible provider implementation - default to Gemini using @google/genai
export const defaultAIProvider: AIProvider = {
  generateStructuredContent: async (prompt: string, systemInstruction?: string) => {
    return await generateWithGemini(prompt, systemInstruction);
  },
};
