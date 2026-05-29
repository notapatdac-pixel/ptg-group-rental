import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH or PUT /api/applications/[id]/status
// Body: { status: "approved" | "not_approved" | "pending_review" }
// `id` is the landlord_display_id (e.g. "LAND-APP-2026-004").
//
// Side effects:
//   - Updates applications.status in DB
//   - Inserts a notification for the retailer who owns the application
//   - Inserts a confirmation notification for the landlord
// (Auth: trusted for demo. When real auth lands, gate via supabase.auth.getUser().)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH" && req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed — use PATCH or PUT" });
  }

  const { id } = req.query as { id?: string };
  if (!id) return res.status(400).json({ error: "Missing application id" });

  const { status } = (req.body ?? {}) as { status?: string };
  if (!status || !["approved", "not_approved", "pending_review"].includes(status)) {
    return res.status(400).json({ error: "Invalid status. Must be approved | not_approved | pending_review" });
  }

  // Resolve application — accept either landlord_display_id or retailer_display_id
  const lookup = id.startsWith("PTG-APP-")
    ? supabase.from("applications").select(`
        id, landlord_display_id, retailer_display_id,
        station_unit_id,
        retailer_profiles ( id, user_id, business_name ),
        station_units ( unit_code, stations ( name, filter_key ) )
      `).eq("retailer_display_id", id).maybeSingle()
    : supabase.from("applications").select(`
        id, landlord_display_id, retailer_display_id,
        station_unit_id,
        retailer_profiles ( id, user_id, business_name ),
        station_units ( unit_code, stations ( name, filter_key ) )
      `).eq("landlord_display_id", id).maybeSingle();

  const { data: app, error: lookupErr } = await lookup;
  if (lookupErr) return res.status(500).json({ error: lookupErr.message });
  if (!app)      return res.status(404).json({ error: "Application not found" });

  // Type assertions for nested selects
  type AppRow = {
    id: string;
    landlord_display_id: string;
    retailer_display_id: string;
    station_unit_id: string;
    retailer_profiles: { id: string; user_id: string; business_name: string } | null;
    station_units: { unit_code: string; stations: { name: string; filter_key: string } | null } | null;
  };
  const a = app as unknown as AppRow;

  // Update the status
  const { error: updErr } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", a.id);

  if (updErr) return res.status(500).json({ error: updErr.message });

  // ── Notifications (server-side, persisted) ────────────────────────
  const stationName = a.station_units?.stations?.name ?? "the station";
  const unitCode    = a.station_units?.unit_code ?? "the unit";
  const businessName = a.retailer_profiles?.business_name ?? "Applicant";

  const retailerUserId = a.retailer_profiles?.user_id ?? null;
  const notifs: Array<Record<string, unknown>> = [];

  if (status === "approved") {
    if (retailerUserId) {
      notifs.push({
        user_id:   retailerUserId,
        user_role: "retailer",
        type:      "status_update",
        title:     "Application Approved",
        body:      `Your application for ${stationName} (Unit ${unitCode}) has been approved. Schedule your site walkthrough now.`,
        href:      "/retailer_backoffice/myApplicationsPage",
        read:      false,
      });
    }
    // Landlord confirmation (any landlord user — use generic role broadcast)
    const { data: landlordUser } = await supabase
      .from("users").select("id").eq("role", "landlord").limit(1).maybeSingle();
    if (landlordUser) {
      notifs.push({
        user_id:   landlordUser.id,
        user_role: "landlord",
        type:      "status_update",
        title:     "Tenant Approved",
        body:      `${businessName} has been approved for ${stationName} (Unit ${unitCode}).`,
        href:      `/landlord_backoffice/landlordBookingDiscussionPage?appId=${a.landlord_display_id}`,
        read:      false,
      });
    }
  } else if (status === "not_approved") {
    if (retailerUserId) {
      notifs.push({
        user_id:   retailerUserId,
        user_role: "retailer",
        type:      "status_update",
        title:     "Application Not Approved",
        body:      `Your application for ${stationName} (Unit ${unitCode}) was not approved. You may browse other available units.`,
        href:      "/retailer_backoffice/myApplicationsPage",
        read:      false,
      });
    }
  }

  if (notifs.length) {
    await supabase.from("notifications").insert(notifs);
  }

  return res.status(200).json({
    ok: true,
    applicationId: a.id,
    retailerAppId: a.retailer_display_id,
    landlordAppId: a.landlord_display_id,
    status,
    notificationsCreated: notifs.length,
  });
}
