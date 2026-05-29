"""
anomaly_detection.py — Isolation Forest anomaly scorer.

Pipeline (mirrors 05_anomaly_detection.py):
  1. Pull per-store monthly metrics.
  2. Compute 3-month rolling baseline (shift=1, min_periods=2) and
     raw_dev = (actual - rolling) / (|rolling| + 1) for each metric.
  3. Z-score each dev column on the inference batch.
     NOTE: training-batch mu/std were not saved in the joblib bundle,
     so we recompute on the inference batch. Acceptable approximation
     until v3 retrain serialises those stats.
  4. Apply anomaly_scaler -> predict + score_samples.
  5. For flagged rows, pick the dimension with highest |z|, then
     decide direction/severity/action and upsert into ml_anomaly_alerts.
"""

from __future__ import annotations

import logging
from typing import Any

import numpy as np
import pandas as pd

from . import load_models, supabase_io as sio

log = logging.getLogger("ptg_ml.anomaly_detection")

DIM_COLS = ["revenue", "visitors", "avg_spend", "conv_rate"]
DEV_COLS = [f"{c}_raw_dev" for c in DIM_COLS]


def _severity(score: float, direction: str, dim: str) -> str:
    positive_metrics = {"revenue", "visitors", "conv_rate"}
    if direction == "above" and dim in positive_metrics:
        return "good_news"
    if score < -0.15:
        return "critical"
    return "watch"


def _action(dim: str, direction: str, severity: str, pct: float) -> str:
    pct_abs = abs(round(pct * 100, 0))
    if severity == "good_news":
        return {
            "revenue":  f"Revenue was {pct_abs}% above normal — consider extending hours or adding staff.",
            "visitors": f"Foot traffic was {pct_abs}% higher than usual — prepare stock and staff.",
            "conv_rate":f"Conversion rate improved {pct_abs}% — analyse what worked and replicate.",
        }.get(dim, "Positive signal — investigate and replicate.")
    return {
        ("revenue", "below"):   f"Revenue was {pct_abs}% below expected — check payment records and promotions.",
        ("visitors", "below"):  f"Fewer visitors than normal ({pct_abs}% drop) — consider a promotional push.",
        ("avg_spend", "above"): f"Average spend jumped {pct_abs}% — identify which products drove this.",
        ("avg_spend", "below"): f"Average spend dropped {pct_abs}% — run a bundle deal.",
        ("conv_rate", "below"): f"Conversion rate dropped {pct_abs}% — review product placement or run a promo.",
    }.get((dim, direction), "Review metrics for this period.")


