import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/applications?role=retailer&profileId=...
// GET /api/applications?role=landlord
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { role, profileId } = req.query as { role?: string; profileId?: string };

  let query = serviceSupabase
    .from("applications")
    .select(`
      *,
      retailer_profiles (
        business_name,
        category,
        experience,
        num_stores,
        max_budget,
        concept,
        user_id,
        users ( name )
      ),
      station_units (
        unit_code,
        unit_label,
        area_sqm,
        price_thb,
        lease_type,
        stations (
          filter_key,
          name,
          location_text
        )
      )
    `)
    .order("applied_date", { ascending: false });

  if (role === "retailer" && profileId) {
    query = query.eq("retailer_profile_id", profileId) as typeof query;
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data ?? []);
}
