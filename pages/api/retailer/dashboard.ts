import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { RETAILER_STATION_IDS as ALL_BRANCH_IDS, storeBrand } from "@/lib/retailerStores";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// The retailer's OWN store numbers live in store_monthly_* (keyed by
// store_display_id = STN-xxx) — NOT station_monthly_metrics, which is the whole
// station's footfall across all tenants. Using the latter made the dashboard KPI
// (฿506k / 12,850) disagree with the report card / ML page (฿324k / 418).
type PnlRow  = { store_display_id: string; year_month: string; revenue_thb: number };
type PerfRow = { store_display_id: string; year_month: string; traffic: number; patron_score: number | null };
type LeaseRow = { monthly_rent: number; applications: { station_units: { stations: { display_id: string } } } };

// GET /api/retailer/dashboard?storeId=STN-001
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { storeId } = req.query as { storeId?: string };
  const isAll = !storeId || storeId === "all";
  const displayIds = isAll ? ALL_BRANCH_IDS : [storeId as string].filter(Boolean);

  const [pnlRes, perfRes, leasesRes] = await Promise.all([
    supabase.from("store_monthly_pnl")
      .select("store_display_id, year_month, revenue_thb")
      .in("store_display_id", displayIds).order("year_month", { ascending: false }),
    supabase.from("store_monthly_performance")
      .select("store_display_id, year_month, traffic, patron_score")
      .in("store_display_id", displayIds).order("year_month", { ascending: false }),
    supabase.from("tenant_leases")
      .select(`monthly_rent, applications!inner(status, station_units!inner(stations!inner(display_id)))`)
      .eq("applications.status", "approved"),
  ]);

  if (pnlRes.error)  return res.status(500).json({ error: pnlRes.error.message });
  if (perfRes.error) return res.status(500).json({ error: perfRes.error.message });
  const pnl  = (pnlRes.data ?? [])  as PnlRow[];
  const perf = (perfRes.data ?? []) as PerfRow[];
  if (!pnl.length) return res.status(404).json({ error: "No store data" });

  // latest + previous month per store (rows are desc-sorted)
  const latestPnl: Record<string, PnlRow> = {}, prevPnl: Record<string, PnlRow> = {};
  for (const r of pnl) {
    if (!latestPnl[r.store_display_id]) latestPnl[r.store_display_id] = r;
    else if (!prevPnl[r.store_display_id]) prevPnl[r.store_display_id] = r;
  }
  const latestPerf: Record<string, PerfRow> = {}, prevPerf: Record<string, PerfRow> = {};
  for (const r of perf) {
    if (!latestPerf[r.store_display_id]) latestPerf[r.store_display_id] = r;
    else if (!prevPerf[r.store_display_id]) prevPerf[r.store_display_id] = r;
  }

  // rent from approved leases at these stores
  const leaseByDisplayId: Record<string, number> = {};
  for (const l of (leasesRes.data ?? []) as unknown as LeaseRow[]) {
    const did = l.applications?.station_units?.stations?.display_id;
    if (did && displayIds.includes(did)) leaseByDisplayId[did] = (leaseByDisplayId[did] ?? 0) + l.monthly_rent;
  }

  const branches = displayIds
    .filter((id) => latestPnl[id])
    .map((id) => ({
      stationId:      id,
      name:           storeBrand(id),
      revenue:        latestPnl[id]?.revenue_thb ?? 0,
      dailyCustomers: latestPerf[id]?.traffic ?? 0,
      rent:           leaseByDisplayId[id] ?? 0,
      aiScore:        latestPerf[id]?.patron_score ?? null,
    }));

  const totalRevenue = branches.reduce((s, b) => s + b.revenue, 0);
  const prevRevenue  = displayIds.reduce((s, id) => s + (prevPnl[id]?.revenue_thb ?? 0), 0);
  const avgCustomers = branches.length ? Math.round(branches.reduce((s, b) => s + b.dailyCustomers, 0) / branches.length) : 0;
  const prevCustList = displayIds.map((id) => prevPerf[id]?.traffic).filter((x): x is number => x != null);
  const prevAvgCust  = prevCustList.length ? Math.round(prevCustList.reduce((a, b) => a + b, 0) / prevCustList.length) : 0;
  const totalRent    = branches.reduce((s, b) => s + b.rent, 0);
  const scores       = branches.map((b) => b.aiScore).filter((x): x is number => x != null);
  const avgScore     = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const kpis = {
    totalRevenue,
    avgDailyCustomers: avgCustomers,
    totalMonthlyRent:  totalRent,
    patronScore:       avgScore,
    momAmt:     prevRevenue  > 0 ? Math.round(totalRevenue - prevRevenue) : null,
    momPct:     prevRevenue  > 0 ? (totalRevenue - prevRevenue) / prevRevenue * 100 : null,
    custMomAmt: prevAvgCust  > 0 ? avgCustomers - prevAvgCust : null,
    custMomPct: prevAvgCust  > 0 ? (avgCustomers - prevAvgCust) / prevAvgCust * 100 : null,
  };

  // 6-month revenue trend (in ฿k) — combined for "all", else the single store
  const trendMap: Record<string, number> = {};
  for (const r of pnl) trendMap[r.year_month] = (trendMap[r.year_month] ?? 0) + r.revenue_thb;
  const trend = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, revenue]) => ({ month, revenue: Math.round(revenue / 1000) }));

  return res.status(200).json({ kpis, branches, trend });
}
