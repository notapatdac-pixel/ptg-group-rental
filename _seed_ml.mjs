/**
 * Seed ML model outputs for RET-001 demo data.
 * Run: node --use-system-ca _seed_ml.mjs
 *
 * Reads CSVs from C:\Users\notap\Downloads\ptg_ml\models\ and
 * upserts relevant rows into Supabase ML tables.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, resolve } from "path";

// Load .env from project root
function loadEnv() {
  try {
    const envText = readFileSync(resolve(".env"), "utf8");
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { /* .env not found — rely on process.env */ }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://hhczxngecxlufghqcpwj.supabase.co";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  (() => { throw new Error("SUPABASE_SERVICE_ROLE_KEY not found in .env or environment"); })();

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const CSV_DIR = "C:\\Users\\notap\\Downloads\\ptg_ml\\models";

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCsv(filename) {
  const text = readFileSync(join(CSV_DIR, filename), "utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h.trim(), values[i]?.trim() ?? ""]));
  });
}

function num(v) { return v === "" || v == null ? null : parseFloat(v); }
function bool(v) { return String(v).toLowerCase() === "true"; }

// ── Sales Forecasts ───────────────────────────────────────────────────────────

async function seedSalesForecasts() {
  const rows = parseCsv("sales_forecast_output.csv")
    .filter((r) => r["retailer_id"] === "RET-001");

  const records = rows.map((r) => ({
    store_id:                  r["store_id"],
    retailer_id:               r["retailer_id"],
    station_id:                r["station_id"],
    forecast_period:           r["forecast_period"],
    predicted_revenue_thb:     num(r["predicted_revenue_thb"]),
    forecast_lower_thb:        num(r["forecast_lower_thb"]),
    forecast_upper_thb:        num(r["forecast_upper_thb"]),
    pct_change_vs_last:        num(r["pct_change_vs_last"]),
    predicted_quarterly_thb:   num(r["predicted_quarterly_thb"]),
    quarterly_lower_thb:       num(r["quarterly_lower_thb"]),
    quarterly_upper_thb:       num(r["quarterly_upper_thb"]),
    predicted_avg_spend_thb:   num(r["predicted_avg_spend_thb"]),
    pct_change_spend_vs_last:  num(r["pct_change_spend_vs_last"]),
    confidence_pct:            num(r["confidence_pct"]),
    is_cold_start:             bool(r["is_cold_start"]),
    model_version:             r["model_version"],
    trained_on_period:         r["trained_on_period"],
  }));

  const { error } = await supabase
    .from("ml_sales_forecasts")
    .upsert(records, { onConflict: "store_id,forecast_period", ignoreDuplicates: false });

  if (error) throw new Error(`sales_forecasts: ${error.message}`);
  console.log(`✓ Sales forecasts: ${records.length} rows`);
}

// ── Churn Segments ────────────────────────────────────────────────────────────

async function seedChurnSegments() {
  const rows = parseCsv("churn_segment_output.csv")
    .filter((r) => ["STR-001", "STR-077"].includes(r["Store ID"]));

  const records = rows.map((r) => ({
    store_id:               r["Store ID"],
    age_group:              r["Age Group"],
    spend_range:            r["Spend Range (THB)"],
    n_monthly_customers:    num(r["n_monthly_customers"]),
    avg_risk_prob_pct:      num(r["avg_risk_prob_pct"]),
    revenue_at_risk_annual: num(r["revenue_at_risk_annual"]),
    risk_level:             r["risk_level"],
    recommended_action:     r["recommended_action"],
    model_version:          r["model_version"],
  }));

  const { error } = await supabase
    .from("ml_churn_segments")
    .upsert(records, { onConflict: "store_id,age_group,spend_range", ignoreDuplicates: false });

  if (error) throw new Error(`churn_segments: ${error.message}`);
  console.log(`✓ Churn segments: ${records.length} rows`);
}

// ── Matching Scores ───────────────────────────────────────────────────────────

async function seedMatchingScores() {
  const rows = parseCsv("matching_output.csv")
    .filter((r) => r["Retailer ID"] === "RET-001");

  const records = rows.map((r) => ({
    retailer_id:             r["Retailer ID"],
    station_id:              r["Station ID"],
    match_score:             num(r["match_score"]),
    match_pct:               num(r["match_pct"]),
    match_label:             r["match_label"],
    estimated_earn_low_thb:  num(r["estimated_earn_low_thb"]),
    estimated_earn_high_thb: num(r["estimated_earn_high_thb"]),
    is_cold_start:           bool(r["is_cold_start"]),
    model_version:           r["model_version"],
  }));

  const { error } = await supabase
    .from("ml_matching_scores")
    .upsert(records, { onConflict: "retailer_id,station_id", ignoreDuplicates: false });

  if (error) throw new Error(`matching_scores: ${error.message}`);
  console.log(`✓ Matching scores: ${records.length} rows`);
}

// ── Anomaly Alerts ────────────────────────────────────────────────────────────

async function seedAnomalyAlerts() {
  const rows = parseCsv("anomaly_output.csv")
    .filter((r) => ["STR-001", "STR-077"].includes(r["Store ID"]));

  const records = rows.map((r) => ({
    store_id:          r["Store ID"],
    period:            r["Period"],
    is_anomaly:        bool(r["is_anomaly"]),
    anomaly_score:     num(r["anomaly_score"]),
    anomaly_dimension: r["anomaly_dimension"],
    pct_deviation:     num(r["pct_deviation"]),
    direction:         r["direction"],
    severity:          r["severity"],
    suggested_action:  r["suggested_action"],
    model_version:     r["model_version"],
  }));

  const { error } = await supabase
    .from("ml_anomaly_alerts")
    .upsert(records, { onConflict: "store_id,period", ignoreDuplicates: false });

  if (error) throw new Error(`anomaly_alerts: ${error.message}`);
  console.log(`✓ Anomaly alerts: ${records.length} rows`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  try {
    await seedSalesForecasts();
    await seedChurnSegments();
    await seedMatchingScores();
    await seedAnomalyAlerts();
    console.log("\nAll ML tables seeded successfully.");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
})();
