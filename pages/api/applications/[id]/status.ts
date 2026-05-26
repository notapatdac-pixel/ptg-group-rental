import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH /api/applications/[id]/status
// Body: { status: "approved" | "not_approved" | "pending_review" }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query as { id: string };
  const { status } = req.body as { status: string };

  if (!["approved", "not_approved", "pending_review"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const { error } = await serviceSupabase
    .from("applications")
    .update({ status })
    .eq("landlord_display_id", id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
