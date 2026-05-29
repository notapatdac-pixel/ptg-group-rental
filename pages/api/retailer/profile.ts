import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId required" });
    }

    const { data, error } = await serviceSupabase
      .from("retailer_profiles")
      .select("id, user_id, business_name, category, experience, num_stores, max_budget, concept, owner_name, phone")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return res.status(200).json({
        businessName: "",
        contactName:  "",
        phone:        "",
        category:     "",
        experience:   "",
        numStores:    "",
        maxBudget:    "",
        concept:      "",
      });
    }

    return res.status(200).json({
      id:           data.id,
      businessName: data.business_name,
      contactName:  data.owner_name ?? "",
      phone:        data.phone ?? "",
      category:     data.category,
      experience:   data.experience,
      numStores:    data.num_stores,
      maxBudget:    data.max_budget,
      concept:      data.concept,
    });
  }

  if (req.method === "PATCH") {
    const { userId, businessName, contactName, phone, category, experience, numStores, maxBudget, concept } = req.body as {
      userId:       string;
      businessName: string;
      contactName?: string;
      phone?:       string;
      category:     string;
      experience:   string;
      numStores:    string;
      maxBudget:    string;
      concept:      string;
    };

    if (!userId) return res.status(400).json({ error: "userId required" });

    const fields = {
      business_name: businessName,
      owner_name:    contactName ?? null,
      phone:         phone ?? null,
      category,
      experience,
      num_stores:    numStores,
      max_budget:    maxBudget,
      concept,
    };

    // No unique constraint on user_id (tenant demo profiles share one), so we
    // can't upsert — find the user's row and update it, or insert if none yet
    // (new accounts). id has a gen_random_uuid() default.
    const { data: existing } = await serviceSupabase
      .from("retailer_profiles")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    const { error } = existing?.id
      ? await serviceSupabase.from("retailer_profiles").update(fields).eq("id", existing.id)
      : await serviceSupabase.from("retailer_profiles").insert({ user_id: userId, ...fields });

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
