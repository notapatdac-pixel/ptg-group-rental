import type { NextApiRequest, NextApiResponse } from "next";

// Vercel Cron entry (see vercel.json: daily 18:00 UTC ≈ 01:00 Bangkok).
// Vercel cron runs THIS Next.js route on schedule — it cannot run the Python ML
// service itself, so this route TRIGGERS inference on the hosted ML service
// (ML_SERVICE_URL). The Python service (agent/ml/service) must be deployed
// somewhere reachable; if ML_SERVICE_URL is unset it logs and no-ops.
//
// Auth: when CRON_SECRET is set, Vercel sends `Authorization: Bearer <secret>`.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const mlUrl = process.env.ML_SERVICE_URL;
  if (!mlUrl) {
    console.log("[cron/ml-run] ML_SERVICE_URL not configured — skipping ML refresh.");
    return res.status(200).json({ ok: true, ran: false, reason: "ML_SERVICE_URL not configured" });
  }

  try {
    const r = await fetch(`${mlUrl.replace(/\/$/, "")}/ml/run-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    console.log(`[cron/ml-run] ML refresh triggered → ${r.status}`);
    return res.status(200).json({ ok: r.ok, ran: true, status: r.status });
  } catch (err) {
    console.error("[cron/ml-run] failed:", err instanceof Error ? err.message : err);
    return res.status(200).json({ ok: false, ran: false, error: String(err) });
  }
}
