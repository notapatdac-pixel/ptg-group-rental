import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateChatResponse } from "@/agent/ai/geminiClient";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fallback profile used when caller doesn't provide a userId or no profile
// exists for that user (shouldn't happen for the demo retailer login).
const DEMO_RETAILER_PROFILE_ID = "55555555-0000-0000-0000-000000000001";

// POST /api/retailer/apply
// Body: {
//   stationUnitId: uuid,
//   userId?:       uuid,    // logged-in retailer user
//   concept?:      string,
//   businessName?: string,
//   contactName?:  string,
//   category?:     string,
//   startDate?:    string,
//   leaseDuration?:string,
// }
//
// Side effects:
//   1. Inserts a row into `applications` (status='pending_review').
//   2. Inserts a notification for the landlord user so the new app appears
//      in their backoffice without a refresh.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    stationUnitId,
    userId,
    concept,
    businessName,
    contactName,
    category,
  } = req.body as {
    stationUnitId: string;
    userId?:       string;
    concept?:      string;
    businessName?: string;
    contactName?:  string;
    category?:     string;
  };

  if (!stationUnitId) return res.status(400).json({ error: "stationUnitId required" });

  // ── 1. Verify unit exists and is still available ──────────────────────
  const { data: unit, error: ue } = await serviceSupabase
    .from("station_units")
    .select("id, unit_code, available")
    .eq("id", stationUnitId)
    .single();

  if (ue || !unit) return res.status(404).json({ error: "Unit not found" });
  if (!unit.available) return res.status(409).json({ error: "Unit is not available" });

  const { data: existing } = await serviceSupabase
    .from("applications")
    .select("id")
    .eq("station_unit_id", stationUnitId)
    .in("status", ["pending_review", "approved"])
    .limit(1);

  if (existing && existing.length > 0) {
    return res.status(409).json({ error: "An active application already exists for this unit" });
  }

  // ── 2. Resolve retailer_profile_id from the logged-in user ────────────
  let retailerProfileId = DEMO_RETAILER_PROFILE_ID;
  if (userId) {
    const { data: prof } = await serviceSupabase
      .from("retailer_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (prof?.id) retailerProfileId = prof.id;
  }

  // ── 3. Optionally update the retailer's profile with edited form values
  //       so the next application autofills the latest data.
  const profileUpdates: Record<string, string> = {};
  if (typeof businessName === "string" && businessName.trim()) profileUpdates.business_name = businessName.trim();
  if (typeof contactName  === "string" && contactName.trim())  profileUpdates.owner_name     = contactName.trim();
  if (typeof category     === "string" && category.trim())     profileUpdates.category      = category.trim();
  if (typeof concept      === "string" && concept.trim())      profileUpdates.concept       = concept.trim();
  if (Object.keys(profileUpdates).length > 0) {
    await serviceSupabase
      .from("retailer_profiles")
      .update(profileUpdates)
      .eq("id", retailerProfileId);
  }

  // ── 4. AI context fetch ──────────────────────────────────────────────
  const { data: unitDetail } = await serviceSupabase
    .from("station_units")
    .select("unit_code, unit_label, price_thb, stations(name, province, traffic_level)")
    .eq("id", stationUnitId)
    .single();

  const { data: profile } = await serviceSupabase
    .from("retailer_profiles")
    .select("business_name, category, experience, num_stores, max_budget, concept, user_id")
    .eq("id", retailerProfileId)
    .single();

  // Lookup applicant display name (users.name) for nicer landlord cards
  let applicantName = "";
  if (profile?.user_id) {
    const { data: userRow } = await serviceSupabase
      .from("users").select("name").eq("id", profile.user_id).maybeSingle();
    applicantName = userRow?.name ?? "";
  }
  if (!applicantName) applicantName = contactName ?? profile?.business_name ?? "Applicant";

  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  const retailerDisplayId = `PTG-APP-${year}-${rand}`;
  const landlordDisplayId  = `LAND-APP-${year}-${rand}`;
  const today = new Date().toISOString().split("T")[0];

  const systemPrompt = "You are a PTG leasing specialist AI. Write a 2-3 sentence professional business summary for a landlord reviewing this retail application. Focus on business fit, revenue potential, and key strengths or risks. English only.";
  const userMessage = `Applicant: ${profile?.business_name ?? businessName ?? "Retailer"} | Category: ${profile?.category ?? category ?? "General"}
Experience: ${profile?.experience ?? "N/A"} | Stores: ${profile?.num_stores ?? "1"} | Budget: ฿${profile?.max_budget ?? "N/A"}/mo
Concept: ${concept ?? profile?.concept ?? "Not specified"}
Unit: ${unitDetail?.unit_code} (${unitDetail?.unit_label}) at ${(unitDetail?.stations as any)?.name}, ${(unitDetail?.stations as any)?.province}
Rent: ฿${unitDetail?.price_thb?.toLocaleString()}/mo | Traffic: ${(unitDetail?.stations as any)?.traffic_level}`;

  let aiText: string;
  let aiTextTh: string;
  try {
    aiText = await generateChatResponse(systemPrompt, [], userMessage);
    aiTextTh = await generateChatResponse(
      "You are a professional Thai translator. Translate to Thai, keep it professional and concise.",
      [],
      aiText
    );
  } catch {
    aiText = `${profile?.business_name ?? businessName ?? "Applicant"} has applied for ${unitDetail?.unit_code ?? "a unit"}. Under review by PTG specialist team.`;
    aiTextTh = `ผู้สมัครได้ยื่นคำขอเช่าพื้นที่และอยู่ระหว่างการพิจารณาโดยทีม PTG`;
  }

  // ── 5. Insert application ────────────────────────────────────────────
  const { data: newApp, error: ae } = await serviceSupabase
    .from("applications")
    .insert({
      retailer_display_id: retailerDisplayId,
      landlord_display_id: landlordDisplayId,
      retailer_profile_id: retailerProfileId,
      station_unit_id:     stationUnitId,
      status:              "pending_review",
      ai_score:            "89%",
      ai_text:             aiText,
      ai_text_th:          aiTextTh,
      est_revenue_thb:     "95000",
      panel_color:         "#E65100",
      applied_date:        today,
      specialist_name:     "Kanya Srisuk",
      specialist_initials: "KS",
    })
    .select("id, retailer_display_id, landlord_display_id")
    .single();

  if (ae || !newApp) return res.status(500).json({ error: ae?.message ?? "Failed to create application" });

  // ── 6. Notify the landlord ───────────────────────────────────────────
  //     Server-side insert so user_id is correctly the landlord — the
  //     client-side notificationStore.addNotification always uses the
  //     CURRENT user's id (the retailer here), so we can't rely on it
  //     for cross-party notifications.
  const stationName = (unitDetail?.stations as { name?: string } | null)?.name ?? "PTG Station";
  const unitCode    = unitDetail?.unit_code ?? "Unit";
  const bizForNotif = profile?.business_name ?? businessName ?? "A retailer";

  const { data: landlordUser } = await serviceSupabase
    .from("users")
    .select("id")
    .eq("role", "landlord")
    .limit(1)
    .maybeSingle();

  if (landlordUser?.id) {
    await serviceSupabase.from("notifications").insert({
      user_id:   landlordUser.id,
      user_role: "landlord",
      type:      "status_update",
      title:     `New Application — ${stationName}`,
      body:      `${bizForNotif} applied for Unit ${unitCode} at ${stationName}.`,
      href:      "/landlord_backoffice/landlordApplicationsPage",
      read:      false,
    });
  }

  return res.status(201).json({
    id:                newApp.id,
    retailerDisplayId: newApp.retailer_display_id,
    landlordDisplayId: newApp.landlord_display_id,
    submittedAt:       new Date().toISOString(),
  });
}
