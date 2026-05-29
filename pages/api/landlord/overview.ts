import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PORTFOLIO_KEYS = ["lat_phrao", "sukhumvit", "rama9", "bang_na", "main"];

type StationRow = { id: string; display_id: string; filter_key: string; name: string; location_text: string };
type MetricRow  = { station_id: string; year_month: string; daily_customers_avg: number; dwell_min_avg: number; est_revenue_k_thb: number; ai_score_pct: number; basket_size_thb: number | null };
type UnitRow    = { station_id: string; available: boolean };

function occupancyStatus(occupied: number, total: number): "Full" | "Partial" | "Low" {
  if (total === 0) return "Low";
  const r = occupied / total;
  if (r >= 1) return "Full";
  if (r >= 0.5) return "Partial";
  return "Low";
}

// GET /api/landlord/overview?stationId=lat_phrao
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { stationId } = req.query as { stationId?: string };
  const isAll = !stationId || stationId === "all";
  const filterKeys = isAll ? PORTFOLIO_KEYS : [stationId as string];

  // 1. Resolve stations
  const { data: stations, error: e0 } = await supabase
    .from("stations")
    .select("id, display_id, filter_key, name, location_text")
    .in("filter_key", filterKeys);

  if (e0) return res.status(500).json({ error: e0.message });
  const stnRows = (stations ?? []) as StationRow[];
  if (!stnRows.length) return res.status(400).json({ error: "Unknown stationId" });

  const stnUuids = stnRows.map((s) => s.id);

  // 2. All portfolio UUIDs (for full station rows in "all" view)
  let allPortfolioUuids = stnUuids;
  if (!isAll) {
    const { data: all } = await supabase.from("stations").select("id").in("filter_key", PORTFOLIO_KEYS);
    allPortfolioUuids = (all ?? []).map((s: { id: string }) => s.id);
  }

  // 3. Monthly metrics
  const { data: metrics, error: e1 } = await supabase
    .from("station_monthly_metrics")
    .select("station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct, basket_size_thb")
    .in("station_id", allPortfolioUuids)
    .order("year_month", { ascending: false });

  if (e1) return res.status(500).json({ error: e1.message });
  const metricRows = (metrics ?? []) as MetricRow[];

  // 4. Station units for occupancy
  const { data: units, error: e2 } = await supabase
    .from("station_units")
    .select("station_id, available")
    .in("station_id", allPortfolioUuids);

  if (e2) return res.status(500).json({ error: e2.message });
  const unitRows = (units ?? []) as UnitRow[];

  // Helpers
  const latestByStation: Record<string, MetricRow> = {};
  for (const m of metricRows) {
    if (!latestByStation[m.station_id]) latestByStation[m.station_id] = m;
  }

  // Need all portfolio stations for the stations table
  const { data: allStations } = isAll
    ? { data: stnRows }
    : await supabase.from("stations").select("id, display_id, filter_key, name, location_text").in("filter_key", PORTFOLIO_KEYS);

  const portfolioStations = (allStations ?? []) as StationRow[];

  // Build per-station rows
  const stationTable = portfolioStations.map((s) => {
    const lat = latestByStation[s.id];
    const stnUnits = unitRows.filter((u) => u.station_id === s.id);
    const occupied = stnUnits.filter((u) => !u.available).length;
    const total    = stnUnits.length;
    return lat ? {
      filterKey:      s.filter_key,
      name:           s.name,
      location:       s.location_text,
      revenue:        lat.est_revenue_k_thb * 1000,
      dailyCustomers: lat.daily_customers_avg,
      occupied,
      total,
      status:         occupancyStatus(occupied, total),
    } : null;
  }).filter(Boolean);

  if (isAll) {
    const latests = stnRows.map((s) => latestByStation[s.id]).filter(Boolean) as MetricRow[];
    const n = latests.length || 1;
    const totalRevenue    = latests.reduce((sum, m) => sum + m.est_revenue_k_thb * 1000, 0);
    const avgCustomers    = Math.round(latests.reduce((sum, m) => sum + m.daily_customers_avg, 0) / n);
    const avgBasket       = latests.reduce((sum, m) => sum + (m.basket_size_thb ?? 0), 0) / n;
    const avgScore        = Math.round(latests.reduce((sum, m) => sum + (m.ai_score_pct ?? 0), 0) / n);

    // 6-month trend: sum across stations
    const trendMap: Record<string, number> = {};
    for (const m of metricRows.filter((m) => stnUuids.includes(m.station_id))) {
      trendMap[m.year_month] = (trendMap[m.year_month] ?? 0) + m.est_revenue_k_thb;
    }
    const trend = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ym, total]) => ({ month: ym, station: total }));

    return res.status(200).json({
      kpis: {
        revenue:         totalRevenue,
        revenueChange:   "+1.4% vs last month",
        revenueUp:       true,
        dailyCustomers:  avgCustomers,
        customersChange: "avg across stations",
        customersUp:     true,
        basketSize:      parseFloat(avgBasket.toFixed(1)),
        repeatRate:      `${avgScore}%`,
        repeatChange:    "avg AI score",
        repeatUp:        true,
      },
      trend,
      stations: stationTable,
    });
  }

  // Single station
  const stn    = stnRows[0];
  const allM   = metricRows.filter((m) => m.station_id === stn.id).reverse();
  const lat    = allM.at(-1);
  const prev   = allM.at(-2);
  if (!lat) return res.status(404).json({ error: "No data for station" });

  const stnUnits  = unitRows.filter((u) => u.station_id === stn.id);
  const occupied  = stnUnits.filter((u) => !u.available).length;
  const total     = stnUnits.length;

  const momRev = prev && prev.est_revenue_k_thb > 0
    ? ((lat.est_revenue_k_thb - prev.est_revenue_k_thb) / prev.est_revenue_k_thb) * 100
    : 0;
  const momCust = prev && prev.daily_customers_avg > 0
    ? ((lat.daily_customers_avg - prev.daily_customers_avg) / prev.daily_customers_avg) * 100
    : 0;

  const fmt = (n: number) => (n > 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`);

  const trend = allM.map((m) => ({ month: m.year_month, station: m.est_revenue_k_thb }));

  return res.status(200).json({
    kpis: {
      revenue:         lat.est_revenue_k_thb * 1000,
      revenueChange:   `${fmt(momRev)} vs last month`,
      revenueUp:       momRev >= 0,
      dailyCustomers:  lat.daily_customers_avg,
      customersChange: `${fmt(momCust)} vs last month`,
      customersUp:     momCust >= 0,
      basketSize:      lat.basket_size_thb ?? null,
      repeatRate:      `${lat.ai_score_pct}%`,
      repeatChange:    "AI quality score",
      repeatUp:        true,
    },
    trend,
    stations: stationTable,
    occupancy: { occupied, total, status: occupancyStatus(occupied, total) },
  });
}
