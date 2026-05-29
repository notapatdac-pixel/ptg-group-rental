import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import type { MlApiResponse, MlMatchingScore, MlStoreCatchment } from "@/agent/ml/mlTypes";
import {
  RETAILER_ID,
  RETAILER_ML_STORE_IDS as RETAILER_STORE_IDS,
  RETAILER_STATION_IDS as CURRENT_STATION_IDS,
  STORE_TO_STATION,
} from "@/lib/retailerStores";
import { ANALYTICS_POLICY } from "@/agent/rules/policies";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const [forecastsRes, churnRes, matchingRes, anomalyRes, originsRes, catchmentRes, perfRes, eventsRes] = await Promise.all([
    serviceSupabase
      .from("ml_sales_forecasts")
      .select("*")
      .eq("retailer_id", RETAILER_ID),

    serviceSupabase
      .from("ml_churn_segments")
      .select("*")
      .in("store_id", RETAILER_STORE_IDS)
      .order("avg_risk_prob_pct", { ascending: false }),

    serviceSupabase
      .from("ml_matching_scores")
      .select("*")
      .eq("retailer_id", RETAILER_ID)
      .order("match_score", { ascending: false })
      .limit(30),

    serviceSupabase
      .from("ml_anomaly_alerts")
      .select("*")
      .in("store_id", RETAILER_STORE_IDS)
      .eq("is_anomaly", true)
      .order("period", { ascending: false }),

    serviceSupabase
      .from("ml_customer_origins")
      .select("store_id, distance_band, customer_pct")
      .in("store_id", RETAILER_STORE_IDS),

    serviceSupabase
      .from("ml_store_catchment")
      .select("store_id, station_display_id, reach_5km_k")
      .in("store_id", RETAILER_STORE_IDS),

    // Real basket history — used to override ML's broken avg-spend predictions.
    serviceSupabase
      .from("store_monthly_performance")
      .select("store_display_id, year_month, avg_basket_thb")
      .in("store_display_id", Object.values(STORE_TO_STATION))
      .order("year_month", { ascending: false }),

    // Event knowledge — store-specific OR portfolio-wide — so the UI can explain spikes.
    serviceSupabase
      .from("store_events")
      .select("store_display_id, year_month, event_name, event_type, description, est_traffic_lift_pct, est_sales_lift_pct")
      .or(`store_display_id.in.(${Object.values(STORE_TO_STATION).join(",")}),store_display_id.is.null`)
      .order("year_month", { ascending: false })
      .limit(12),
  ]);

  // ── Sanitize avg-spend forecasts ────────────────────────────────────────────
  // The ML model emits a cold-start median fill for predicted_avg_spend_thb
  // (identical ฿1,092 across stores) and a nonsensical pct_change (+300%).
  // Override both with the real basket trend so the KPI card and AI summary
  // surface believable numbers.
  const basketByStation: Record<string, { latest?: number; prior?: number }> = {};
  for (const row of (perfRes.data ?? []) as { store_display_id: string; avg_basket_thb: number | string }[]) {
    const b = (basketByStation[row.store_display_id] ??= {});
    if (b.latest === undefined) b.latest = Number(row.avg_basket_thb);
    else if (b.prior === undefined) b.prior = Number(row.avg_basket_thb);
  }
  // Double-count guard: the page sums all returned forecast rows, so keep only the
  // LATEST forecast_period per store. If multiple periods ever exist, older rows are
  // dropped here before sanitization rather than silently inflating KPIs/hero totals.
  const latestForecastByStore = new Map<string, Record<string, unknown>>();
  for (const f of (forecastsRes.data ?? []) as Record<string, unknown>[]) {
    const storeId = f.store_id as string;
    const existing = latestForecastByStore.get(storeId);
    if (!existing || String(f.forecast_period) > String(existing.forecast_period)) {
      latestForecastByStore.set(storeId, f);
    }
  }
  const latestForecasts = Array.from(latestForecastByStore.values());

  const sanitizedForecasts = latestForecasts.map((f: Record<string, unknown>) => {
    const stn = STORE_TO_STATION[f.store_id as string];
    const basket = stn ? basketByStation[stn] : undefined;
    if (basket?.latest) {
      return {
        ...f,
        predicted_avg_spend_thb: basket.latest,
        pct_change_spend_vs_last: basket.prior
          ? (basket.latest - basket.prior) / basket.prior
          : 0,
      };
    }
    return f;
  });

  // Enrichment round 2 — both station lookups can fire together.
  const rawMatching = matchingRes.data ?? [];
  const expansionStations = rawMatching.filter(
    (m) => !CURRENT_STATION_IDS.includes(m.station_id)
  );
  const stationIds = expansionStations.map((m) => m.station_id);

  const catchmentRows = catchmentRes.data ?? [];
  const catchmentStationIds = catchmentRows.map((c: { station_display_id: string }) => c.station_display_id);

  const [matchStationsRes, catchmentStationsRes] = await Promise.all([
    stationIds.length
      ? serviceSupabase.from("stations").select("display_id, name, traffic_level, location_text").in("display_id", stationIds)
      : Promise.resolve({ data: [] as { display_id: string; name: string; traffic_level: string | null; location_text: string | null }[] }),
    catchmentStationIds.length
      ? serviceSupabase.from("stations").select("display_id, name, lat, lng").in("display_id", catchmentStationIds)
      : Promise.resolve({ data: [] as { display_id: string; name: string; lat: number | string; lng: number | string }[] }),
  ]);

  const stationMap: Record<string, { name: string; traffic_level: string; location_text: string }> = {};
  for (const s of matchStationsRes.data ?? []) {
    stationMap[s.display_id] = {
      name: s.name,
      traffic_level: s.traffic_level ?? "medium",
      location_text: s.location_text ?? "",
    };
  }

  const enrichedMatching: MlMatchingScore[] = expansionStations.map((m) => ({
    ...m,
    station_name: stationMap[m.station_id]?.name ?? m.station_id,
    traffic_level: stationMap[m.station_id]?.traffic_level ?? "medium",
    location_text: stationMap[m.station_id]?.location_text ?? "",
  }));

  const coordMap: Record<string, { lat: number; lng: number; name: string }> = {};
  for (const s of catchmentStationsRes.data ?? []) {
    coordMap[s.display_id] = { lat: Number(s.lat), lng: Number(s.lng), name: s.name };
  }
  const enrichedCatchment: MlStoreCatchment[] = catchmentRows.map((c: { store_id: string; station_display_id: string; reach_5km_k: number }) => ({
    store_id:           c.store_id,
    station_display_id: c.station_display_id,
    reach_5km_k:        c.reach_5km_k,
    lat:                coordMap[c.station_display_id]?.lat ?? 13.76,
    lng:                coordMap[c.station_display_id]?.lng ?? 100.54,
    station_name:       coordMap[c.station_display_id]?.name ?? c.station_display_id,
  }));

  const response: MlApiResponse = {
    forecasts:       sanitizedForecasts as MlApiResponse["forecasts"],
    churnSegments:   churnRes.data ?? [],
    matchingScores:  enrichedMatching.slice(0, 5),
    // Only surface MATERIAL anomalies — a 1% wobble is noise, not a signal.
    anomalyAlerts:   (anomalyRes.data ?? []).filter(
      (a: { pct_deviation: number | null }) => Math.abs(a.pct_deviation ?? 0) >= ANALYTICS_POLICY.anomalyMinDeviation
    ),
    customerOrigins: originsRes.data ?? [],
    storeCatchment:  enrichedCatchment,
    events:          (eventsRes.data ?? []) as MlApiResponse["events"],
  };

  return res.status(200).json(response);
}
