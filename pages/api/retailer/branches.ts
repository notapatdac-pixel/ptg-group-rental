import type { NextApiRequest, NextApiResponse } from "next";
import { RETAILER_STORES } from "@/lib/retailerStores";

// GET /api/retailer/branches — the demo retailer's stores for the store filter.
// Sourced from the single config (lib/retailerStores) so the dropdown, the
// dashboards, and the ML API can never drift apart. Each label carries the
// store TYPE so the multi-format operator is visible in the filter.
// Returns [{ id: storeId (STN-xxx), name }].
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const branches = RETAILER_STORES.map((s) => ({
    id:   s.storeId,
    name: `${s.brand} · ${s.shortName}`,
  }));

  return res.status(200).json(branches);
}
