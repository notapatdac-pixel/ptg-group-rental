import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { evaluateApplication, type EvaluationResult } from "@/agent/rules/decisionEngine";
import { LEASING_POLICY } from "@/agent/rules/policies";
import { generateChatResponse } from "@/agent/ai/geminiClient";

// ─────────────────────────────────────────────────────────────────────────────
// Three-paradigm decision endpoint (the platform's core "how the leasing
// decision is made" showcase):
//   1. PREDICTIVE  — applications.ai_score (ML match/success score)
//   2. SYMBOLIC    — agent/rules deterministic gate + constraints
//   3. GENERATIVE  — Gemini explains the recommendation in plain language
//
// Failure & control: if the predictive score is missing the symbolic engine
// still runs (routes to review, never auto-approves); if Gemini fails the
// structured decision is still returned. The landlord makes the final call.
// GET /api/landlord/evaluate-application?id=<landlord_or_retailer_display_id>&lang=en|th
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const REQUIRED_FIELDS = LEASING_POLICY.requiredProfileFields;

function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { id, lang } = req.query as { id?: string; lang?: string };
  if (!id) return res.status(400).json({ error: "Missing application id" });
  const responseLang = lang === "th" ? "th" : "en";

  // ── Fetch the application + nested profile/unit/station ────────────────────
  const col = id.startsWith("PTG-APP-") ? "retailer_display_id" : "landlord_display_id";
  const { data: appRow, error: appErr } = await supabase
    .from("applications")
    .select(`
      id, retailer_display_id, landlord_display_id, status, ai_score, est_revenue_thb,
      retailer_profiles ( business_name, category, concept ),
      station_units ( id, unit_code, area_sqm, price_thb, available, station_id,
        stations ( display_id, name ) )
    `)
    .eq(col, id)
    .maybeSingle();

  if (appErr) return res.status(500).json({ error: appErr.message });
  if (!appRow) return res.status(404).json({ error: "Application not found" });

  type Row = {
    id: string; retailer_display_id: string; landlord_display_id: string;
    status: string; ai_score: number | null; est_revenue_thb: number | null;
    retailer_profiles: { business_name: string | null; category: string | null; concept: string | null } | null;
    station_units: {
      id: string; unit_code: string; area_sqm: number | null; price_thb: number | null;
      available: boolean; station_id: string;
      stations: { display_id: string; name: string } | null;
    } | null;
  };
  const a = appRow as unknown as Row;

  const profile = a.retailer_profiles;
  const unit = a.station_units;
  const station = unit?.stations ?? null;

  // ── PREDICTIVE input ───────────────────────────────────────────────────────
  // ai_score is a TEXT column with mixed formats ("92" or "89%") — strip any
  // non-numeric chars before parsing so a "%" suffix doesn't yield NaN.
  const rawScore = a.ai_score as number | string | null;
  const parsedScore = rawScore != null ? parseFloat(String(rawScore).replace(/[^0-9.]/g, "")) : NaN;
  const matchScore = Number.isFinite(parsedScore) ? parsedScore : null;

  // ── SYMBOLIC inputs (hard facts) ───────────────────────────────────────────
  const profileMissingFields = REQUIRED_FIELDS.filter(
    (f) => !((profile as Record<string, unknown> | null)?.[f])
  );
  const rentPerSqm = unit?.price_thb && unit?.area_sqm ? unit.price_thb / unit.area_sqm : null;

  // Station median rent/sqm across that station's units.
  let stationMedianRentPerSqm: number | null = null;
  if (unit?.station_id) {
    const { data: peers } = await supabase
      .from("station_units")
      .select("price_thb, area_sqm")
      .eq("station_id", unit.station_id);
    const perSqm = (peers ?? [])
      .filter((u: { price_thb: number | null; area_sqm: number | null }) => u.price_thb && u.area_sqm)
      .map((u: { price_thb: number; area_sqm: number }) => u.price_thb / u.area_sqm);
    stationMedianRentPerSqm = median(perSqm);
  }

  // ── SYMBOLIC evaluation ────────────────────────────────────────────────────
  const evaluation: EvaluationResult = evaluateApplication({
    businessName: profile?.business_name ?? "Applicant",
    stationName: station?.name ?? "the station",
    matchScore,
    profileMissingFields,
    unitAvailable: unit?.available ?? false,
    rentPerSqm,
    stationMedianRentPerSqm,
  });

  // ── GENERATIVE explanation (graceful fallback) ─────────────────────────────
  const decisionLabel = {
    approve_recommended: "APPROVE recommended",
    review_required: "REVIEW required",
    decline_recommended: "DECLINE recommended",
  }[evaluation.decision];

  const checksText = evaluation.checks
    .map((c) => `- [${c.status.toUpperCase()}] ${c.rule}: ${c.message}`)
    .join("\n");

  const sys =
    `You are PTG Group Rental's leasing decision assistant for a property manager (landlord). ` +
    (responseLang === "th"
      ? `Respond in Thai. `
      : `Respond in English. `) +
    `A deterministic rules engine has already produced the recommendation and the rule checks below. ` +
    `Do NOT change the decision. In 2–3 short sentences, explain to the landlord WHY this is the ` +
    `recommendation, citing the specific rule checks (match score, unit availability, rent band). ` +
    `If a hard rule (e.g. unit unavailable) overrides a strong match score, say so explicitly. ` +
    `End by reminding the landlord they make the final call.`;
  const userMsg =
    `Applicant: ${profile?.business_name ?? "Applicant"} (${profile?.category ?? "—"})\n` +
    `Station/Unit: ${station?.name ?? "?"} ${unit?.unit_code ?? ""}\n` +
    `Predictive match score: ${matchScore ?? "unavailable"}\n` +
    `Recommendation: ${decisionLabel}\n` +
    `Rule checks:\n${checksText}`;

  let explanation = "";
  for (let attempt = 0; attempt < 2 && !explanation.trim(); attempt++) {
    try { explanation = await generateChatResponse(sys, [], userMsg); }
    catch { explanation = ""; }
  }
  if (!explanation.trim()) {
    explanation = responseLang === "th"
      ? "ระบบกฎได้ให้คำแนะนำตามผลตรวจสอบด้านบนแล้ว (คำอธิบายอัตโนมัติไม่พร้อมใช้งานชั่วคราว) — การตัดสินใจขั้นสุดท้ายอยู่ที่เจ้าของพื้นที่"
      : "The rules engine produced this recommendation from the checks above (auto-explanation temporarily unavailable). The landlord makes the final call.";
  }

  return res.status(200).json({
    application: {
      retailerAppId: a.retailer_display_id,
      landlordAppId: a.landlord_display_id,
      status: a.status,
      business: profile?.business_name ?? null,
      category: profile?.category ?? null,
      station: station?.name ?? null,
      unit: unit?.unit_code ?? null,
    },
    // The three separated paradigms, returned as distinct blocks:
    predictive: { matchScore, available: matchScore != null },
    symbolic:   { decision: evaluation.decision, checks: evaluation.checks, rentBand: evaluation.rentBand },
    generative: { explanation, lang: responseLang },
  });
}
