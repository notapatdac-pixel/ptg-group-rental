import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Landlord's managed portfolio — filter_keys that appear in stationFilterContext
const PORTFOLIO_KEYS = ["lat_phrao", "sukhumvit", "rama9", "bang_na", "main"];

// Returns [{ id: filter_key, name: station.name }] for the landlord dropdown
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const { data, error } = await supabase
    .from("stations")
    .select("filter_key, name")
    .in("filter_key", PORTFOLIO_KEYS)
    .order("name");

  if (error) return res.status(500).json({ error: error.message });

  const stations = (data ?? []).map((s) => ({ id: s.filter_key, name: s.name }));
  return res.status(200).json(stations);
}
