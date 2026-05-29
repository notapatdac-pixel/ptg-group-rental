"""
sales_forecast.py — runs the XGBoost revenue + avg-spend models.

Pipeline (matches the training script 02_sales_forecast.py):
  1. Build per-store monthly frame from Supabase.
  2. Sort + compute lag1/2/3 + roll3 (shift=1, min_periods=2).
  3. LabelEncode store_type and zone (safe — unknown -> 0).
  4. Predict revenue with sales_revenue_xgb (no scaling).
  5. Predict spend with sales_spend_xgb after sales_spend_scaler.
  6. Build CI from training residual std (1.96 * std).
  7. Cold-start flag for stores with fewer than 2 history rows.
  8. Upsert into ml_sales_forecasts.

Returns: {model_version, rows_written, rows_skipped, notes, generated_at}
"""

from __future__ import annotations

import logging
import os
from typing import Any

import numpy as np
import pandas as pd

from . import load_models, supabase_io as sio

log = logging.getLogger("ptg_ml.sales_forecast")

REVENUE_FEATURES = [
    "revenue_lag1", "revenue_lag2", "revenue_lag3",
    "visitors_lag1", "visitors_lag2", "visitors_roll3",
    "revenue_roll3", "conv_roll3",
    "month_num", "season", "rent",
    "store_type_enc", "zone_enc",
]

SPEND_FEATURES = [
    "spend_lag1", "spend_lag2", "spend_lag3",
    "spend_roll3", "conv_lag1", "conv_roll3",
    "visitors_lag1", "visitors_roll3",
    "month_num", "season",
    "store_type_enc", "zone_enc",
]

# From schemas/sales_forecast.json. We can't recompute training residual
# std from inference data so we read it from the published metrics.
RESIDUAL_STD_REVENUE = 13736.01
RESIDUAL_STD_SPEND = 759.52
CONFIDENCE = 0.99
TRAINED_ON = "2024-01 to 2024-04 (time-based split)"


def _build_frame() -> pd.DataFrame:
    rows = sio.assemble_store_monthly()
    if not rows:
        return pd.DataFrame()
    df = pd.DataFrame(rows)

    # Lookup station + retailer info per store for type/zone.
    stations = sio.station_lookup()
    # store_display_id is the station's display_id in our 1:1 mapping.
    df["zone"] = df["store_id"].map(lambda s: (stations.get(s, {}) or {}).get("province", ""))

    # Store Type pulled from retailer profile via applications.
    profiles = {p["id"]: p for p in sio.fetch_retailer_profiles()}
    apps = sio.fetch_applications()
    # map station unit -> station -> display_id; coarse but good enough
    units = {u["id"]: u for u in sio.fetch_station_units()}
    id_to_display = {st_id: st_data.get("display_id") for st_id, st_data in
                     ((s["id"], s) for s in stations.values() if s.get("id"))}

    store_type_by_display: dict[str, str] = {}
    for app in apps:
        unit = units.get(app.get("station_unit_id"))
        if not unit:
            continue
        display_id = id_to_display.get(unit.get("station_id"))
        if not display_id:
            continue
        profile = profiles.get(app.get("retailer_profile_id"))
        if profile and profile.get("category"):
            store_type_by_display.setdefault(display_id, profile["category"])

    df["store_type"] = df["store_id"].map(lambda s: store_type_by_display.get(s, "Unknown"))
    return df


