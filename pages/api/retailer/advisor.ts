import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateChatResponse } from "@/agent/ai/geminiClient";
import { RETAILER_STATION_IDS } from "@/lib/retailerStores";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEMO_PROFILE_ID = "55555555-0000-0000-0000-000000000001";
const DEMO_STORE_IDS  = RETAILER_STATION_IDS;

type AdvisorRecommendation = { icon: string; title: string; body: string; link: string };

type AdvisorResponse = {
  patronScore: number;
  revenueGrowthMoM: string;
  liveQuote: string;
  recommendations: AdvisorRecommendation[];
  outlook: string;
  healthScores: {
    revenueGrowth: number;
    conversionRate: number;
    revisitRate: number;
    costRatioHealth: number;
  };
  generatedAt: string;
};

// GET /api/retailer/advisor — returns structured AI advisor output for the retailer
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const [pnlRes, perfRes, retentionRes, segmentsRes, forecastsRes, matchingRes, profileRes] = await Promise.all([
      supabase.from("store_monthly_pnl").select("store_display_id, year_month, revenue_thb, rent_thb, utilities_thb, net_thb").in("store_display_id", DEMO_STORE_IDS).order("year_month", { ascending: false }),
      supabase.from("store_monthly_performance").select("store_display_id, year_month, traffic, orders, conversion_pct, avg_basket_thb, sales_per_sqm_thb, revisit_rate_pct, patron_score").in("store_display_id", DEMO_STORE_IDS),
      supabase.from("store_monthly_retention").select("store_display_id, year_month, new_customers, returning_customers, lapsed_customers, new_mom_pct, returning_mom_pct").in("store_display_id", DEMO_STORE_IDS).order("year_month", { ascending: false }),
      supabase.from("store_customer_segments").select("store_display_id, segment_type, segment_label, share_pct, growth_pct").in("store_display_id", DEMO_STORE_IDS),
      supabase.from("ml_sales_forecasts").select("station_id, predicted_revenue_thb, pct_change_vs_last, confidence_pct, forecast_period").in("station_id", DEMO_STORE_IDS),
      supabase.from("ml_matching_scores").select("station_id, match_pct, match_label, estimated_earn_low_thb, estimated_earn_high_thb").eq("retailer_id", "RET-001").order("match_pct", { ascending: false }).limit(4),
      supabase.from("retailer_profiles").select("business_name, category, num_stores").eq("id", DEMO_PROFILE_ID).single(),
    ]);

    const pnl       = pnlRes.data ?? [];
    const perf      = perfRes.data ?? [];
    const retention = retentionRes.data ?? [];
    const segments  = segmentsRes.data ?? [];
    const forecasts = forecastsRes.data ?? [];
    const matching  = matchingRes.data ?? [];
    const profile   = profileRes.data ?? null;

    // Latest P&L per store
    const latestPnl: Record<string, { revenue: number; rent: number; net: number }> = {};
    for (const p of pnl) {
      if (!latestPnl[p.store_display_id]) {
        latestPnl[p.store_display_id] = { revenue: p.revenue_thb, rent: p.rent_thb, net: p.net_thb };
      }
    }

    // Aggregate KPIs
    const totalRevenue = Object.values(latestPnl).reduce((s, x) => s + x.revenue, 0);
    const totalRent    = Object.values(latestPnl).reduce((s, x) => s + x.rent,    0);
    const totalNet     = Object.values(latestPnl).reduce((s, x) => s + x.net,     0);
    const costRatio    = totalRevenue ? (totalRent / totalRevenue) * 100 : 0;

    // MoM from PnL (sum of latest - sum of prior)
    const byMonth: Record<string, number> = {};
    for (const p of pnl) {
      byMonth[p.year_month] = (byMonth[p.year_month] ?? 0) + p.revenue_thb;
    }
    const months = Object.keys(byMonth).sort();
    const latest = months.at(-1) ? byMonth[months.at(-1)!] : 0;
    const prev   = months.at(-2) ? byMonth[months.at(-2)!] : 0;
    const momPct = prev > 0 ? ((latest - prev) / prev) * 100 : 0;
    const revenueGrowthMoM = `${momPct >= 0 ? "+" : ""}${momPct.toFixed(1)}%`;

    // Average conversion + revisit across stores
    const avgConversion = perf.length ? perf.reduce((s, p) => s + p.conversion_pct, 0) / perf.length : 0;
    const avgRevisit    = perf.length ? perf.reduce((s, p) => s + p.revisit_rate_pct, 0) / perf.length : 0;
    const avgPatron     = perf.length ? Math.round(perf.reduce((s, p) => s + (p.patron_score ?? 0), 0) / perf.length) : 0;

    // Health scores 0-100
    const revenueGrowthScore   = Math.min(100, Math.max(0, Math.round(50 + momPct * 5))); // +0% = 50, +10% = 100
    const conversionScore      = Math.min(100, Math.round(avgConversion * 2));            // 50% conversion → 100
    const revisitScore         = Math.min(100, Math.round(avgRevisit));
    const costRatioHealthScore = Math.min(100, Math.max(0, Math.round(100 - costRatio * 2))); // 0% cost → 100, 50% cost → 0

    // ── Build context for Gemini ─────────────────────────────────────
    const storeSummaries = Object.entries(latestPnl).map(([sid, p]) => {
      const performance = perf.find((x) => x.store_display_id === sid);
      const ret = retention.find((r) => r.store_display_id === sid);
      return `${sid}: revenue ฿${p.revenue.toLocaleString()}, rent ฿${p.rent.toLocaleString()} (${((p.rent / p.revenue) * 100).toFixed(1)}%), ` +
        `${performance ? `${performance.traffic} visitors/day, ${performance.conversion_pct}% conversion, ฿${performance.avg_basket_thb} basket, ${performance.revisit_rate_pct}% revisit, patron score ${performance.patron_score}` : "no perf data"}` +
        `${ret ? `; retention: ${ret.new_customers} new (${ret.new_mom_pct ?? "?"}% MoM), ${ret.returning_customers} returning, ${ret.lapsed_customers} lapsed` : ""}`;
    }).join("\n");

    const segmentSummary = segments
      .filter((s) => s.segment_type === "age")
      .map((s) => `${s.store_display_id} age ${s.segment_label}: ${s.share_pct}% (${s.growth_pct ?? "?"}% growth)`)
      .join("; ");

    const forecastSummary = forecasts.map((f) => `${f.station_id}: predicted ฿${Math.round(f.predicted_revenue_thb).toLocaleString()} next month (${(f.pct_change_vs_last * 100).toFixed(1)}% MoM, ${(f.confidence_pct * 100).toFixed(0)}% confidence)`).join("; ");

    const matchingSummary = matching
      .filter((m) => !DEMO_STORE_IDS.includes(m.station_id))
      .slice(0, 3)
      .map((m) => `${m.station_id}: ${m.match_pct}% ${m.match_label} match, est ฿${m.estimated_earn_low_thb.toLocaleString()}–฿${m.estimated_earn_high_thb.toLocaleString()}/mo`)
      .join("; ");

    const dataBlock = `
RETAILER: ${profile?.business_name ?? "Demo Retailer"} (${profile?.category ?? "—"}), ${profile?.num_stores ?? 2} stores

CURRENT MONTH (latest in DB):
${storeSummaries}

TOTALS: revenue ฿${totalRevenue.toLocaleString()}/mo, rent ฿${totalRent.toLocaleString()}/mo, net profit ฿${totalNet.toLocaleString()}/mo, cost ratio ${costRatio.toFixed(1)}%
Revenue MoM: ${revenueGrowthMoM}
Avg conversion: ${avgConversion.toFixed(1)}%, avg revisit: ${avgRevisit.toFixed(0)}%, patron score: ${avgPatron}/100

CUSTOMER SEGMENTS (age):
${segmentSummary || "no segment data"}

ML FORECASTS:
${forecastSummary || "no forecasts yet — run /api/ml/run"}

ML EXPANSION CANDIDATES:
${matchingSummary || "no matching scores yet — run /api/ml/run"}
`.trim();

    // ── Gemini structured-JSON prompt ────────────────────────────────
    const systemPrompt = `You are PTG Group Rental's AI Retail Advisor. You analyze the retailer's current store portfolio and recommend growth + risk-management actions.

You MUST respond with ONLY valid JSON (no markdown, no commentary) in this EXACT shape:
{
  "liveQuote": "<one short insight sentence — 25 words max — referencing a specific store, opportunity, or risk from the data>",
  "recommendations": [
    {"icon": "<material symbol name>", "title": "<5-word title>", "body": "<2 sentence specific recommendation referencing data>", "link": "<3-word CTA>"},
    {"icon": "<material symbol name>", "title": "<5-word title>", "body": "<2 sentence specific recommendation referencing data>", "link": "<3-word CTA>"},
    {"icon": "<material symbol name>", "title": "<5-word title>", "body": "<2 sentence specific recommendation referencing data>", "link": "<3-word CTA>"}
  ],
  "outlook": "<2-3 sentence Q4/Q1 market outlook relevant to this retailer at Thai petrol-station retail>"
}

Valid material icon names: trending_up, store, people, monetization_on, schedule, calendar_today, savings, sell, apartment, insights, warning, group, redeem.

Guidelines:
- Reference specific store IDs (STN-001 Lat Phrao 71 or STN-018 Nonthaburi) and numbers.
- recommendations must be ACTIONABLE — name a metric, hour, segment, or opportunity from the data.
- liveQuote should sound like a confident advisor, not a generic platitude.
- outlook should mention Q4/Q1 trends realistic for Thai petrol-station retail.
- All text in English.`;

    const userMessage = `Generate the advisor output for this retailer:\n\n${dataBlock}`;

    const aiRaw = await generateChatResponse(systemPrompt, [], userMessage);

    const cleaned = aiRaw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

    type AiBlock = { liveQuote: string; recommendations: AdvisorRecommendation[]; outlook: string };

    const fallback: AiBlock = {
      liveQuote: `${profile?.business_name ?? "Your portfolio"} is generating ฿${totalRevenue.toLocaleString()}/mo at a ${costRatio.toFixed(1)}% cost ratio — ${momPct >= 0 ? "growing" : "softening"} ${Math.abs(momPct).toFixed(1)}% MoM.`,
      recommendations: [
        { icon: "trending_up", title: "Lift Off-Peak Hours",     body: `Weekday 10–11am and 2–5pm are your quietest hours. A short discount or bundle during these windows could convert idle traffic without cannibalising peak revenue.`, link: "Plan promo →" },
        { icon: "people",      title: "Retain High-Risk Segment", body: `Lapsed customers ticked down but at-risk seniors (46+) need attention. A small re-engagement campaign would protect annual recurring revenue.`, link: "Build campaign →" },
        { icon: "store",       title: "Expand to High-Match Site", body: `${matching[0] ? `${matching[0].station_id} scored ${matching[0].match_pct}% match` : "Top expansion match is strong"}. Estimated incremental revenue justifies a site visit.`, link: "Review site →" },
      ],
      outlook: `Thai petrol-station retail is expected to see 8–12% footfall growth in Q4 with premium F&B and convenience formats outperforming. Sustained EV-charging dwell times favour cafes and quick-service tenants.`,
    };

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

      const quote   = typeof raw.liveQuote === "string" && raw.liveQuote.trim() ? raw.liveQuote.trim() : fallback.liveQuote;
      const outlook = typeof raw.outlook   === "string" && raw.outlook.trim()   ? raw.outlook.trim()   : fallback.outlook;

      parsed = {
        liveQuote: quote,
        recommendations: validRecs.length === 3 ? validRecs : fallback.recommendations,
        outlook,
      };
    } catch {
      parsed = fallback;
    }

    const out: AdvisorResponse = {
      patronScore: avgPatron,
      revenueGrowthMoM,
      liveQuote:        parsed.liveQuote,
      recommendations:  parsed.recommendations,
      outlook:          parsed.outlook,
      healthScores: {
        revenueGrowth:   revenueGrowthScore,
        conversionRate:  conversionScore,
        revisitRate:     revisitScore,
        costRatioHealth: costRatioHealthScore,
      },
      generatedAt: new Date().toISOString(),
    };

    return res.status(200).json(out);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}
