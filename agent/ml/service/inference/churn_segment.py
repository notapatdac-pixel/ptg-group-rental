"""
churn_segment.py — RandomForest churn early-warning model.

Pipeline (mirrors 03_churn_segment.py):
  1. Pull store_customer_segments rows from Supabase.
  2. Encode age / generation / zone / store_type / spend range using
     the saved LabelEncoders.
  3. Compute per-store cust_norm / spend_norm (z within store).
  4. Apply churn_scaler -> predict_proba.
  5. Bucket risk_prob into Critical / High / Medium / Low.
  6. Aggregate per (store, age_group, spend_range) and upsert.

Notes:
- Our schema doesn't model "Generation" — we derive a coarse value
  from the age_group label so the encoder gets a real-looking input.
- "Revenue at risk" needs (customer_count, avg_spend, risk_prob).
  customer_count = share_pct * total_traffic / 100; avg_spend from
  segment row's avg_basket_thb.
"""

from __future__ import annotations

import logging
from typing import Any

import numpy as np
import pandas as pd

from . import load_models, supabase_io as sio

log = logging.getLogger("ptg_ml.churn_segment")

FEATURES = [
    "age_enc", "gen_enc", "zone_enc", "type_enc", "spend_enc",
    "customer_count", "avg_spend_seg", "cust_norm", "spend_norm",
]


def _age_to_generation(age_group: str) -> str:
    """Map age labels like '18-25' -> 'Gen Z'.

    Training data used generation labels directly; our schema only
    stores age band strings. This mapping is approximate but produces
    plausible encoder inputs.
    """
    a = (age_group or "").lower()
    if "18" in a or "19" in a or "20" in a or "z" in a:
        return "Gen Z"
    if "25" in a or "26" in a or "30" in a or "millennial" in a or "y" in a:
        return "Millennial"
    if "40" in a or "45" in a or "x" in a:
        return "Gen X"
    if "55" in a or "60" in a or "boom" in a:
        return "Boomer"
    return "Millennial"


def _risk_level(p: float) -> str:
    if p >= 0.74:
        return "Critical"
    if p >= 0.61:
        return "High"
    if p >= 0.38:
        return "Medium"
    return "Low"


ACTIONS = {
    "Critical": "Revenue momentum critical — immediate review with retailer.",
    "High": "Schedule performance check-in with retailer.",
    "Medium": "Monitor revenue trend for next 2 months.",
    "Low": "Healthy momentum — no action required.",
}


