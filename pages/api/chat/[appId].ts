import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET  /api/chat/[appId]                                  → list messages
// POST /api/chat/[appId]  body { senderRole, senderName, content, userId? }
//
// `appId` may be either retailer_display_id (PTG-APP-…) or landlord_display_id
// (LAND-APP-…). Both resolve to the same applications.id.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { appId } = req.query as { appId?: string };
  if (!appId) return res.status(400).json({ error: "Missing appId" });

  // Resolve to applications.id
  const lookup = appId.startsWith("PTG-APP-")
    ? supabase.from("applications").select("id").eq("retailer_display_id", appId).maybeSingle()
    : supabase.from("applications").select("id").eq("landlord_display_id", appId).maybeSingle();
  const { data: app, error: lookupErr } = await lookup;
  if (lookupErr) return res.status(500).json({ error: lookupErr.message });
  if (!app)      return res.status(404).json({ error: "Application not found" });

  const applicationId = (app as { id: string }).id;

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, sender_role, sender_user_id, sender_name, content, created_at")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ applicationId, messages: data ?? [] });
  }

  if (req.method === "POST") {
    const { senderRole, senderName, content, userId } = (req.body ?? {}) as {
      senderRole?: "retailer" | "landlord" | "specialist";
      senderName?: string;
      content?:    string;
      userId?:     string;
    };
    if (!senderRole || !content?.trim()) {
      return res.status(400).json({ error: "senderRole and content are required" });
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        application_id: applicationId,
        sender_role:    senderRole,
        sender_user_id: userId ?? null,
        sender_name:    senderName ?? "",
        content:        content.trim(),
      })
      .select("id, sender_role, sender_user_id, sender_name, content, created_at")
      .single();

    if (error || !data) return res.status(500).json({ error: error?.message ?? "Failed to send" });
    return res.status(201).json(data);
  }

  return res.status(405).end();
}
