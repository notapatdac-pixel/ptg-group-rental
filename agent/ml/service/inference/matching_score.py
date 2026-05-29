"""
matching_score.py — logistic-regression matching score.

Pipeline (mirrors 04_matching_score.py):
  1. Read retailer_profiles + stations.
  2. Build the cartesian product of (retailer, station) pairs (or
     restrict via MATCHING_STATION_IDS env var).
  3. Build the 12 pre-lease features per pair.
  4. Cold-start fill from matching_segment_medians.joblib.
  5. Apply matching_scaler -> predict_proba -> match_score.
  6. Compute estimated_earn_low/high = est_rev * score * 0.15/0.28.
  7. Upsert into ml_matching_scores.

Notes:
- Retailer "score (0-100)" has no source in our schema. We fall back
  to station_monthly_metrics.ai_score_pct (latest) when present and
  let the cold-start median fill the gap otherwise.
- foot_traffic ordinal comes straight from stations.traffic_level.
"""

from __future__ import annotations

import logging
import os
from typing import Any

import numpy as np
import pandas as pd

from . import load_models, supabase_io as sio

log = logging.getLogger("ptg_ml.matching_score")

MATCH_FEATURES = [
    "store_type_enc", "ret_tier_ord", "experience", "branches", "score",
    "stn_type_enc", "foot_ord", "zone_enc", "stn_tier_ord", "total_area",
    "est_rev", "base_rent",
]


def _match_label(s: float) -> str:
    if s >= 0.90:
        return "EXCELLENT"
    if s >= 0.80:
        return "STRONG"
    if s >= 0.65:
        return "MODERATE"
    return "LOW"


def _retailer_tier(profile: dict) -> str:
    """Map experience text -> a coarse tier the encoder will recognise."""
    exp_years = sio.parse_int(profile.get("experience"))
    if exp_years >= 8:
        return "High"
    if exp_years >= 3:
        return "Normal"
    return "Low"


def _station_tier(traffic_level: str) -> str:
    """Use traffic level as a proxy for station performance tier."""
    if (traffic_level or "").lower() == "high":
        return "High"
    if (traffic_level or "").lower() == "low":
        return "Low"
    return "Normal"


