import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;

// Primary model and verified fallback aliases supported by @google/genai
const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-2.5-flash";

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: apiKey.trim() });
  }
  return genAIClient;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
}

/**
 * Generate structured content using Gemini with timeout, error handling, and model fallback
 */
export async function generateWithGemini(
  prompt: string,
  systemInstruction?: string,
  preferredModel?: string,
  timeoutMs = 35000
): Promise<string> {
  const ai = getGenAIClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const modelToUse = preferredModel || PRIMARY_MODEL;

  const executeCall = async (model: string): Promise<string> => {
    const apiCallPromise = ai.models.generateContent({
      model,
      contents: prompt,
      config: systemInstruction
        ? {
            systemInstruction,
            temperature: 0.2,
          }
        : {
            temperature: 0.2,
          },
    });

    // Timeout race
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Gemini request timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    const response = await Promise.race([apiCallPromise, timeoutPromise]);
    const text = response.text;
    if (!text || !text.trim()) {
      throw new Error("Gemini returned an empty text response.");
    }
    return text;
  };

  try {
    return await executeCall(modelToUse);
  } catch (primaryErr: any) {
    console.warn(`[Gemini Provider] Call failed with model ${modelToUse}:`, primaryErr?.message || primaryErr);
    
    // If different from fallback, attempt fallback model
    if (modelToUse !== FALLBACK_MODEL) {
      try {
        console.info(`[Gemini Provider] Retrying with fallback model ${FALLBACK_MODEL}...`);
        return await executeCall(FALLBACK_MODEL);
      } catch (fallbackErr: any) {
        throw new Error(
          `AI generation failed with primary model (${primaryErr?.message}) and fallback model (${fallbackErr?.message})`
        );
      }
    }

    throw primaryErr;
  }
}
