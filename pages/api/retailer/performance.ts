import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { RETAILER_STATION_IDS as ALL_BRANCH_IDS } from "@/lib/retailerStores";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type PnlRow         = { store_display_id: string; year_month: string; revenue_thb: number; rent_thb: number; utilities_thb: number; net_thb: number };
type RetentionRow   = { store_display_id: string; year_month: string; new_customers: number; returning_customers: number; lapsed_customers: number; new_mom_pct: number | null; returning_mom_pct: number | null; lapsed_mom_pct: number | null };
type PerfRow        = { store_display_id: string; year_month: string; orders: number; traffic: number; conversion_pct: number; avg_basket_thb: number; sales_per_sqm_thb: number; revisit_rate_pct: number; patron_score: number | null };
type SegmentRow     = { store_display_id: string; segment_type: string; segment_label: string; segment_order: number; share_pct: number; avg_basket_thb: number | null; growth_pct: number | null };
type BenchmarkRow   = { metric_key: string; top_25_value: number; median_value: number; bottom_25_value: number; unit_label: string };

// GET /api/retailer/performance?storeId=STN-001
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { storeId } = req.query as { storeId?: string };
  const isAll = !storeId || storeId === "all";
  const stores = isAll ? ALL_BRANCH_IDS : [storeId as string];

  const [pnlRes, retentionRes, perfRes, segRes, benchRes, stationRes] = await Promise.all([
    supabase.from("store_monthly_pnl").select("*").in("store_display_id", stores).order("year_month", { ascending: true }),
    supabase.from("store_monthly_retention").select("*").in("store_display_id", stores).order("year_month", { ascending: false }),
    supabase.from("store_monthly_performance").select("*").in("store_display_id", stores).order("year_month", { ascending: false }),
    supabase.from("store_customer_segments").select("store_display_id, segment_type, segment_label, segment_order, share_pct, avg_basket_thb, growth_pct").in("store_display_id", stores).order("segment_order", { ascending: true }),
    supabase.from("platform_benchmarks").select("metric_key, top_25_value, median_value, bottom_25_value, unit_label").eq("category", "cafe").order("year_month", { ascending: false }).limit(3),
    supabase.from("stations").select("display_id, name").in("display_id", stores),
  ]);

  const pnl       = (pnlRes.data ?? []) as PnlRow[];
  const retention = (retentionRes.data ?? []) as RetentionRow[];
  const perf      = (perfRes.data ?? []) as PerfRow[];
  const segments  = (segRes.data ?? []) as SegmentRow[];
  const benchmark = (benchRes.data ?? []) as BenchmarkRow[];
  const stations  = (stationRes.data ?? []) as { display_id: string; name: string }[];

  if (!pnl.length || !perf.length) {
    return res.status(404).json({ error: "No performance data for the selected store(s)" });
  }

  // Latest month per store
  const latestPnlByStore: Record<string, PnlRow> = {};
  for (const p of pnl) {
    if (!latestPnlByStore[p.store_display_id] || p.year_month > latestPnlByStore[p.store_display_id].year_month) {
      latestPnlByStore[p.store_display_id] = p;
    }
  }
  const latestRetentionByStore: Record<string, RetentionRow> = {};
  for (const r of retention) {
    if (!latestRetentionByStore[r.store_display_id]) latestRetentionByStore[r.store_display_id] = r;
  }
  const latestPerfByStore: Record<string, PerfRow> = {};
  for (const p of perf) {
    if (!latestPerfByStore[p.store_display_id]) latestPerfByStore[p.store_display_id] = p;
  }

  const stationNameById: Record<string, string> = {};
  for (const s of stations) stationNameById[s.display_id] = s.name.replace(/^PTG\s+/, "");

  // ── Aggregated breakeven (one row per store)
  const breakeven = Object.values(latestPnlByStore).map((p) => ({
    storeId:    p.store_display_id,
    name:       stationNameById[p.store_display_id] ?? p.store_display_id,
    revenue:    Math.round(p.revenue_thb / 1000),
    rent:       Math.round(p.rent_thb / 1000),
    utilities:  Math.round(p.utilities_thb / 1000),
    net:        Math.round(p.net_thb / 1000),
  }));

  // ── Top-level KPIs (annual revenue is sum of revenue across all months for selected stores)
  const annualRevenue = pnl.reduce((s, p) => s + p.revenue_thb, 0);
  const monthlyRent   = Object.values(latestPnlByStore).reduce((s, p) => s + p.rent_thb, 0);
  const latestRevenue = Object.values(latestPnlByStore).reduce((s, p) => s + p.revenue_thb, 0);
  const latestRentUtil = Object.values(latestPnlByStore).reduce((s, p) => s + p.rent_thb + p.utilities_thb, 0);
  const costToRevenue = latestRevenue ? (latestRentUtil / latestRevenue) * 100 : 0;

  // Weighted avg basket by traffic
  const totalTraffic = Object.values(latestPerfByStore).reduce((s, p) => s + p.traffic, 0);
  const avgBasket = totalTraffic
    ? Object.values(latestPerfByStore).reduce((s, p) => s + p.avg_basket_thb * p.traffic, 0) / totalTraffic
    : 0;

  // ── Retention (merged across selected stores)
  const newCust       = Object.values(latestRetentionByStore).reduce((s, r) => s + r.new_customers, 0);
  const retCust       = Object.values(latestRetentionByStore).reduce((s, r) => s + r.returning_customers, 0);
  const lapsedCust    = Object.values(latestRetentionByStore).reduce((s, r) => s + r.lapsed_customers, 0);
  const newMomPct     = retention.length ? avgNullable(Object.values(latestRetentionByStore).map((r) => r.new_mom_pct)) : null;
  const retMomPct     = retention.length ? avgNullable(Object.values(latestRetentionByStore).map((r) => r.returning_mom_pct)) : null;
  const lapsedMomPct  = retention.length ? avgNullable(Object.values(latestRetentionByStore).map((r) => r.lapsed_mom_pct)) : null;

  // ── Your-side benchmark figures (weighted)
  const totalOrders = Object.values(latestPerfByStore).reduce((s, p) => s + p.orders, 0);
  const totalTrafficB = Object.values(latestPerfByStore).reduce((s, p) => s + p.traffic, 0);
  const wAvgSqm  = totalTraffic ? Object.values(latestPerfByStore).reduce((s, p) => s + p.sales_per_sqm_thb * p.traffic, 0) / totalTraffic : 0;
  const avgVisitors = Object.values(latestPerfByStore).length ? Math.round(Object.values(latestPerfByStore).reduce((s, p) => s + p.traffic, 0) / Object.values(latestPerfByStore).length) : 0;
  const wAvgRevisit = totalTraffic ? Object.values(latestPerfByStore).reduce((s, p) => s + p.revisit_rate_pct * p.traffic, 0) / totalTraffic : 0;

  // ── Build benchmark response (you vs top/median/bottom)
  const findBench = (k: string) => benchmark.find((b) => b.metric_key === k);
  const benchSqm  = findBench("sales_per_sqm");
  const benchVis  = findBench("daily_visitors");
  const benchRev  = findBench("revisit_rate");

  const benchmarkOut = {
    salesPerSqm:    benchSqm ? { you: round1(wAvgSqm),     top: benchSqm.top_25_value, median: benchSqm.median_value, bottom: benchSqm.bottom_25_value, unit: benchSqm.unit_label } : null,
    dailyVisitors:  benchVis ? { you: avgVisitors,         top: benchVis.top_25_value, median: benchVis.median_value, bottom: benchVis.bottom_25_value, unit: benchVis.unit_label } : null,
    revisitRate:    benchRev ? { you: round1(wAvgRevisit), top: benchRev.top_25_value, median: benchRev.median_value, bottom: benchRev.bottom_25_value, unit: benchRev.unit_label } : null,
  };

  // ── Segments (aggregated when "all" - weighted by traffic)
  const ageSegMap: Record<string, { share: number[]; basket: number[]; growth: number[] }> = {};
  const spendSegMap: Record<string, { share: number[]; basket: number[]; growth: number[] }> = {};
  for (const s of segments) {
    const m = s.segment_type === "age" ? ageSegMap : spendSegMap;
    if (!m[s.segment_label]) m[s.segment_label] = { share: [], basket: [], growth: [] };
    m[s.segment_label].share.push(s.share_pct);
    if (s.avg_basket_thb != null) m[s.segment_label].basket.push(s.avg_basket_thb);
    if (s.growth_pct     != null) m[s.segment_label].growth.push(s.growth_pct);
  }

  const ageOrder   = ["18-25", "26-35", "36-45", "46+"];
  const spendOrder = [">฿400", "฿200-400", "฿100-200", "<฿100"];

  const ageSegments = ageOrder
    .filter((l) => ageSegMap[l])
    .map((label) => ({
      label,
      sharePct: round1(avgArr(ageSegMap[label].share)),
      avgBasket: ageSegMap[label].basket.length ? Math.round(avgArr(ageSegMap[label].basket)) : null,
      growthPct: ageSegMap[label].growth.length ? round1(avgArr(ageSegMap[label].growth)) : null,
    }));
  const spendSegments = spendOrder
    .filter((l) => spendSegMap[l])
    .map((label) => ({
      label,
      sharePct: round1(avgArr(spendSegMap[label].share)),
    }));

  return res.status(200).json({
    kpis: {
      annualRevenue,
      avgBasket: Math.round(avgBasket),
      monthlyRent,
      costToRevenuePct: round1(costToRevenue),
      costToRevenueHealthy: costToRevenue < 25,
    },
    breakeven,
    benchmark: benchmarkOut,
    retention: {
      newCustomers: newCust,
      returningCustomers: retCust,
      lapsedCustomers: lapsedCust,
      newMomPct,
      returningMomPct: retMomPct,
      lapsedMomPct,
    },
    segments: {
      age:   ageSegments,
      spend: spendSegments,
    },
  });
}

function avgArr(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
function avgNullable(xs: (number | null)[]): number | null {
  const filtered = xs.filter((x): x is number => x !== null);
  return filtered.length ? avgArr(filtered) : null;
}
function round1(x: number): number {
  return Math.round(x * 10) / 10;
}
