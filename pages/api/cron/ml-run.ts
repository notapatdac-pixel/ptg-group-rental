import type { NextApiRequest, NextApiResponse } from "next";

// Allow this serverless function the longest practical wait (Vercel Hobby caps
// at 60s). The ML run can take longer than that — see the abort logic below.
export const config = { maxDuration: 60 };

// How long we wait for the ML run before returning. The ML service's
// /ml/run-all is a SYNC FastAPI endpoint (runs in a threadpool), so it finishes
// server-side even if we stop waiting here — so a timeout is "still running",
// not a failure. We cap below Vercel's 60s limit so we exit cleanly.
const TRIGGER_WAIT_MS = 50_000;

// Vercel Cron entry (see vercel.json: daily 18:00 UTC ≈ 01:00 Bangkok).
// Vercel cron runs THIS Next.js route on schedule — it cannot run the Python ML
// service itself, so this route TRIGGERS inference on the hosted ML service
// (ML_SERVICE_URL, e.g. the Render deployment). If ML_SERVICE_URL is unset it
// logs and no-ops.
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

  // Cap the wait so a cold start (Render free tier sleeps) or a long run never
  // pushes us past the function timeout — the ML keeps running on its own.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TRIGGER_WAIT_MS);

  try {
    const r = await fetch(`${mlUrl.replace(/\/$/, "")}/ml/run-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    console.log(`[cron/ml-run] ML refresh completed → ${r.status}`);
    return res.status(200).json({ ok: r.ok, ran: true, status: r.status });
  } catch (err) {
    clearTimeout(timeout);
    // Abort = we stopped waiting, but the trigger was sent and the sync ML run
    // continues server-side. Report it as triggered, not failed.
    if (err instanceof Error && err.name === "AbortError") {
      console.log("[cron/ml-run] ML trigger sent; still running (stopped waiting for completion).");
      return res.status(200).json({ ok: true, ran: true, note: "triggered; completion not awaited" });
    }
    console.error("[cron/ml-run] failed:", err instanceof Error ? err.message : err);
    return res.status(200).json({ ok: false, ran: false, error: String(err) });
  }
}
