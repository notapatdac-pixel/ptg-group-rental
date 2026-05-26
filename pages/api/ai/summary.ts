import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateChatResponse } from "@/agent/ai/geminiClient";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/ai/summary
// body: { stationFilterKey, storeFilterKey, pageData, userId, role, pageContext }
// pageData = the actual numbers/text from the current page view (changes with filter)
// Returns: { summary: string }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { stationFilterKey, storeFilterKey, pageData, userId, role, pageContext } = req.body as {
    stationFilterKey?: string;
    storeFilterKey?:   string;
    pageData?:         string;
    userId?:           string | null;
    role:              "retailer" | "landlord";
    pageContext:       string;
  };

  try {
    // ── Optional: fetch retailer profile for personalisation ─────────────────
    let profileLine = "";
    if (userId) {
      const { data: profile } = await serviceSupabase
        .from("retailer_profiles")
        .select("business_name, category, experience, num_stores")
        .eq("user_id", userId)
        .single();
      if (profile) {
        profileLine =
          `\nRetailer account: ${profile.business_name} (${profile.category}),` +
          ` ${profile.experience} experience, ${profile.num_stores} stores.`;
      }
    }

    // ── Build the prompt ─────────────────────────────────────────────────────
    // pageData comes from the page and already reflects the active store/station filter.
    // If not provided (legacy), fall back to a generic context string.
    const dataBlock = pageData
      ? `${pageData}${profileLine}`
      : `Page: ${pageContext}${profileLine}`;

    const systemPrompt =
      `You are an AI advisor embedded in a commercial real estate platform for PTG Energy ` +
      `stations in Thailand. Always respond in English only. Be concise, specific, and ` +
      `data-driven. Maximum 3 sentences. Do not repeat the numbers back verbatim — ` +
      `interpret them and give an actionable recommendation.`;

    const userMessage =
      `Generate an advisory insight for a ${role} currently viewing: ${pageContext}.\n` +
      `Current filter — station: ${stationFilterKey ?? "all"}, store: ${storeFilterKey ?? "all"}.\n` +
      `Data:\n${dataBlock}\n` +
      `Give a concise English insight with one specific action the ${role} should take.`;

    const summary = await generateChatResponse(systemPrompt, [], userMessage);
    return res.status(200).json({ summary });

  } catch {
    return res.status(500).json({ error: "Failed to generate summary" });
  }
}
