import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PORTFOLIO_IDS = ["STN-001", "STN-002", "STN-003", "STN-004", "STN-005", "STN-018"];

function trafficBadge(level: string): { text: string; cls: string } {
  if (level === "high")
    return { text: "High Traffic", cls: "bg-on-secondary-container/10 text-on-secondary-container" };
  if (level === "low")
    return { text: "Low Traffic", cls: "bg-outline-variant/20 text-on-surface-variant" };
  return { text: "Medium Traffic", cls: "bg-tertiary-container/20 text-on-tertiary-container" };
}

// GET /api/stations — returns the landlord portfolio stations with occupancy counts,
// unit details, and latest monthly metrics (for apply flow and landlord pages)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { data: stations, error } = await supabase
    .from("stations")
    .select(`
      id, display_id, filter_key, name, province, lat, lng, traffic_level,
      station_units(id, unit_code, unit_label, area_sqm, price_thb, lease_type, available),
      station_monthly_metrics(daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct, year_month)
    `)
    .in("display_id", PORTFOLIO_IDS)
    .order("display_id");

  if (error) return res.status(500).json({ error: error.message });

  const result = (stations ?? []).map((s: any) => {
    const allUnits: Array<{
      id: string;
      unit_code: string;
      unit_label: string;
      area_sqm: number;
      price_thb: number;
      lease_type: string;
      available: boolean;
    }> = s.station_units ?? [];

    const occupied = allUnits.filter((u) => !u.available).length;
    const availableUnits = allUnits.filter((u) => u.available);

    // Pick the latest monthly metrics by year_month descending
    const metrics: Array<{
      daily_customers_avg: number;
      dwell_min_avg: number;
      est_revenue_k_thb: number;
      ai_score_pct: number;
      year_month: string;
    }> = (s.station_monthly_metrics ?? []).sort(
      (a: any, b: any) => b.year_month.localeCompare(a.year_month)
    );
    const latestMetrics = metrics[0] ?? null;

    const badge = trafficBadge(s.traffic_level ?? "medium");

    return {
      // Existing fields (landlord page depends on these)
      id:           s.display_id as string,
      filterKey:    s.filter_key as string,
      name:         s.name as string,
      location:     s.province as string,
      trafficLevel: (s.traffic_level as string) ?? "medium",
      lat:          Number(s.lat ?? 0),
      lng:          Number(s.lng ?? 0),
      occupied,
      total:        allUnits.length,
      units:        allUnits.map((u) => ({ id: u.id, available: u.available })),

      // New fields for apply flow
      region_line:        `${s.province as string}, Thailand`,
      traffic_badge:      badge.text,
      traffic_badge_class: badge.cls,
      spaces_count:       availableUnits.length,
      daily_customers:    latestMetrics ? Math.round(latestMetrics.daily_customers_avg).toLocaleString() : "—",
      dwell_min:          latestMetrics ? String(Math.round(latestMetrics.dwell_min_avg)) : "—",
      ai_score:           latestMetrics ? `${Math.round(latestMetrics.ai_score_pct)}%` : "—",
      ai_score_num:       latestMetrics ? Math.round(latestMetrics.ai_score_pct) : 0,
      available_units:    availableUnits.map((u) => ({
        id:         u.id,
        unit_code:  u.unit_code,
        unit_label: u.unit_label,
        area_sqm:   u.area_sqm,
        price_thb:  u.price_thb,
        lease_type: u.lease_type,
      })),
      // ALL units (available + occupied) so the floor plan can render
      // both states and the user sees the real station layout.
      all_units: allUnits.map((u) => ({
        id:         u.id,
        unit_code:  u.unit_code,
        unit_label: u.unit_label,
        area_sqm:   u.area_sqm,
        price_thb:  u.price_thb,
        lease_type: u.lease_type,
        available:  u.available,
      })),
    };
  });

  return res.status(200).json(result);
}