def run() -> dict[str, Any]:
    notes: list[str] = []
    model_version = load_models.MODEL_VERSIONS["matching_score"]
    payload = {
        "model_version": model_version,
        "rows_written": 0,
        "rows_skipped": 0,
        "generated_at": sio.now_iso(),
        "notes": notes,
    }

    model = load_models.get("matching_lr")
    scaler = load_models.get("matching_scaler")
    encoders = load_models.get("matching_encoders") or {}
    segment_medians = load_models.get("matching_segment_medians")

    if model is None or scaler is None or not encoders:
        notes.append("Matching model bundle not loaded.")
        return payload

    le_st = encoders.get("le_st")  # store_type
    le_sn = encoders.get("le_sn")  # station_type
    le_zn = encoders.get("le_zn")  # zone

    retailers = sio.fetch_retailer_profiles()
    if not retailers:
        notes.append("No retailer_profiles to score.")
        return payload

    stations_full = sio.station_lookup()  # dict display_id -> data
    # Optional restriction
    only = os.environ.get("MATCHING_STATION_IDS")
    if only:
        wanted = {s.strip() for s in only.split(",") if s.strip()}
        stations_full = {k: v for k, v in stations_full.items() if k in wanted}
    if not stations_full:
        notes.append("No stations to match against.")
        return payload

    # Build per-retailer feature row
    ret_rows: list[dict] = []
    for r in retailers:
        ret_rows.append(
            {
                "retailer_id": r["id"],
                "store_type": r.get("category") or "Unknown",
                "store_type_enc": sio.safe_encode(le_st, r.get("category")),
                "ret_tier_ord": sio.TIER_ORD.get(_retailer_tier(r), 2),
                "experience": float(sio.parse_int(r.get("experience"))),
                "branches": float(sio.parse_int(r.get("num_stores"))),
                "score": np.nan,  # no direct source — let cold start fill
            }
        )
    ret_df = pd.DataFrame(ret_rows)

    # Build per-station feature row
    stn_rows: list[dict] = []
    for display_id, st in stations_full.items():
        stn_rows.append(
            {
                "station_id": display_id,
                "stn_type_enc": sio.safe_encode(le_sn, st.get("traffic_level") or "medium"),
                "foot_ord": float(sio.FOOT_ORD.get(str(st.get("traffic_level") or "medium").lower(), 2)),
                "zone_enc": sio.safe_encode(le_zn, st.get("province") or ""),
                "stn_tier_ord": float(sio.TIER_ORD.get(_station_tier(st.get("traffic_level") or ""), 2)),
                "total_area": float(sio.parse_int(st.get("total_area")) or 0),
                "est_rev": float(sio.parse_int(st.get("est_rev")) or 0),
                "base_rent": float(sio.parse_int(st.get("base_rent")) or 0),
                "latest_ai_score_pct": float(sio.parse_int(st.get("latest_ai_score_pct")) or 0),
            }
        )
    stn_df = pd.DataFrame(stn_rows)

    # Cartesian
    ret_df["_k"] = 1
    stn_df["_k"] = 1
    pairs = ret_df.merge(stn_df, on="_k").drop(columns="_k")

    # Fill `score` with station ai_score_pct when available, else NaN
    pairs["score"] = pairs["latest_ai_score_pct"].where(pairs["latest_ai_score_pct"] > 0)

    # Cold start: any row missing any feature gets filled with segment median
    pairs["is_cold_start"] = pairs[MATCH_FEATURES].isna().any(axis=1)

    if segment_medians is not None:
        try:
            seg_df = (
                segment_medians.reset_index()
                if hasattr(segment_medians, "reset_index")
                else pd.DataFrame(segment_medians)
            )
            for col in MATCH_FEATURES:
                if col not in seg_df.columns:
                    continue
                # Map by store_type_enc
                median_lookup = dict(zip(seg_df["store_type_enc"], seg_df[col]))
                mask = pairs[col].isna()
                if mask.any():
                    pairs.loc[mask, col] = pairs.loc[mask, "store_type_enc"].map(median_lookup)
        except Exception as exc:  # noqa: BLE001
            log.warning("Could not apply segment medians: %s — falling back to column median.", exc)

    # Final fallback — column median, then 0
    for col in MATCH_FEATURES:
        med = pairs[col].median(skipna=True)
        if pd.isna(med):
            med = 0
        pairs[col] = pairs[col].fillna(med)

    X = pairs[MATCH_FEATURES].values.astype(float)
    try:
        Xs = scaler.transform(X)
        proba = model.predict_proba(Xs)
        scores = proba[:, 1] if proba.shape[1] >= 2 else proba.ravel()
    except Exception as exc:  # noqa: BLE001
        log.exception("Matching prediction failed: %s", exc)
        notes.append(f"Prediction error: {exc}")
        return payload

    pairs["match_score"] = scores
    pairs["match_pct"] = (pairs["match_score"] * 100.0).round(1)
    pairs["match_label"] = pairs["match_score"].apply(_match_label)
    pairs["estimated_earn_low_thb"] = (pairs["est_rev"] * pairs["match_score"] * 0.15).round(0)
    pairs["estimated_earn_high_thb"] = (pairs["est_rev"] * pairs["match_score"] * 0.28).round(0)

    rows_out: list[dict] = []
    for _, r in pairs.iterrows():
        rows_out.append(
            {
                "retailer_id": r["retailer_id"],
                "station_id": r["station_id"],
                "match_score": round(float(r["match_score"]), 4),
                "match_pct": float(r["match_pct"]),
                "match_label": r["match_label"],
                "estimated_earn_low_thb": float(r["estimated_earn_low_thb"]),
                "estimated_earn_high_thb": float(r["estimated_earn_high_thb"]),
                "is_cold_start": bool(r["is_cold_start"]),
                "model_version": model_version,
            }
        )

    try:
        written = sio.upsert_matching(rows_out)
    except Exception as exc:  # noqa: BLE001
        log.exception("upsert_matching failed: %s", exc)
        notes.append(f"Upsert error: {exc}")
        written = 0

    payload["rows_written"] = written
    payload["rows_skipped"] = max(0, len(rows_out) - written)
    payload["generated_at"] = sio.now_iso()
    return payload
