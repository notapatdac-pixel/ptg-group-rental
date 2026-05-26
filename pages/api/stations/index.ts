import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/stations
// GET /api/stations?filterKey=sukhumvit
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { filterKey } = req.query as { filterKey?: string };

  let query = serviceSupabase
    .from("stations")
    .select(`
      *,
      station_units (*),
      station_monthly_metrics (
        year_month,
        daily_customers_avg,
        dwell_min_avg,
        est_revenue_k_thb,
        ai_score_pct
      )
    `)
    .order("name");

  if (filterKey) query = query.eq("filter_key", filterKey) as typeof query;

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data ?? []);
}
