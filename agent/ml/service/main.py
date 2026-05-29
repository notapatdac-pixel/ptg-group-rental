"""
PTG ML Inference Service — FastAPI entry point.

Endpoints
---------
POST /ml/forecast    Run sales forecast model       -> ml_sales_forecasts
POST /ml/churn       Run churn segment model        -> ml_churn_segments
POST /ml/matching    Run matching score model       -> ml_matching_scores
POST /ml/anomaly     Run anomaly detection model    -> ml_anomaly_alerts
POST /ml/run-all     Run all four sequentially
GET  /ml/health      Models loaded + Supabase ping
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import Any

# On Windows + Python 3.13 the bundled CA store doesn't include the
# corporate roots that some Supabase regions use. truststore patches the
# stdlib ssl module to use the system trust store instead, fixing
# CERTIFICATE_VERIFY_FAILED on httpx (which supabase-py uses internally).
# Must be imported BEFORE any module that touches SSL (httpx, supabase).
try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass  # Optional — works without on Linux/macOS with bundled certs

from dotenv import load_dotenv
from fastapi import FastAPI

# Load .env *before* the inference modules read it.
load_dotenv()

from inference import (
    anomaly_detection,
    churn_segment,
    load_models,
    matching_score,
    sales_forecast,
    supabase_io,
)

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s :: %(message)s",
)
log = logging.getLogger("ptg_ml.main")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Pre-load all joblib models once on startup."""
    loaded = load_models.load_all()
    log.info(
        "Startup complete — %d/%d models loaded.",
        load_models.loaded_count(),
        len(loaded),
    )
    if load_models.missing():
        log.warning("Missing models: %s", load_models.missing())
    yield


app = FastAPI(title="PTG ML Inference", version="1.0.0", lifespan=lifespan)


# ──────────────────────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────────────────────


@app.get("/ml/health")
def health() -> dict[str, Any]:
    return {
        "service": "ptg-ml-inference",
        "models_loaded": load_models.loaded_count(),
        "models_expected": len(load_models.MODEL_FILES),
        "models_missing": load_models.missing(),
        "model_versions": load_models.MODEL_VERSIONS,
        "supabase_ok": supabase_io.health_check(),
        "generated_at": supabase_io.now_iso(),
    }


def _safe_run(name: str, fn, *, reset_cache: bool = True) -> dict[str, Any]:
    """Wrap a model run so a failure never takes the service down.

    Resets the per-request supabase table cache so a long-running FastAPI
    process never serves stale data. (The cache is module-level so it
    would otherwise persist across HTTP calls.)

    For /ml/run-all the caller resets the cache once up front and passes
    reset_cache=False here so the four models share one set of fetches.
    """
    try:
        if reset_cache:
            supabase_io.reset_cache()
        return fn()
    except Exception as exc:  # noqa: BLE001
        log.exception("%s failed: %s", name, exc)
        return {
            "model_version": load_models.MODEL_VERSIONS.get(name, "unknown"),
            "rows_written": 0,
            "rows_skipped": 0,
            "generated_at": supabase_io.now_iso(),
            "notes": [f"{name} crashed: {exc}"],
        }


@app.post("/ml/forecast")
def forecast() -> dict[str, Any]:
    return _safe_run("sales_forecast", sales_forecast.run)


@app.post("/ml/churn")
def churn() -> dict[str, Any]:
    return _safe_run("churn_segment", churn_segment.run)


@app.post("/ml/matching")
def matching() -> dict[str, Any]:
    return _safe_run("matching_score", matching_score.run)


@app.post("/ml/anomaly")
def anomaly() -> dict[str, Any]:
    return _safe_run("anomaly_detection", anomaly_detection.run)


@app.post("/ml/run-all")
def run_all() -> dict[str, Any]:
    # Share one set of table fetches across all four models.
    supabase_io.reset_cache()
    out = {
        "forecast": _safe_run("sales_forecast", sales_forecast.run, reset_cache=False),
        "churn":    _safe_run("churn_segment", churn_segment.run,   reset_cache=False),
        "matching": _safe_run("matching_score", matching_score.run, reset_cache=False),
        "anomaly":  _safe_run("anomaly_detection", anomaly_detection.run, reset_cache=False),
    }
    total_written = sum(r.get("rows_written", 0) for r in out.values())
    out["summary"] = {
        "total_rows_written": total_written,
        "generated_at": supabase_io.now_iso(),
    }
    return out


# Allows `python main.py` for quick local sanity checks.
if __name__ == "__main__":
    import uvicorn  # noqa: WPS433

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