def run() -> dict[str, Any]:
    notes: list[str] = []
    model_version = load_models.MODEL_VERSIONS["anomaly_detection"]
    payload = {
        "model_version": model_version,
        "rows_written": 0,
        "rows_skipped": 0,
        "generated_at": sio.now_iso(),
        "notes": notes,
    }

    iso = load_models.get("anomaly_isoforest")
    scaler = load_models.get("anomaly_scaler")
    if iso is None or scaler is None:
        notes.append("Anomaly model bundle not loaded.")
        return payload

    rows = sio.assemble_store_monthly()
    if not rows:
        notes.append("No store_monthly_pnl / performance rows found.")
        return payload

    df = pd.DataFrame(rows).sort_values(["store_id", "year_num", "month_num"]).copy()

    # mom_rev — % change vs previous row per store
    df["mom_rev"] = df.groupby("store_id")["revenue"].pct_change().fillna(0) * 100

    # Rolling baselines + raw deviations.
    # Denominator uses max(|rolling|, |actual|*0.5, 1) — without the
    # |actual|*0.5 floor, a zero baseline (cold-start that slipped through
    # fillna) would yield raw_dev = actual / 1 = actual, polluting alerts
    # with values like 340 (raw traffic count) when the math expects a
    # fraction in roughly [-1, 1].
    for col in DIM_COLS:
        df[f"{col}_roll3"] = df.groupby("store_id")[col].transform(
            lambda x: x.shift(1).rolling(3, min_periods=2).mean()
        )
        denom = (
            df[f"{col}_roll3"].abs().clip(lower=1.0)
            .where(df[f"{col}_roll3"].abs() > 0, df[col].abs() * 0.5 + 1.0)
        )
        df[f"{col}_raw_dev"] = (df[col] - df[f"{col}_roll3"]) / denom

    # Drop both NaN baselines AND zero baselines (cold start in disguise).
    baseline_ok = pd.Series(True, index=df.index)
    for col in DIM_COLS:
        baseline_ok &= df[f"{col}_roll3"].notna() & (df[f"{col}_roll3"] > 0)
    df_c = df[baseline_ok].dropna(subset=DEV_COLS + DIM_COLS).copy().reset_index(drop=True)
    if df_c.empty:
        notes.append("All rows are cold-start (need 2+ months of non-zero baselines).")
        return payload

    # Z-score per dev dimension (NOTE: training batch stats unavailable)
    for col in DEV_COLS:
        mu = df_c[col].mean()
        std = df_c[col].std() + 1e-8
        df_c[f"{col}_z"] = (df_c[col] - mu) / std

    z_cols = [f"{c}_z" for c in DEV_COLS]
    anom_feat = list(dict.fromkeys(DIM_COLS + ["mom_rev"] + z_cols))

    try:
        X = scaler.transform(df_c[anom_feat].fillna(0).values)
    except Exception as exc:  # noqa: BLE001
        # Scaler was fit on a specific column set; if shape differs the user
        # needs to be told — fall back to direct prediction.
        log.warning("Anomaly scaler.transform failed (%s) — using unscaled features.", exc)
        notes.append(f"Scaler shape mismatch: {exc} — used unscaled input.")
        X = df_c[anom_feat].fillna(0).values.astype(float)

    try:
        flags = iso.predict(X)             # -1 anomaly, 1 normal
        scores = iso.score_samples(X)
    except Exception as exc:  # noqa: BLE001
        log.exception("Isolation forest prediction failed: %s", exc)
        notes.append(f"Prediction error: {exc}")
        return payload

    df_c["is_anomaly"] = (flags == -1)
    df_c["anomaly_score"] = scores

    anoms = df_c[df_c["is_anomaly"]].copy()
    if anoms.empty:
        notes.append("No anomalies detected on the latest batch.")
        # Still no rows written — that's fine.
        payload["generated_at"] = sio.now_iso()
        return payload

    def _pick_dim(row: pd.Series) -> str:
        best = "revenue"
        best_val = -1.0
        for dim in DIM_COLS:
            v = abs(float(row.get(f"{dim}_raw_dev_z", 0.0)))
            if v > best_val:
                best_val = v
                best = dim
        return best

    rows_out: list[dict] = []
    for _, row in anoms.iterrows():
        dim = _pick_dim(row)
        pct = float(row.get(f"{dim}_raw_dev", 0.0) or 0.0)
        # Final safety clamp: pct should be a fraction in roughly [-1, 1].
        # Larger absolute values mean the baseline was unstable — clip
        # rather than write nonsense like "340% deviation".
        pct = max(-1.5, min(1.5, pct))
        direction = "above" if pct > 0 else "below"
        sev = _severity(float(row["anomaly_score"]), direction, dim)
        rows_out.append(
            {
                "store_id": row["store_id"],
                "period": f"{int(row['year_num']):04d}-{int(row['month_num']):02d}",
                "is_anomaly": True,
                "anomaly_score": round(float(row["anomaly_score"]), 6),
                "anomaly_dimension": dim,
                "pct_deviation": round(pct, 4),
                "direction": direction,
                "severity": sev,
                "suggested_action": _action(dim, direction, sev, pct),
                "model_version": model_version,
            }
        )

    try:
        written = sio.upsert_anomalies(rows_out)
    except Exception as exc:  # noqa: BLE001
        log.exception("upsert_anomalies failed: %s", exc)
        notes.append(f"Upsert error: {exc}")
        written = 0

    payload["rows_written"] = written
    payload["rows_skipped"] = max(0, len(rows_out) - written)
    payload["generated_at"] = sio.now_iso()
    return payload
