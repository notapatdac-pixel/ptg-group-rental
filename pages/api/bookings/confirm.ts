import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/bookings/confirm
// Body: {
//   appId:      string,  // retailer_display_id OR landlord_display_id
//   visitDate:  string,  // "YYYY-MM-DD" or "29 May 2026" — we'll accept either
//   visitTime:  string,  // "14:00"
// }
//
// Effects:
//   - Inserts (or updates) a row in `bookings` with status='confirmed'
//   - Inserts a notification for the LANDLORD user so the booking appears
//     in their backoffice immediately.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { appId, visitDate, visitTime } = (req.body ?? {}) as {
    appId?:     string;
    visitDate?: string;
    visitTime?: string;
  };

  if (!appId || !visitDate || !visitTime) {
    return res.status(400).json({ error: "appId, visitDate, visitTime are required" });
  }

  // Resolve application — accept either landlord_display_id or retailer_display_id
  const lookup = appId.startsWith("PTG-APP-")
    ? supabase.from("applications").select(`
        id, landlord_display_id, retailer_display_id,
        retailer_profiles ( business_name ),
        station_units ( unit_code, stations ( name ) )
      `).eq("retailer_display_id", appId).maybeSingle()
    : supabase.from("applications").select(`
        id, landlord_display_id, retailer_display_id,
        retailer_profiles ( business_name ),
        station_units ( unit_code, stations ( name ) )
      `).eq("landlord_display_id", appId).maybeSingle();

  const { data: app, error: lookupErr } = await lookup;
  if (lookupErr) return res.status(500).json({ error: lookupErr.message });
  if (!app)      return res.status(404).json({ error: "Application not found" });

  type AppRow = {
    id: string;
    landlord_display_id: string;
    retailer_display_id: string;
    retailer_profiles: { business_name: string } | null;
    station_units: { unit_code: string; stations: { name: string } | null } | null;
  };
  const a = app as unknown as AppRow;

  // Normalise visitDate to ISO date if needed
  let isoDate = visitDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
    const d = new Date(visitDate);
    if (!isNaN(d.getTime())) isoDate = d.toISOString().split("T")[0];
  }

  // Upsert booking — one active booking per application
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("application_id", a.id)
    .limit(1)
    .maybeSingle();

  let bookingId: string;
  if (existing?.id) {
    const { error: upErr } = await supabase
      .from("bookings")
      .update({ visit_date: isoDate, visit_time: visitTime, status: "confirmed" })
      .eq("id", existing.id);
    if (upErr) return res.status(500).json({ error: upErr.message });
    bookingId = existing.id;
  } else {
    const { data: ins, error: insErr } = await supabase
      .from("bookings")
      .insert({
        application_id: a.id,
        visit_date:     isoDate,
        visit_time:     visitTime,
        status:         "confirmed",
      })
      .select("id")
      .single();
    if (insErr || !ins) return res.status(500).json({ error: insErr?.message ?? "Failed to create booking" });
    bookingId = ins.id;
  }

  // Notify the landlord
  const stationName = a.station_units?.stations?.name ?? "PTG Station";
  const unitCode    = a.station_units?.unit_code ?? "Unit";
  const bizName     = a.retailer_profiles?.business_name ?? "The tenant";

  const { data: landlordUser } = await supabase
    .from("users").select("id").eq("role", "landlord").limit(1).maybeSingle();

  if (landlordUser?.id) {
    await supabase.from("notifications").insert({
      user_id:   landlordUser.id,
      user_role: "landlord",
      type:      "booking",
      title:     "Walkthrough Confirmed by Tenant",
      body:      `${bizName} confirmed the walkthrough for ${isoDate} at ${visitTime} (${stationName} · Unit ${unitCode}).`,
      href:      `/landlord_backoffice/landlordUpcomingBookingPage?appId=${a.landlord_display_id}`,
      read:      false,
    });
  }

  return res.status(200).json({
    ok: true,
    bookingId,
    applicationId: a.id,
    retailerAppId: a.retailer_display_id,
    landlordAppId: a.landlord_display_id,
    visitDate:     isoDate,
    visitTime,
  });
}
