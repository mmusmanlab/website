import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

export async function generateWithGemini(
  prompt: string,
  systemInstruction?: string,
  modelName = "gemini-3.8-flash"
): Promise<string> {
  const ai = getGenAIClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: systemInstruction
      ? {
          systemInstruction,
          temperature: 0.3,
        }
      : {
          temperature: 0.3,
        },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned empty text response.");
  }

  return text;
}
