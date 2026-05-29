import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type StationDetail = {
  displayId: string;
  filterKey: string;
  name: string;
  location: string;
  trafficLevel: string;
  peakHours: string;
  landAreaSqm: number;
  fuelingPoints: number;
  lat: number;
  lng: number;
  dailyCustomers: number | null;
  dwellMin: number | null;
  estRevenueK: number | null;
  aiScore: number | null;
  trafficYear: string;
  trafficTrend: { month: string; customers: number }[];
  availableUnits: {
    id: string;
    unitCode: string;
    unitLabel: string;
    areaSqm: number;
    priceThb: number;
    leaseType: string;
  }[];
  occupiedUnits: number;
  totalUnits: number;
};

// GET /api/retailer/station?stationId=STN-001
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const { stationId } = req.query as { stationId: string };
  if (!stationId) return res.status(400).json({ error: "stationId required" });

  const { data: stn, error: e0 } = await supabase
    .from("stations")
    .select("id, display_id, filter_key, name, province, traffic_level, peak_hours, land_area_sqm, fueling_points, lat, lng, location_text")
    .eq("display_id", stationId)
    .single();

  if (e0 || !stn) return res.status(404).json({ error: "Station not found" });

  const { data: units } = await supabase
    .from("station_units")
    .select("id, unit_code, unit_label, area_sqm, price_thb, lease_type, available")
    .eq("station_id", stn.id)
    .order("unit_code");

  const allUnits = (units ?? []) as {
    id: string; unit_code: string; unit_label: string;
    area_sqm: number; price_thb: number; lease_type: string; available: boolean;
  }[];

  const { data: metric } = await supabase
    .from("station_monthly_metrics")
    .select("daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct")
    .eq("station_id", stn.id)
    .order("year_month", { ascending: false })
    .limit(1)
    .single();

  // Monthly traffic series for the trend chart — the latest year present.
  const { data: series } = await supabase
    .from("station_monthly_metrics")
    .select("year_month, daily_customers_avg")
    .eq("station_id", stn.id)
    .order("year_month", { ascending: true });

  const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const allSeries = (series ?? []) as { year_month: string; daily_customers_avg: number }[];
  const trafficYear = allSeries.length
    ? allSeries[allSeries.length - 1].year_month.slice(0, 4)
    : String(new Date().getFullYear());
  const trafficTrend = allSeries
    .filter(r => r.year_month.startsWith(trafficYear))
    .map(r => ({
      month: MONTH_ABBR[parseInt(r.year_month.slice(5, 7), 10) - 1] ?? r.year_month,
      customers: Math.round(r.daily_customers_avg),
    }));

  const result: StationDetail = {
    displayId:      stn.display_id,
    filterKey:      stn.filter_key,
    name:           stn.name,
    location:       stn.location_text ?? stn.province,
    trafficLevel:   stn.traffic_level ?? "medium",
    peakHours:      stn.peak_hours ?? "07:00–09:00",
    landAreaSqm:    stn.land_area_sqm ?? 0,
    fuelingPoints:  stn.fueling_points ?? 0,
    lat:            Number(stn.lat),
    lng:            Number(stn.lng),
    dailyCustomers: metric?.daily_customers_avg ?? null,
    dwellMin:       metric?.dwell_min_avg ?? null,
    estRevenueK:    metric?.est_revenue_k_thb ?? null,
    aiScore:        metric?.ai_score_pct ?? null,
    trafficYear,
    trafficTrend,
    availableUnits: allUnits
      .filter(u => u.available)
      .map(u => ({
        id:        u.id,
        unitCode:  u.unit_code,
        unitLabel: u.unit_label,
        areaSqm:   u.area_sqm,
        priceThb:  u.price_thb,
        leaseType: u.lease_type,
      })),
    occupiedUnits: allUnits.filter(u => !u.available).length,
    totalUnits:    allUnits.length,
  };

  return res.status(200).json(result);
}
