import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateChatResponse } from "@/agent/ai/geminiClient";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/ai/summary
// body: { stationFilterKey, storeFilterKey, pageData, userId, role, pageContext }
// Returns: { summary: string }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { stationFilterKey, storeFilterKey, pageData, userId, role, pageContext, lang } = req.body as {
    stationFilterKey?: string;
    storeFilterKey?:   string;
    pageData?:         string;
    userId?:           string | null;
    role:              "retailer" | "landlord";
    pageContext:       string;
    lang?:             "en" | "th";
  };

  const responseLang = lang === "th" ? "th" : "en";

  // Guard: never summarise (or cache) an empty data context — that produces a
  // "no data to analyze" answer that would poison the data-independent cache.
  if (!pageData || !pageData.trim()) {
    return res.status(200).json({
      summary: responseLang === "th" ? "กำลังเตรียมข้อมูล..." : "Preparing data…",
    });
  }

  // Cache key is stable for the same user/page/filter/language combination
  const cacheKey = `${role}::${userId ?? "anon"}::${pageContext}::${stationFilterKey ?? "all"}::${storeFilterKey ?? "all"}::${responseLang}`;
  // Bangkok is UTC+7; use ISO date portion of that offset
  const nowBKK = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const today = nowBKK.toISOString().split("T")[0];

  try {
    // ── Cache read ────────────────────────────────────────────────────────────
    const { data: cached } = await serviceSupabase
      .from("ai_summaries")
      .select("summary")
      .eq("cache_key", cacheKey)
      .eq("cache_date", today)
      .single();

    if (cached?.summary) {
      return res.status(200).json({ summary: cached.summary });
    }

    // ── Optional: fetch retailer profile for personalisation ─────────────────
    let profileLine = "";
    if (userId) {
      const { data: profile } = await serviceSupabase
        .from("retailer_profiles")
        .select("business_name, category")
        .eq("user_id", userId)
        .single();
      if (profile) {
        // Only business identity — NOT tenure/experience/store count, which the
        // user found unhelpful as advice anchors.
        profileLine = `\nBusiness: ${profile.business_name} (${profile.category}).`;
      }
    }

    // ── Build prompt ──────────────────────────────────────────────────────────
    const dataBlock = pageData
      ? `${pageData}${profileLine}`
      : `Page: ${pageContext}${profileLine}`;

    const structure = responseLang === "th"
      ? `Respond entirely in Thai (including the labels). Use this exact structure:\n` +
        `- **ข้อมูลสำคัญ:** [the most important insight from the data]\n` +
        `- **ทำไมจึงสำคัญ:** [business impact or risk]\n` +
        `- **สิ่งที่ควรทำ:** [one specific, actionable recommendation]\n`
      : `Respond in English only. Use this exact structure:\n` +
        `- **Key Finding:** [the most important insight from the data]\n` +
        `- **Why It Matters:** [business impact or risk]\n` +
        `- **What To Do:** [one specific, actionable recommendation]\n`;

    // Persona is role-specific: the retailer may be a small market vendor (plain
    // talk, no jargon); the landlord is a property manager wanting a clear,
    // professional portfolio read (occupancy/vacancy/rent are fine).
    const persona = role === "landlord"
      ? `You are advising a PTG property manager who oversees a portfolio of retail spaces at petrol stations. ` +
        `Write in clear, professional but easy-to-read language focused on portfolio health — ` +
        `revenue, occupancy and vacancy, tenant performance, and what to act on. Be concrete and direct. ` +
        `Normal property terms (occupancy, vacancy, rent, tenant) are fine; avoid heavy finance acronyms (YoY, ROI). `
      : `Your reader may be a small shop owner or market vendor (พ่อค้าแม่ค้า) with no finance background. ` +
        `Write in plain, everyday language — short, concrete sentences about real things ` +
        `(customers, sales, busy days, what to stock). NEVER use finance or analyst jargon ` +
        `(no "conversion rate", "YoY", "MoM", "basket size", "churn", "catchment", "ROI", "margin"). ` +
        `Say it the way a friendly neighbour who runs a successful shop would say it. `;

    const systemPrompt =
      `You are an AI advisor embedded in an analytics platform for PTG Energy stations in Thailand. ` +
      persona +
      `Respond with EXACTLY 3 bullet points, one per line, separated by newline characters. ` +
      `Each bullet must start with "- " and bold the label with **.\n` +
      structure +
      `Bold every number you cite with ** (e.g. **฿324,000**, **+2%**), and explain what the number means in plain words. ` +
      `Do not add any text before or after the 3 bullets. Be specific — ` +
      `use the actual numbers from the data, not vague statements. ` +
      `Only state a difference or trend that the numbers in the data actually show; ` +
      `never invent a contrast, decline, or improvement the data does not support. ` +
      `Do NOT comment on the retailer's years of experience, tenure, or number of stores — ` +
      `focus only on the numbers and the one specific thing to do next. ` +
      `If the data lists recent events (festivals, holidays, paydays, rainy season, school term), ` +
      `use them to explain WHY a number moved in the "Why It Matters" bullet.\n` +
      `IMPORTANT — if the data covers MORE THAN ONE branch or station (a portfolio / "all" view), ` +
      `then in the "What To Do" bullet you MUST name the single weakest or most at-risk branch by its ` +
      `name or station and say exactly what to do about it. If the data covers only ONE branch, ` +
      `focus entirely on that one branch.`;

    const userMessage =
      `Analyze the following data for a ${role} on the "${pageContext}" page.\n` +
      `Active filters — station: ${stationFilterKey ?? "all"}, store: ${storeFilterKey ?? "all"}.\n\n` +
      `Data:\n${dataBlock}\n\n` +
      `Return exactly 3 bullet points as specified. Think analytically: identify what is working, ` +
      `what is at risk, and what the ${role} should do next.`;

    // ── Generate with a single retry ──────────────────────────────────────────
    // Root cause of the "raw data showing instead of a summary" bug: a single failed
    // Gemini call. Retry once, and treat an empty/blank response as a failure too.
    let summary = "";
    for (let attempt = 0; attempt < 2 && !summary.trim(); attempt++) {
      try {
        summary = await generateChatResponse(systemPrompt, [], userMessage);
      } catch {
        summary = "";
      }
    }

    // NEVER cache an empty/failed summary, and NEVER return the raw pageData.
    if (!summary.trim()) {
      const fallback = responseLang === "th"
        ? "ขออภัย ตอนนี้ยังสรุปข้อมูลให้ไม่ได้ ลองรีเฟรชหน้านี้อีกครั้งในอีกสักครู่"
        : "We could not generate a summary right now. Please refresh this page again in a moment.";
      return res.status(200).json({ summary: fallback });
    }

    // ── Cache write (ignore conflict — race condition safe) ───────────────────
    await serviceSupabase
      .from("ai_summaries")
      .upsert({ cache_key: cacheKey, cache_date: today, summary }, { onConflict: "cache_key,cache_date", ignoreDuplicates: true });

    return res.status(200).json({ summary });

  } catch {
    const fallback = responseLang === "th"
      ? "ขออภัย ตอนนี้ยังสรุปข้อมูลให้ไม่ได้ ลองรีเฟรชหน้านี้อีกครั้งในอีกสักครู่"
      : "We could not generate a summary right now. Please refresh this page again in a moment.";
    return res.status(200).json({ summary: fallback });
  }
}
