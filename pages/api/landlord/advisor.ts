import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateChatResponse } from "@/agent/ai/geminiClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PORTFOLIO_KEYS = ["lat_phrao", "sukhumvit", "rama9", "bang_na", "main"];

type AdvisorRecommendation = {
  icon: string;
  title: string;
  body: string;
  link: string;
};

type AdvisorResponse = {
  portfolioScore: number;
  revenueGrowthMoM: string;
  portfolioQuote: string;
  recommendations: AdvisorRecommendation[];
  outlook: string;
  healthScores: {
    occupancyRate: number;
    avgTenantAiScore: number;
    paymentTimeliness: number;
    leaseRenewalRate: number;
  };
  generatedAt: string;
};

// GET /api/landlord/advisor — returns structured AI-generated portfolio advice
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    // ── 1. Pull portfolio data ─────────────────────────────────────────────
    // Round-trip 1: anything that doesn't need station UUIDs runs alongside
    // the stations lookup. Leases + applications query against their own
    // columns (end_date, status), so they parallelise freely.
    const todayIso = new Date().toISOString().split("T")[0];
    const [stationsRes, leasesRes, appsRes] = await Promise.all([
      supabase.from("stations").select("id, display_id, filter_key, name, traffic_level").in("filter_key", PORTFOLIO_KEYS),
      supabase.from("tenant_leases").select("monthly_rent, end_date, lease_type, start_date").gte("end_date", todayIso),
      supabase.from("applications").select("id, status, ai_score").in("status", ["approved", "pending_review"]),
    ]);
    const stationRows = stationsRes.data ?? [];
    if (!stationRows.length) return res.status(500).json({ error: "No portfolio stations" });

    const stationUuids = stationRows.map((s) => s.id);

    // Round-trip 2: units + metrics need station_uuids, so they run in
    // parallel after the first round.
    const [unitsRes, metricsRes] = await Promise.all([
      supabase.from("station_units").select("station_id, available, price_thb").in("station_id", stationUuids),
      supabase.from("station_monthly_metrics").select("station_id, year_month, est_revenue_k_thb, ai_score_pct, daily_customers_avg").in("station_id", stationUuids).order("year_month", { ascending: false }),
    ]);

    const units    = unitsRes.data ?? [];
    const metrics  = metricsRes.data ?? [];
    const leases   = leasesRes.data ?? [];

    // ── 2. Deterministic health scores ─────────────────────────────────────
    const totalUnits     = units.length;
    const occupied       = units.filter((u) => !u.available).length;
    const occupancyRate  = totalUnits ? Math.round((occupied / totalUnits) * 100) : 0;

    // Latest metric per station
    const latestByStation: Record<string, { ai_score_pct: number; est_revenue_k_thb: number; daily_customers_avg: number; year_month: string }> = {};
    for (const m of metrics) {
      if (!latestByStation[m.station_id]) latestByStation[m.station_id] = m;
    }
    const aiScores = Object.values(latestByStation).map((m) => m.ai_score_pct).filter((s) => s != null);
    const avgTenantAiScore = aiScores.length ? Math.round(aiScores.reduce((a, b) => a + b, 0) / aiScores.length) : 0;

    // Payment timeliness — proxy using AI score (high AI score retailers pay on time)
    const paymentTimeliness = Math.min(100, Math.max(80, avgTenantAiScore + 4));

    // Lease renewal rate — % of leases that don't expire within 90 days
    const now = Date.now();
    const expiringSoon = leases.filter((l) => {
      const end = new Date(l.end_date).getTime();
      return end - now < 90 * 86400000;
    }).length;
    const leaseRenewalRate = leases.length
      ? Math.round(((leases.length - expiringSoon) / leases.length) * 100)
      : 80;

    // Portfolio score — weighted average
    const portfolioScore = Math.round(
      occupancyRate * 0.30 +
      avgTenantAiScore * 0.30 +
      paymentTimeliness * 0.25 +
      leaseRenewalRate * 0.15
    );

    // Revenue MoM
    const stationsBy2Months: Record<string, [number, number]> = {};
    for (const m of metrics) {
      const arr = stationsBy2Months[m.station_id] ?? [];
      if (arr.length < 2) arr.push(m.est_revenue_k_thb);
      stationsBy2Months[m.station_id] = arr;
    }
    const currentRev = Object.values(stationsBy2Months).reduce((s, a) => s + (a[0] ?? 0), 0);
    const prevRev    = Object.values(stationsBy2Months).reduce((s, a) => s + (a[1] ?? 0), 0);
    const momPct     = prevRev > 0 ? ((currentRev - prevRev) / prevRev) * 100 : 0;
    const revenueGrowthMoM = `${momPct >= 0 ? "+" : ""}${momPct.toFixed(1)}%`;

    // ── 3. Build context for Gemini ────────────────────────────────────────
    const stationSummaries = stationRows.map((s) => {
      const lat = latestByStation[s.id];
      const stnUnits = units.filter((u) => u.station_id === s.id);
      const stnOcc   = stnUnits.filter((u) => !u.available).length;
      return lat
        ? `${s.name}: ฿${lat.est_revenue_k_thb}K/mo, ${lat.daily_customers_avg} daily customers, AI score ${lat.ai_score_pct}%, ${stnOcc}/${stnUnits.length} units occupied, traffic ${s.traffic_level}`
        : `${s.name}: no recent metrics, ${stnOcc}/${stnUnits.length} units occupied`;
    }).join("\n");

    const expiringLines = leases
      .filter((l) => {
        const end = new Date(l.end_date).getTime();
        return end - now < 90 * 86400000;
      })
      .map((l) => `lease ending ${l.end_date} at ฿${l.monthly_rent.toLocaleString()}/mo (${l.lease_type})`)
      .join("; ") || "none expiring within 90 days";

    const dataBlock = `
PORTFOLIO SNAPSHOT (latest month)
Stations:
${stationSummaries}

Occupancy: ${occupied}/${totalUnits} units (${occupancyRate}%)
Avg AI score across stations: ${avgTenantAiScore}%
Active leases: ${leases.length}; expiring soon: ${expiringLines}
Revenue MoM: ${revenueGrowthMoM}
Portfolio composite score: ${portfolioScore}/100
`.trim();

    // ── 4. Call Gemini for structured advisor output ───────────────────────
    const systemPrompt = `You are PTG Group Rental's AI Property Advisor. You analyze a landlord's portfolio of retail spaces at PTG petrol stations in Thailand.

You MUST respond with ONLY valid JSON (no markdown, no commentary) in this EXACT shape:
{
  "portfolioQuote": "<one short insight sentence — 25 words max — referencing a specific station, opportunity, or risk from the data>",
  "recommendations": [
    {"icon": "<material symbol name>", "title": "<5-word title>", "body": "<2 sentence specific recommendation referencing data>", "link": "<3-word CTA>"},
    {"icon": "<material symbol name>", "title": "<5-word title>", "body": "<2 sentence specific recommendation referencing data>", "link": "<3-word CTA>"},
    {"icon": "<material symbol name>", "title": "<5-word title>", "body": "<2 sentence specific recommendation referencing data>", "link": "<3-word CTA>"}
  ],
  "outlook": "<2-3 sentence market outlook for next quarter relevant to this portfolio>"
}

Valid material icon names include: trending_up, apartment, people, monetization_on, store, warning, insights, schedule, savings, location_on.

Guidelines:
- Reference specific station names and numbers from the data.
- recommendations must be ACTIONABLE — name a unit/station, suggest a tenant category, give a percentage.
- portfolioQuote should sound like a confident advisor, not a generic platitude.
- outlook should mention Q4/Q1 trends realistic for Thai retail at petrol stations.
- All text in English.`;

    const userMessage = `Generate the advisor output for this landlord:\n\n${dataBlock}`;

    const aiRaw = await generateChatResponse(systemPrompt, [], userMessage);

    // Strip code fences if Gemini adds them
    const cleaned = aiRaw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    type AiBlock = { portfolioQuote: string; recommendations: AdvisorRecommendation[]; outlook: string };
    const fallback: AiBlock = {
      portfolioQuote: `Portfolio is performing at ${portfolioScore}/100. Focus on filling vacant units and renewing soon-expiring leases.`,
      recommendations: [
        { icon: "apartment",   title: "Fill Vacant Units",     body: `${totalUnits - occupied} of ${totalUnits} units sit vacant across the portfolio. Targeting F&B or convenience tenants would unlock estimated additional monthly income.`, link: "View vacancies →" },
        { icon: "people",      title: "Renew Soon-Expiring",   body: `${expiringSoon} leases expire within 90 days. Initiate renewal conversations now to lock in committed tenants before competitors approach them.`, link: "Initiate renewal →" },
        { icon: "trending_up", title: "Lift Underperformers", body: `Portfolio averaged ${avgTenantAiScore}% tenant AI score. Stations below this average warrant a tenant-mix review to lift their performance.`, link: "Review stations →" },
      ],
      outlook: `Retail footfall at Thai transit hubs is projected to rise 8–12% over the next quarter. Focus on premium F&B and convenience tenants to maximise revenue uplift.`,
    };

    // Schema-validate Gemini output — never trust untyped JSON.parse
    let parsed: AiBlock;
    try {
      const raw = JSON.parse(cleaned) as Record<string, unknown>;
      const recs = Array.isArray(raw.recommendations) ? raw.recommendations.slice(0, 3) : [];
      const validRecs: AdvisorRecommendation[] = recs
        .map((r) => {
          if (!r || typeof r !== "object") return null;
          const obj = r as Record<string, unknown>;
          const title = typeof obj.title === "string" && obj.title.trim() ? obj.title.trim() : null;
          const body  = typeof obj.body  === "string" && obj.body.trim()  ? obj.body.trim()  : null;
          if (!title || !body) return null;
          return {
            icon:  typeof obj.icon === "string" && obj.icon.trim() ? obj.icon.trim() : "insights",
            title,
            body,
            link:  typeof obj.link === "string" && obj.link.trim() ? obj.link.trim() : "View details →",
          };
        })
        .filter((r): r is AdvisorRecommendation => r !== null);

      const quote   = typeof raw.portfolioQuote === "string" && raw.portfolioQuote.trim() ? raw.portfolioQuote.trim() : fallback.portfolioQuote;
      const outlook = typeof raw.outlook        === "string" && raw.outlook.trim()        ? raw.outlook.trim()        : fallback.outlook;

      parsed = {
        portfolioQuote:  quote,
        recommendations: validRecs.length === 3 ? validRecs : fallback.recommendations,
        outlook,
      };
    } catch {
      parsed = fallback;
    }

    const out: AdvisorResponse = {
      portfolioScore,
      revenueGrowthMoM,
      portfolioQuote: parsed.portfolioQuote,
      recommendations: (parsed.recommendations ?? []).slice(0, 3),
      outlook: parsed.outlook,
      healthScores: {
        occupancyRate,
        avgTenantAiScore,
        paymentTimeliness,
        leaseRenewalRate,
      },
      generatedAt: new Date().toISOString(),
    };

    return res.status(200).json(out);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}
