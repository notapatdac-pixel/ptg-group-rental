import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateChatResponse, type ChatMessage } from "@/agent/ai/geminiClient";
import { buildSystemPrompt } from "@/agent/ai/systemPrompts";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, role, pageContext, conversationId, userId } = req.body as {
    message:        string;
    role:           "retailer" | "landlord";
    pageContext?:   string;
    conversationId?: string;
    userId?:        string;
  };

  if (!message || !role) return res.status(400).json({ error: "message and role are required" });

  try {
    // Resolve or create conversation
    let convId = conversationId;
    if (!convId && userId) {
      const { data: newConv } = await serviceSupabase
        .from("ai_conversations")
        .insert({ user_id: userId, role, page_context: pageContext ?? null })
        .select("id")
        .single();
      convId = newConv?.id;
    }

    // Fetch prior messages for context (last 20)
    let history: ChatMessage[] = [];
    if (convId) {
      const { data: msgs } = await serviceSupabase
        .from("ai_messages")
        .select("role, content")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true })
        .limit(20);
      if (msgs) {
        history = msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      }
    }

    const systemPrompt = buildSystemPrompt(role, pageContext);
    const aiResponse = await generateChatResponse(systemPrompt, history, message);

    // Persist both turns
    if (convId) {
      await serviceSupabase.from("ai_messages").insert([
        { conversation_id: convId, role: "user",      content: message    },
        { conversation_id: convId, role: "assistant", content: aiResponse },
      ]);
    }

    return res.status(200).json({ reply: aiResponse, conversationId: convId ?? null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI error";
    console.error("[ai/chat]", msg);
    return res.status(500).json({ error: msg });
  }
}
