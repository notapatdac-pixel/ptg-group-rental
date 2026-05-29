import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { RETAILER_STATION_IDS as ALL_BRANCH_IDS, storeBrand } from "@/lib/retailerStores";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/retailer/dashboard-details?storeId=STN-001 → returns hourly heatmap,
// weekday/weekend bars, age + spend segments, and conversion rows.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { storeId } = req.query as { storeId?: string };
  const isAll = !storeId || storeId === "all";
  const stores = isAll ? ALL_BRANCH_IDS : [storeId as string];

  const [hourlyRes, perfRes, segRes, stationRes, pnlRes, retentionRes, benchRes, eventsRes] = await Promise.all([
    supabase.from("store_hourly_traffic").select("store_display_id, day_of_week, hour, intensity, visitors").in("store_display_id", stores),
    supabase.from("store_monthly_performance").select("store_display_id, year_month, orders, traffic, conversion_pct, avg_basket_thb, sales_per_sqm_thb, revisit_rate_pct").in("store_display_id", stores).order("year_month", { ascending: false }),
    supabase.from("store_customer_segments").select("store_display_id, year_month, segment_type, segment_label, segment_order, share_pct, avg_basket_thb, growth_pct").in("store_display_id", stores).order("segment_order", { ascending: true }),
    supabase.from("stations").select("display_id, name, location_text").in("display_id", stores),
    supabase.from("store_monthly_pnl").select("store_display_id, year_month, revenue_thb").in("store_display_id", stores).order("year_month", { ascending: true }),
    supabase.from("store_monthly_retention").select("store_display_id, year_month, new_customers").in("store_display_id", stores).order("year_month", { ascending: false }),
    supabase.from("platform_benchmarks").select("metric_key, top_25_value, median_value").eq("category", "cafe").order("year_month", { ascending: false }).limit(3),
    // Event knowledge: store-specific OR portfolio-wide (store_display_id IS NULL)
    supabase.from("store_events")
      .select("store_display_id, year_month, event_name, event_type, description, est_traffic_lift_pct, est_sales_lift_pct")
      .or(`store_display_id.in.(${stores.join(",")}),store_display_id.is.null`)
      .order("year_month", { ascending: false })
      .limit(12),
  ]);

  type HourlyRow    = { store_display_id: string; day_of_week: number; hour: number; intensity: number; visitors: number | null };
  type PerfRow      = { store_display_id: string; year_month: string; orders: number; traffic: number; conversion_pct: number; avg_basket_thb: number; sales_per_sqm_thb: number; revisit_rate_pct: number };
  type SegmentRow   = { store_display_id: string; year_month: string; segment_type: string; segment_label: string; segment_order: number; share_pct: number; avg_basket_thb: number | null; growth_pct: number | null };
  type StationRow   = { display_id: string; name: string; location_text: string };
  type PnlRow       = { store_display_id: string; year_month: string; revenue_thb: number };
  type RetentionRow = { store_display_id: string; year_month: string; new_customers: number };
  type BenchRow     = { metric_key: string; top_25_value: number; median_value: number };

  const hourly      = (hourlyRes.data ?? []) as HourlyRow[];
  const perf        = (perfRes.data ?? []) as PerfRow[];
  const allSegments = (segRes.data ?? []) as SegmentRow[];
  // Only the latest month — store_customer_segments now holds multiple months,
  // so without this the age/spend donuts would blend months instead of "current".
  const segMaxYM = allSegments.reduce((m, s) => (s.year_month > m ? s.year_month : m), "");
  const segments = segMaxYM ? allSegments.filter((s) => s.year_month === segMaxYM) : allSegments;
  const stations    = (stationRes.data ?? []) as StationRow[];
  const pnl         = (pnlRes.data ?? []) as PnlRow[];
  const retention   = (retentionRes.data ?? []) as RetentionRow[];
  const benchmarks  = (benchRes.data ?? []) as BenchRow[];

  type EventRow = { store_display_id: string | null; year_month: string; event_name: string; event_type: string; description: string | null; est_traffic_lift_pct: number | null; est_sales_lift_pct: number | null };
  const events = (eventsRes.data ?? []) as EventRow[];

  if (!hourly.length) {
    return res.status(404).json({ error: "No dashboard-detail data" });
  }

  // ── Heatmap aggregated across selected stores (max intensity by day×hour) ──
  // Returns rows shaped like the frontend HEATMAP: 7 days × 18 hours
  const heatmapMap: Record<string, { intensity: number; visitors: number }> = {};
  for (const h of hourly) {
    const k = `${h.day_of_week}-${h.hour}`;
    const existing = heatmapMap[k];
    // average intensity weighted by stores selected
    if (!existing) {
      heatmapMap[k] = { intensity: h.intensity, visitors: h.visitors ?? 0 };
    } else {
      heatmapMap[k] = {
        intensity: Math.round((existing.intensity + h.intensity) / 2),
        visitors: existing.visitors + (h.visitors ?? 0),
      };
    }
  }

  const heatmap: number[][] = [];
  for (let d = 0; d < 7; d++) {
    const row: number[] = [];
    for (let h = 6; h <= 23; h++) {
      const k = `${d}-${h}`;
      row.push(heatmapMap[k]?.intensity ?? 0);
    }
    heatmap.push(row);
  }

  // ── Weekday/Weekend bar charts (intensity → 0-100 scale) ──
  // Weekday = Mon-Fri (0-4), Weekend = Sat-Sun (5-6)
  function buildBars(days: number[]) {
    const buckets: { h: string; v: number }[] = [];
    for (let h = 6; h <= 23; h++) {
      const total = days.reduce((acc, d) => {
        const k = `${d}-${h}`;
        return acc + (heatmapMap[k]?.intensity ?? 0);
      }, 0);
      const avg = total / days.length;        // 0-4
      const v = Math.round((avg / 4) * 100);   // 0-100
      buckets.push({ h: String(h).padStart(2, "0"), v });
    }
    return buckets;
  }
  const weekdayBars = buildBars([0, 1, 2, 3, 4]);
  const weekendBars = buildBars([5, 6]);

  // ── Latest perf per store → conversion rows ──
  const latestPerfByStore: Record<string, PerfRow> = {};
  for (const p of perf) {
    if (!latestPerfByStore[p.store_display_id]) latestPerfByStore[p.store_display_id] = p;
  }
  const stationNameById: Record<string, string> = {};
  const stationLocById: Record<string, string> = {};
  for (const s of stations) {
    stationNameById[s.display_id] = s.name;
    stationLocById[s.display_id]  = s.location_text;
  }
  const conversion = Object.values(latestPerfByStore).map((p) => ({
    storeId: p.store_display_id,
    name:    storeBrand(p.store_display_id),
    station: stationLocById[p.store_display_id]  ?? "",
    orders:  p.orders,
    traffic: p.traffic,
    rate:    p.conversion_pct,
  }));

  // ── Segments (weighted by traffic if multi-store) ──
  const totalTraffic = Object.values(latestPerfByStore).reduce((s, p) => s + p.traffic, 0);
  const trafficByStore: Record<string, number> = {};
  for (const p of Object.values(latestPerfByStore)) trafficByStore[p.store_display_id] = p.traffic;

  const ageMap: Record<string, { share: number; basket: number | null; growth: number | null; weightTotal: number; sharePctWeighted: number; basketWeighted: number; basketWeightTotal: number; growthWeighted: number; growthWeightTotal: number }> = {};
  const spendMap: Record<string, { share: number; weightTotal: number; sharePctWeighted: number }> = {};

  for (const s of segments) {
    const w = trafficByStore[s.store_display_id] ?? 1;
    if (s.segment_type === "age") {
      const e = ageMap[s.segment_label] ?? { share: 0, basket: null, growth: null, weightTotal: 0, sharePctWeighted: 0, basketWeighted: 0, basketWeightTotal: 0, growthWeighted: 0, growthWeightTotal: 0 };
      e.weightTotal += w;
      e.sharePctWeighted += s.share_pct * w;
      if (s.avg_basket_thb != null) { e.basketWeighted += s.avg_basket_thb * w; e.basketWeightTotal += w; }
      if (s.growth_pct     != null) { e.growthWeighted += s.growth_pct     * w; e.growthWeightTotal += w; }
      ageMap[s.segment_label] = e;
    } else {
      const e = spendMap[s.segment_label] ?? { share: 0, weightTotal: 0, sharePctWeighted: 0 };
      e.weightTotal += w;
      e.sharePctWeighted += s.share_pct * w;
      spendMap[s.segment_label] = e;
    }
  }

  const ageOrder   = ["18-25", "26-35", "36-45", "46+"];
  const spendOrder = [">฿400", "฿200-400", "฿100-200", "<฿100"];

  const ageSegments = ageOrder
    .filter((l) => ageMap[l])
    .map((label) => {
      const e = ageMap[label];
      return {
        label,
        sharePct:  Math.round(e.sharePctWeighted / e.weightTotal),
        avgBasket: e.basketWeightTotal ? Math.round(e.basketWeighted / e.basketWeightTotal) : null,
        growthPct: e.growthWeightTotal ? round1(e.growthWeighted / e.growthWeightTotal) : null,
      };
    });

  const spendSegments = spendOrder
    .filter((l) => spendMap[l])
    .map((label) => {
      const e = spendMap[label];
      return {
        label,
        sharePct: Math.round(e.sharePctWeighted / e.weightTotal),
      };
    });

  // ── Highlights (per-store report cards) ──
  // Build for each store: revenue, customers, basket, conversion, 6-mo trend, MoM trend %
  const benchSqm = benchmarks.find((b) => b.metric_key === "sales_per_sqm");
  const benchVis = benchmarks.find((b) => b.metric_key === "daily_visitors");

  const trendByStore: Record<string, number[]> = {};
  const pnlSortedByStoreAsc: Record<string, PnlRow[]> = {};
  for (const p of pnl) {
    pnlSortedByStoreAsc[p.store_display_id] = pnlSortedByStoreAsc[p.store_display_id] ?? [];
    pnlSortedByStoreAsc[p.store_display_id].push(p);
  }
  for (const sid of Object.keys(pnlSortedByStoreAsc)) {
    trendByStore[sid] = pnlSortedByStoreAsc[sid].slice(-6).map((p) => Math.round(p.revenue_thb / 1000));
  }

  const newCustByStoreLatest: Record<string, number> = {};
  const newCustByStorePrev:   Record<string, number> = {};
  for (const r of retention) {
    if (newCustByStoreLatest[r.store_display_id] === undefined) newCustByStoreLatest[r.store_display_id] = r.new_customers;
    else if (newCustByStorePrev[r.store_display_id] === undefined) newCustByStorePrev[r.store_display_id] = r.new_customers;
  }

  const allStoreIds = stores;
  const highlights = allStoreIds
    .map((sid) => {
      const p = latestPerfByStore[sid];
      if (!p) return null;
      const trend = trendByStore[sid] ?? [];
      const currRev = trend.at(-1) ?? Math.round((p.traffic * p.avg_basket_thb) / 1000);
      const prevRev = trend.at(-2) ?? currRev;
      const revMom  = prevRev > 0 ? Math.round(((currRev - prevRev) / prevRev) * 100) : 0;
      const newCurr = newCustByStoreLatest[sid] ?? p.traffic;
      const newPrev = newCustByStorePrev[sid]   ?? newCurr;
      const custMom = newPrev > 0 ? Math.round(((newCurr - newPrev) / newPrev) * 100) : 0;
      const isTopSqm = benchSqm ? p.sales_per_sqm_thb >= benchSqm.top_25_value : false;
      const isTopVis = benchVis ? p.traffic >= benchVis.top_25_value : false;
      const topQuartile = isTopSqm || isTopVis;
      return {
        storeId:   sid,
        name:      storeBrand(sid),
        location:  `${stationNameById[sid] ?? ""}${stationLocById[sid] ? " · " + stationLocById[sid] : ""}`,
        revenueThb: currRev * 1000,
        revenueMomPct: revMom,
        customersDaily: p.traffic,
        customersMomPct: custMom,
        basketThb: p.avg_basket_thb,
        conversionPct: p.conversion_pct,
        revisitPct: p.revisit_rate_pct,
        salesPerSqmThb: p.sales_per_sqm_thb,
        topQuartile,
        trend,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return res.status(200).json({
    heatmap,                // number[7][18]
    weekdayBars,            // { h, v }[] hour 06..23
    weekendBars,            // { h, v }[]
    ageSegments,
    spendSegments,
    conversion,             // { storeId, name, station, orders, traffic, rate }[]
    highlights,
    totalTraffic,
    events,                 // recent festivals/holidays/promos that explain movements
  });
}

function round1(x: number): number {
  return Math.round(x * 10) / 10;
}