def run() -> dict[str, Any]:
    notes: list[str] = []
    model_version = load_models.MODEL_VERSIONS["churn_segment"]
    payload = {
        "model_version": model_version,
        "rows_written": 0,
        "rows_skipped": 0,
        "generated_at": sio.now_iso(),
        "notes": notes,
    }

    model = load_models.get("churn_segment_rf")
    scaler = load_models.get("churn_scaler")
    encoders = load_models.get("churn_encoders") or {}

    if model is None or scaler is None or not encoders:
        notes.append("Churn model bundle not loaded.")
        return payload

    le_age = encoders.get("le_age")
    le_gen = encoders.get("le_gen")
    le_zone = encoders.get("le_zone")
    le_type = encoders.get("le_type")
    le_spend = encoders.get("le_spend")

    segments = sio.fetch_store_segments()
    if not segments:
        notes.append("No store_customer_segments rows in Supabase.")
        return payload

    df = pd.DataFrame(segments)
    df = df[df["segment_type"] == "age"].copy() if "segment_type" in df.columns else df

    if df.empty:
        notes.append("No age-segment rows to score.")
        return payload

    # Each segment row in our schema is one (store, age_group). We need a
    # spend_range axis — we synthesise it from the avg_basket_thb bucket.
    def basket_to_spend_range(v: Any) -> str:
        x = sio.parse_float(v)
        if x < 200:
            return "<200"
        if x < 500:
            return "200-500"
        if x < 1000:
            return "500-1000"
        return "1000+"

    df["spend_range"] = df["avg_basket_thb"].apply(basket_to_spend_range)
    df["age_group"] = df["segment_label"].astype(str)

    # Zone / store_type need station + retailer info.
    stations = sio.station_lookup()
    df["zone"] = df["store_display_id"].apply(
        lambda s: (stations.get(s, {}) or {}).get("province", "")
    )

    profiles = {p["id"]: p for p in sio.fetch_retailer_profiles()}
    apps = sio.fetch_applications()
    units = {u["id"]: u for u in sio.fetch_station_units()}
    id_to_display = {s["id"]: s.get("display_id") for s in sio.fetch_stations()}
    store_type_by_display: dict[str, str] = {}
    for app in apps:
        unit = units.get(app.get("station_unit_id"))
        if not unit:
            continue
        d = id_to_display.get(unit.get("station_id"))
        if not d:
            continue
        prof = profiles.get(app.get("retailer_profile_id"))
        if prof and prof.get("category"):
            store_type_by_display.setdefault(d, prof["category"])
    df["store_type"] = df["store_display_id"].apply(lambda s: store_type_by_display.get(s, "Unknown"))

    df["generation"] = df["age_group"].apply(_age_to_generation)

    # Approx monthly customer counts: share_pct% of station traffic.
    perf = pd.DataFrame(sio.fetch_store_performance())
    if not perf.empty:
        perf_latest = perf.sort_values(["store_display_id", "year_month"]).groupby("store_display_id").tail(1)
        traffic_by_store = dict(zip(perf_latest["store_display_id"], perf_latest["traffic"]))
    else:
        traffic_by_store = {}
    df["traffic"] = df["store_display_id"].map(lambda s: traffic_by_store.get(s, 0))
    df["customer_count"] = (df["share_pct"].astype(float) / 100.0 * df["traffic"].astype(float)).round(0)
    df["avg_spend_seg"] = df["avg_basket_thb"].astype(float)

    # Per-store z-scores (cust_norm / spend_norm)
    def _zscore(s: pd.Series) -> pd.Series:
        return (s - s.mean()) / (s.std(ddof=0) + 1)

    df["cust_norm"] = df.groupby("store_display_id")["customer_count"].transform(_zscore).fillna(0)
    df["spend_norm"] = df.groupby("store_display_id")["avg_spend_seg"].transform(_zscore).fillna(0)

    df["age_enc"] = df["age_group"].apply(lambda v: sio.safe_encode(le_age, v))
    df["gen_enc"] = df["generation"].apply(lambda v: sio.safe_encode(le_gen, v))
    df["zone_enc"] = df["zone"].apply(lambda v: sio.safe_encode(le_zone, v))
    df["type_enc"] = df["store_type"].apply(lambda v: sio.safe_encode(le_type, v))
    df["spend_enc"] = df["spend_range"].apply(lambda v: sio.safe_encode(le_spend, v))

    X_raw = df[FEATURES].fillna(0).values
    try:
        X = scaler.transform(X_raw)
        proba = model.predict_proba(X)
        # binary: column 1 is "at risk"
        risk_prob = proba[:, 1] if proba.shape[1] >= 2 else proba.ravel()
    except Exception as exc:  # noqa: BLE001
        log.exception("Churn prediction failed: %s", exc)
        notes.append(f"Prediction error: {exc}")
        return payload

    df["risk_prob"] = risk_prob
    df["risk_level"] = df["risk_prob"].apply(_risk_level)
    df["monthly_customers"] = df["customer_count"].astype(float)
    df["revenue_at_risk_annual"] = (
        df["monthly_customers"] * df["avg_spend_seg"].astype(float) * 12.0 * df["risk_prob"]
    ).round(0)

    grouped = (
        df.groupby(["store_display_id", "age_group", "spend_range"], as_index=False)
        .agg(
            n_monthly_customers=("monthly_customers", "sum"),
            avg_risk_prob_pct=("risk_prob", lambda x: round(float(x.mean()) * 100.0, 1)),
            revenue_at_risk_annual=("revenue_at_risk_annual", "sum"),
            risk_level=("risk_level", lambda x: x.value_counts().index[0]),
        )
    )
    grouped["recommended_action"] = grouped["risk_level"].map(ACTIONS)
    grouped["model_version"] = model_version

    rows_out: list[dict] = []
    for _, r in grouped.iterrows():
        rows_out.append(
            {
                "store_id": r["store_display_id"],
                "age_group": r["age_group"],
                "spend_range": r["spend_range"],
                "n_monthly_customers": float(r["n_monthly_customers"]),
                "avg_risk_prob_pct": float(r["avg_risk_prob_pct"]),
                "revenue_at_risk_annual": float(r["revenue_at_risk_annual"]),
                "risk_level": r["risk_level"],
                "recommended_action": r["recommended_action"],
                "model_version": model_version,
            }
        )

    try:
        written = sio.upsert_churn(rows_out)
    except Exception as exc:  # noqa: BLE001
        log.exception("upsert_churn failed: %s", exc)
        notes.append(f"Upsert error: {exc}")
        written = 0

    payload["rows_written"] = written
    payload["rows_skipped"] = max(0, len(rows_out) - written)
    payload["generated_at"] = sio.now_iso()
    return payload
