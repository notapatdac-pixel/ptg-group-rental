import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

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

export async function generateChatResponse(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const ai = getClient();

  const historyForGemini = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = ai.chats.create({
    model: MODEL,
    history: historyForGemini,
    config: { systemInstruction: systemPrompt },
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text ?? "";
}
