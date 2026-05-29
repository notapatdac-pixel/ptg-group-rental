import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { RETAILER_PROFILE_ID, storeBrand, storeType } from "@/lib/retailerStores";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Shape of the joined row we post-process below.
type JoinedApp = {
  retailer_profile_id?: string;
  retailer_profiles?: {
    business_name?: string;
    category?: string;
    owner_name?: string | null;
    users?: { name?: string } | null;
  } | null;
  station_units?: {
    stations?: { display_id?: string } | null;
  } | null;
};

// GET /api/applications?role=retailer&profileId=...
// GET /api/applications?role=landlord
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { role, profileId } = req.query as { role?: string; profileId?: string };

  // Require explicit role — never return all applications to an unauthenticated caller
  if (!role) return res.status(200).json([]);

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
        owner_name,
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
          display_id,
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

  // Normalise the applicant identity so the landlord sees the real business
  // contact (not the shared seed user) and, for the multi-format Lumina demo
  // account, the per-store brand + type that the rest of the app uses.
  for (const row of (data ?? []) as JoinedApp[]) {
    const rp = row.retailer_profiles;
    if (!rp) continue;
    // Applicant person = the business's own contact, never the seed/landlord user.
    const contact = rp.owner_name ?? rp.users?.name ?? rp.business_name;
    rp.users = { name: contact ?? "" };
    // Lumina's seeded storefronts span several stores; show each store's own
    // brand + type — but ONLY for the stations that are actually configured
    // Lumina stores. For a NEW application the demo account files at any other
    // station, keep the real profile name (storeType="" → not a Lumina store,
    // so storeBrand would otherwise return the raw "STN-xxx").
    if (row.retailer_profile_id === RETAILER_PROFILE_ID) {
      const displayId = row.station_units?.stations?.display_id;
      const type = displayId ? storeType(displayId) : "";
      if (type) {
        rp.business_name = storeBrand(displayId!);
        rp.category = type;
      }
    }
  }

  return res.status(200).json(data ?? []);
}
