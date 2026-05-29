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
      .select("id, user_id, business_name, category, experience, num_stores, max_budget, concept")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return res.status(200).json({
        businessName: "",
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
      category:     data.category,
      experience:   data.experience,
      numStores:    data.num_stores,
      maxBudget:    data.max_budget,
      concept:      data.concept,
    });
  }

  if (req.method === "PATCH") {
    const { userId, businessName, category, experience, numStores, maxBudget, concept } = req.body as {
      userId:       string;
      businessName: string;
      category:     string;
      experience:   string;
      numStores:    string;
      maxBudget:    string;
      concept:      string;
    };

    if (!userId) return res.status(400).json({ error: "userId required" });

    const { error } = await serviceSupabase
      .from("retailer_profiles")
      .update({
        business_name: businessName,
        category,
        experience,
        num_stores:    numStores,
        max_budget:    maxBudget,
        concept,
      })
      .eq("user_id", userId);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
