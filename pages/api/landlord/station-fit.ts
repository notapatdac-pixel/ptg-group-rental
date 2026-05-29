import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { recommendStoreTypes, type StoreTypeFit } from "@/agent/rules/stationFit";

// GET /api/landlord/station-fit?stationId=<filter_key | "all">&lang=en|th
// Recommends which store TYPES suit each station:
//   Predictive signal (traffic, basket, daily customers) → Symbolic ranking
//   (agent/rules/stationFit). Shown directly — no generative summary.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type StationOut = {
  filterKey: string; displayId: string; name: string;
  trafficLevel: string; dailyCustomers: number | null; basketThb: number | null;
  recommended: StoreTypeFit[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const { stationId, lang } = req.query as { stationId?: string; lang?: string };
  const responseLang = lang === "th" ? "th" : "en";
  const selectedKey = stationId && stationId !== "all" ? stationId : "all";

  const [{ data: stations }, { data: metrics }] = await Promise.all([
    supabase.from("stations").select("id, display_id, filter_key, name, traffic_level"),
    supabase.from("station_monthly_metrics")
      .select("station_id, year_month, daily_customers_avg, basket_size_thb")
      .order("year_month", { ascending: false }),
  ]);

  const latest: Record<string, { daily: number | null; basket: number | null }> = {};
  for (const m of (metrics ?? []) as { station_id: string; daily_customers_avg: number | null; basket_size_thb: number | string | null }[]) {
    if (!latest[m.station_id]) latest[m.station_id] = { daily: m.daily_customers_avg, basket: m.basket_size_thb != null ? Number(m.basket_size_thb) : null };
  }

  const all: StationOut[] = ((stations ?? []) as { id: string; display_id: string; filter_key: string; name: string; traffic_level: string | null }[])
    .map((s) => {
      const met = latest[s.id] ?? { daily: null, basket: null };
      return {
        filterKey: s.filter_key, displayId: s.display_id, name: s.name,
        trafficLevel: s.traffic_level ?? "medium",
        dailyCustomers: met.daily, basketThb: met.basket,
        recommended: recommendStoreTypes({ displayId: s.display_id, trafficLevel: s.traffic_level ?? "medium", basketThb: met.basket, dailyCustomers: met.daily }),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // The ranked store types (Symbolic) are shown directly — no Generative summary.
  const selected = selectedKey === "all" ? null : all.find((s) => s.filterKey === selectedKey);
  const explanation = "";

  return res.status(200).json({ selectedKey, selected: selected ? { ...selected, explanation } : null, all });
}
