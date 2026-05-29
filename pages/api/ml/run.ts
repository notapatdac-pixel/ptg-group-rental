import type { NextApiRequest, NextApiResponse } from "next";

// POST /api/ml/run?model=all|forecast|churn|matching|anomaly
//
// Proxies to a local Python ML service. The ML service is expected
// to read from station_monthly_metrics + store_monthly_pnl etc.,
// run its models, and UPSERT into ml_sales_forecasts / ml_churn_segments
// / ml_matching_scores / ml_anomaly_alerts.
//
// Env:
//   ML_SERVICE_URL  default http://localhost:8000
//
// Body of upstream call is forwarded as-is from req.body (so callers
// can pass training hyper-params if they ever want to).

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const TIMEOUT_MS = 60_000;

const VALID_MODELS = new Set(["all", "forecast", "churn", "matching", "anomaly"]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const model = (typeof req.query.model === "string" ? req.query.model : "all").toLowerCase();
  if (!VALID_MODELS.has(model)) {
    return res.status(400).json({
      error: `Invalid model. Must be one of: ${Array.from(VALID_MODELS).join(", ")}`,
    });
  }

  const path = model === "all" ? "/ml/run-all" : `/ml/${model}`;
  const url = `${ML_SERVICE_URL.replace(/\/$/, "")}${path}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body ?? {}),
      signal: controller.signal,
    });

    clearTimeout(timer);

    const contentType = upstream.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await upstream.json().catch(() => ({}))
      : { raw: await upstream.text().catch(() => "") };

    if (!upstream.ok) {
      return res.status(502).json({
        error: "ML service returned non-2xx",
        upstream_status: upstream.status,
        upstream_body: payload,
      });
    }

    return res.status(200).json({
      model,
      url,
      ...payload,
    });
  } catch (err) {
    clearTimeout(timer);
    const isAbort = err instanceof Error && err.name === "AbortError";
    return res.status(isAbort ? 504 : 502).json({
      error: isAbort
        ? `ML service did not respond within ${TIMEOUT_MS / 1000}s`
        : "Failed to reach ML service",
      detail: err instanceof Error ? err.message : String(err),
      url,
    });
  }
}
