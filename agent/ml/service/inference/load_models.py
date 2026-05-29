"""
load_models.py — joblib model loader.

Loaded once at FastAPI startup and held in a module-level dict so we
don't pay the deserialisation cost on every request.

If a file is missing or unreadable we still return a dict — the missing
key is just None, and the inference module can raise a clear error
later. That keeps `/ml/health` useful for diagnosing setup problems.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import joblib

log = logging.getLogger("ptg_ml.load_models")

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

# Maps logical key -> filename in models/. The inference modules read by
# logical key so we can rename files without changing call sites.
MODEL_FILES: dict[str, str] = {
    # Sales forecast
    "sales_revenue_xgb": "sales_revenue_xgb.joblib",
    "sales_spend_xgb": "sales_spend_xgb.joblib",
    "sales_spend_scaler": "sales_spend_scaler.joblib",
    "le_store_type": "le_store_type.joblib",
    "le_zone": "le_zone.joblib",
    # Churn
    "churn_segment_rf": "churn_segment_rf.joblib",
    "churn_scaler": "churn_scaler.joblib",
    "churn_encoders": "churn_encoders.joblib",
    # Matching
    "matching_lr": "matching_lr.joblib",
    "matching_scaler": "matching_scaler.joblib",
    "matching_segment_medians": "matching_segment_medians.joblib",
    "matching_encoders": "matching_encoders.joblib",
    # Anomaly
    "anomaly_isoforest": "anomaly_isoforest.joblib",
    "anomaly_scaler": "anomaly_scaler.joblib",
}

# Static version map — these strings match what was burned into the
# training scripts and are written into the ml_* tables for drift
# monitoring.
MODEL_VERSIONS: dict[str, str] = {
    "sales_forecast": "xgb_sales_v2.0",
    "churn_segment": "rf_churn_v3.0",
    "matching_score": "lr_match_v2.0",
    "anomaly_detection": "iso_anomaly_v2.0",
}


_cache: dict[str, Any] | None = None


def load_all() -> dict[str, Any]:
    """Load every joblib in MODEL_FILES, log missing ones, return dict."""
    global _cache
    if _cache is not None:
        return _cache

    loaded: dict[str, Any] = {}
    for key, fname in MODEL_FILES.items():
        path = MODELS_DIR / fname
        if not path.exists():
            log.error("Model file missing: %s", path)
            loaded[key] = None
            continue
        try:
            loaded[key] = joblib.load(path)
            log.info("Loaded %s from %s", key, path.name)
        except Exception as exc:  # noqa: BLE001
            log.exception("Failed to load %s: %s", key, exc)
            loaded[key] = None

    _cache = loaded
    return loaded


def get(key: str) -> Any:
    """Return a single model, loading the cache if needed."""
    return load_all().get(key)


def loaded_count() -> int:
    """How many joblibs were loaded successfully (for /ml/health)."""
    return sum(1 for v in load_all().values() if v is not None)


def missing() -> list[str]:
    """List of logical keys we expected but couldn't load."""
    return [k for k, v in load_all().items() if v is None]
