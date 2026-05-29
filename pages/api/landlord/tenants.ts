import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { storeBrand, RETAILER_STATION_IDS } from "@/lib/retailerStores";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PORTFOLIO_KEYS = ["lat_phrao", "sukhumvit", "rama9", "bang_na", "main"];
// The demo retailer (multi-format operator) — show each of its stores by its own
// storefront brand (Lumina Artisan Roastery, Fresh Market, …) rather than the
// single account name, so the landlord sees the actual storefront per station.
const LUMINA_PROFILE_ID = "55555555-0000-0000-0000-000000000001";

// GET /api/landlord/tenants?stationId=lat_phrao
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { stationId } = req.query as { stationId?: string };
  const isAll = !stationId || stationId === "all";
  const filterKeys = isAll ? PORTFOLIO_KEYS : [stationId as string];

  // Fetch approved applications with nested relations
  const { data, error } = await supabase
    .from("applications")
    .select(`
      id,
      landlord_display_id,
      retailer_display_id,
      retailer_profile_id,
      ai_score,
      applied_date,
      status,
      retailer_profiles!inner(
        business_name,
        category
      ),
      station_units!inner(
        unit_code,
        stations!inner(
          filter_key,
          display_id,
          name,
          location_text
        )
      ),
      tenant_leases(
        monthly_rent,
        start_date,
        end_date,
        lease_type
      )
    `)
    .eq("status", "approved");

  if (error) return res.status(500).json({ error: error.message });

  type AppRow = {
    id: string;
    landlord_display_id: string;
    retailer_display_id: string;
    retailer_profile_id: string;
    ai_score: string;
    applied_date: string;
    status: string;
    retailer_profiles: { business_name: string; category: string };
    station_units: {
      unit_code: string;
      stations: { filter_key: string; display_id: string; name: string; location_text: string };
    };
    tenant_leases: { monthly_rent: number; start_date: string; end_date: string; lease_type: string }[];
  };

  const today = new Date();
  const result = (data ?? []).map((app: unknown) => {
    const a = app as AppRow;
    const lease = a.tenant_leases?.[0];
    const endDate = lease?.end_date ? new Date(lease.end_date) : null;
    const daysLeft = endDate ? Math.round((endDate.getTime() - today.getTime()) / 86400000) : null;
    const leaseStatus = !lease ? "pending"
      : daysLeft !== null && daysLeft <= 60 ? "expiring"
      : "active";

    // For the multi-format demo retailer, show the store's own brand per station.
    const displayId = a.station_units?.stations?.display_id ?? "";
    const isLumina = a.retailer_profile_id === LUMINA_PROFILE_ID && RETAILER_STATION_IDS.includes(displayId);
    const brand = isLumina ? storeBrand(displayId) : (a.retailer_profiles?.business_name ?? "Unknown");

    return {
      id:           a.id,
      retailerId:   a.retailer_display_id,
      brand,
      category:     a.retailer_profiles?.category ?? "",
      stationId:    a.station_units?.stations?.filter_key ?? "",
      station:      a.station_units?.stations?.name ?? "",
      unit:         a.station_units?.unit_code ?? "",
      rent:         lease ? lease.monthly_rent.toLocaleString() : "—",
      leaseStart:   lease?.start_date ?? "",
      leaseEnd:     lease?.end_date ?? "",
      payHistory:   (() => { const s = parseFloat((a.ai_score ?? "0").replace("%","")); return s >= 85 ? "100%" : s >= 65 ? "On time" : "Occasionally late"; })(),
      aiScore:      parseFloat((a.ai_score ?? "0").replace("%", "")),
      status:       leaseStatus,
      storePerf:    "Good",
      stnPerf:      "Good",
    };
  });

  // PostgREST does not support nested .in() filters — apply station filter in JS
  const filtered = isAll ? result : result.filter((t) => t.stationId === stationId);
  return res.status(200).json(filtered);
}
