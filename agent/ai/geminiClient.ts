import { GoogleGenAI } from "@google/genai";

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

const DEFAULT_TEMPERATURE = 0.35;

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!_client) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set");
    _client = new GoogleGenAI({ apiKey: key });
  }
  return _client;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  temperature?: number;
  primaryModel?: string;
  fallbackModel?: string;
}

async function runModel(
  model: string,
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  temperature: number
): Promise<string> {
  const ai = getClient();

  const historyForGemini = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = ai.chats.create({
    model,
    history: historyForGemini,
    config: { systemInstruction: systemPrompt, temperature },
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text ?? "";
}

export async function generateChatResponse(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  options: GenerateOptions = {}
): Promise<string> {
  const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
  const primaryModel = options.primaryModel ?? PRIMARY_MODEL;
  const fallbackModel = options.fallbackModel ?? FALLBACK_MODEL;

  try {
    const text = await runModel(
      primaryModel,
      systemPrompt,
      history,
      userMessage,
      temperature
    );
    console.log(`[geminiClient] served by ${primaryModel}`);
    return text;
  } catch (primaryErr) {
    console.warn(
      `[geminiClient] ${primaryModel} failed, falling back to ${fallbackModel}:`,
      primaryErr instanceof Error ? primaryErr.message : primaryErr
    );
    const text = await runModel(
      fallbackModel,
      systemPrompt,
      history,
      userMessage,
      temperature
    );
    console.log(`[geminiClient] served by ${fallbackModel} (fallback)`);
    return text;
  }
}