def _add_lags(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(["store_id", "year_num", "month_num"]).copy()
    grp = df.groupby("store_id")

    for lag in (1, 2, 3):
        df[f"revenue_lag{lag}"] = grp["revenue"].shift(lag)
        df[f"spend_lag{lag}"] = grp["avg_spend"].shift(lag)
        df[f"visitors_lag{lag}"] = grp["visitors"].shift(lag)
        df[f"conv_lag{lag}"] = grp["conv_rate"].shift(lag)

    df["revenue_roll3"] = grp["revenue"].transform(
        lambda x: x.shift(1).rolling(3, min_periods=2).mean()
    )
    df["spend_roll3"] = grp["avg_spend"].transform(
        lambda x: x.shift(1).rolling(3, min_periods=2).mean()
    )
    df["visitors_roll3"] = grp["visitors"].transform(
        lambda x: x.shift(1).rolling(3, min_periods=2).mean()
    )
    df["conv_roll3"] = grp["conv_rate"].transform(
        lambda x: x.shift(1).rolling(3, min_periods=2).mean()
    )

    df["season"] = ((df["month_num"] - 1) // 3 + 1).astype(float)
    return df


def run() -> dict[str, Any]:
    notes: list[str] = []
    model_version = load_models.MODEL_VERSIONS["sales_forecast"]
    payload = {
        "model_version": model_version,
        "rows_written": 0,
        "rows_skipped": 0,
        "generated_at": sio.now_iso(),
        "notes": notes,
    }

    model_rev = load_models.get("sales_revenue_xgb")
    model_sp = load_models.get("sales_spend_xgb")
    scaler_sp = load_models.get("sales_spend_scaler")
    le_store = load_models.get("le_store_type")
    le_zone = load_models.get("le_zone")

    if any(m is None for m in (model_rev, model_sp, scaler_sp, le_store, le_zone)):
        msg = "Required model files missing for sales forecast"
        log.error(msg)
        notes.append(msg)
        return payload

    df = _build_frame()
    if df.empty:
        notes.append("No store_monthly_pnl / performance rows found.")
        return payload

    df = _add_lags(df)

    # Encode categoricals (safe — unknown -> 0)
    df["store_type_enc"] = df["store_type"].apply(lambda v: sio.safe_encode(le_store, v))
    df["zone_enc"] = df["zone"].apply(lambda v: sio.safe_encode(le_zone, v))

    # Take latest non-empty row per store
    latest = df.sort_values(["store_id", "year_num", "month_num"]).groupby("store_id").tail(1).copy()

    # Cold start = fewer than 2 history months for this store, i.e. roll3 NaN
    latest["is_cold_start"] = latest["revenue_roll3"].isna() | latest["spend_roll3"].isna()
    cold_count = int(latest["is_cold_start"].sum())
    if cold_count:
        notes.append(f"{cold_count} cold-start store(s) — filling missing lags with 0.")

    # Build forecast period = max year_month + 1
    forecast_period_env = os.environ.get("FORECAST_PERIOD")
    if forecast_period_env:
        forecast_period = forecast_period_env
    else:
        last_yr = int(df["year_num"].max())
        last_mo = int(df[df["year_num"] == last_yr]["month_num"].max())
        last_ym = f"{last_yr:04d}-{last_mo:02d}"
        forecast_period = sio.next_month(last_ym)

    # Revenue predictions
    X_rev = latest[REVENUE_FEATURES].fillna(0).values
    y_rev = model_rev.predict(X_rev)
    y_rev_lo = y_rev - 1.96 * RESIDUAL_STD_REVENUE
    y_rev_hi = y_rev + 1.96 * RESIDUAL_STD_REVENUE
    y_rev_lo = np.clip(y_rev_lo, 0, None)  # no negative revenue

    # Spend predictions (require scaler)
    X_sp_raw = latest[SPEND_FEATURES].fillna(0).values
    try:
        X_sp = scaler_sp.transform(X_sp_raw)
        y_sp = model_sp.predict(X_sp)
    except Exception as exc:  # noqa: BLE001
        log.exception("Spend prediction failed: %s", exc)
        y_sp = np.zeros(len(latest))
        notes.append("Spend model prediction failed — falling back to 0.")

    # Quarterly with decay (×1 + ×0.95 + ×0.90 = 2.85)
    quarterly_factor = 1 + 0.95 + 0.90

    rev_lag1 = latest["revenue_lag1"].fillna(0).values
    sp_lag1 = latest["spend_lag1"].fillna(0).values
    pct_chg_rev = (y_rev - rev_lag1) / (np.abs(rev_lag1) + 1)
    pct_chg_sp = (y_sp - sp_lag1) / (np.abs(sp_lag1) + 1)

    # Find a retailer_id per store via applications -> retailer_profiles.
    # NOTE: fetch_* calls are memoised by supabase_io, so this reuses the
    # same data _build_frame() already loaded — no extra DB round-trip.
    apps = sio.fetch_applications()
    units = {u["id"]: u for u in sio.fetch_station_units()}
    stations_idx = {s["id"]: s.get("display_id") for s in sio.fetch_stations()}
    retailer_by_store: dict[str, str] = {}
    for app in apps:
        unit = units.get(app.get("station_unit_id"))
        if not unit:
            continue
        display_id = stations_idx.get(unit.get("station_id"))
        if not display_id:
            continue
        retailer_id = app.get("retailer_profile_id")
        if retailer_id and display_id not in retailer_by_store:
            retailer_by_store[display_id] = retailer_id

    rows_out: list[dict] = []
    skipped_no_retailer = 0
    for idx, (_, row) in enumerate(latest.iterrows()):
        store_id = row["store_id"]
        retailer_id = retailer_by_store.get(store_id)
        if not retailer_id:
            # No application linking this store to a retailer profile —
            # we can predict revenue but the row has no useful FK target.
            # Skip rather than write a placeholder.
            skipped_no_retailer += 1
            continue
        rows_out.append(
            {
                "store_id": store_id,
                "retailer_id": retailer_id,
                "station_id": store_id,  # 1:1 in our schema
                "forecast_period": forecast_period,
                "predicted_revenue_thb": round(float(y_rev[idx]), 2),
                "forecast_lower_thb": round(float(y_rev_lo[idx]), 2),
                "forecast_upper_thb": round(float(y_rev_hi[idx]), 2),
                "pct_change_vs_last": round(float(pct_chg_rev[idx]), 4),
                "predicted_quarterly_thb": round(float(y_rev[idx] * quarterly_factor), 2),
                "quarterly_lower_thb": round(float(y_rev_lo[idx] * quarterly_factor), 2),
                "quarterly_upper_thb": round(float(y_rev_hi[idx] * quarterly_factor), 2),
                "predicted_avg_spend_thb": round(float(y_sp[idx]), 2),
                "pct_change_spend_vs_last": round(float(pct_chg_sp[idx]), 4),
                "confidence_pct": CONFIDENCE,
                "is_cold_start": bool(row["is_cold_start"]),
                "model_version": model_version,
                "trained_on_period": TRAINED_ON,
            }
        )

    try:
        written = sio.upsert_forecasts(rows_out)
    except Exception as exc:  # noqa: BLE001
        log.exception("upsert_forecasts failed: %s", exc)
        notes.append(f"Upsert error: {exc}")
        written = 0

    if skipped_no_retailer:
        notes.append(
            f"{skipped_no_retailer} store(s) skipped — no application links them to a retailer profile."
        )

    payload["rows_written"] = written
    payload["rows_skipped"] = max(0, len(rows_out) - written) + skipped_no_retailer
    payload["forecast_period"] = forecast_period
    payload["generated_at"] = sio.now_iso()
    return payload
