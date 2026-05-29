"""
PTG ML Cron Runner — designed to be invoked once per day by a scheduler
(Windows Task Scheduler, cron, or any platform job).

Runs all four ML inference modules sequentially and writes results back
to Supabase. Designed to be self-contained: does NOT require the uvicorn
FastAPI server to be running. Imports the inference functions directly.

Usage
-----
    cd agent/ml/service
    .venv\\Scripts\\python.exe run_cron.py

Schedule on Windows
-------------------
1. Open Task Scheduler → Create Basic Task
2. Name: "PTG ML Daily Inference"
3. Trigger: Daily at 00:05 (5 min past midnight — leaves room for the
   day's data to land)
4. Action: Start a program
   - Program/script: C:\\Users\\notap\\OneDrive\\Desktop\\ptg-group-rental\\agent\\ml\\service\\.venv\\Scripts\\python.exe
   - Arguments: run_cron.py
   - Start in: C:\\Users\\notap\\OneDrive\\Desktop\\ptg-group-rental\\agent\\ml\\service
5. Check "Run whether user is logged on or not" if you want it to run
   even when no one is signed in.

Logs go to agent/ml/service/logs/ml_cron_YYYY-MM-DD.log.
Exit code 0 = all four models wrote at least one row.
Exit code 1 = at least one model failed (check the log).
"""
from __future__ import annotations

import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Truststore patch BEFORE any SSL-using import. Windows needs this for
# httpx to trust the system root CAs (otherwise CERTIFICATE_VERIFY_FAILED).
try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

from dotenv import load_dotenv

# Load .env before importing inference (which lazily reads env on first use)
load_dotenv()

from inference import (
    anomaly_detection,
    churn_segment,
    load_models,
    matching_score,
    sales_forecast,
    supabase_io as sio,
)


# ── ml_run_logs writer ────────────────────────────────────────────────
def open_log(trigger_source: str = "windows_task") -> str | None:
    """INSERT a 'running' row into ml_run_logs, return its UUID."""
    try:
        res = sio.client().table("ml_run_logs").insert({
            "trigger_source": trigger_source,
            "status": "running",
            "model": "all",
        }).execute()
        return (res.data or [{}])[0].get("id")
    except Exception as exc:  # noqa: BLE001
        log.warning("Could not open ml_run_logs row: %s", exc)
        return None


def close_log(log_id: str | None, summary: dict, success: bool) -> None:
    """UPDATE the log row with final status + per-model breakdown."""
    if not log_id:
        return
    try:
        sio.client().table("ml_run_logs").update({
            "status": "success" if success else (
                "partial" if summary.get("total_rows_written", 0) > 0 else "failed"
            ),
            "rows_written": summary.get("total_rows_written", 0),
            "rows_skipped": sum(r.get("rows_skipped", 0) for r in summary.get("per_model", [])),
            "duration_ms": int((summary.get("duration_s") or 0) * 1000),
            "error_message": summary.get("first_error"),
            "per_model": summary.get("per_model"),
            "finished_at": "now()",
        }).eq("id", log_id).execute()
    except Exception as exc:  # noqa: BLE001
        log.warning("Could not close ml_run_logs row %s: %s", log_id, exc)


# ── Logging — file + stderr ──────────────────────────────────────────
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / f"ml_cron_{datetime.now(timezone.utc).strftime('%Y-%m-%d')}.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s :: %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stderr),
    ],
)
log = logging.getLogger("ml_cron")


def run_one(name: str, fn) -> dict:
    log.info("Running %s...", name)
    try:
        result = fn()
        log.info("%s OK — rows_written=%s skipped=%s",
                 name, result.get("rows_written"), result.get("rows_skipped"))
        if result.get("notes"):
            for n in result["notes"]:
                log.warning("  %s note: %s", name, n)
        return {**result, "name": name, "status": "ok"}
    except Exception as exc:  # noqa: BLE001
        log.error("%s FAILED: %s", name, exc, exc_info=True)
        return {"name": name, "status": "error", "error": str(exc),
                "rows_written": 0, "rows_skipped": 0}


def main() -> int:
    # Identify trigger source — Windows Task Scheduler sets these env vars
    trigger_source = os.environ.get("ML_TRIGGER_SOURCE", "windows_task")
    log_id = open_log(trigger_source)

    log.info("===== PTG ML cron run started (log_id=%s) =====", log_id)
    started_at = datetime.now(timezone.utc)

    # Pre-load all models so missing files surface early
    load_models.load_all()
    log.info("Models loaded: %d", load_models.loaded_count())

    # Fresh table cache for this run. Each fetch_* call is memoised — without
    # this, the 4 inference modules trigger ~12 redundant full table scans.
    sio.reset_cache()

    results = [
        run_one("forecast", sales_forecast.run),
        run_one("churn",    churn_segment.run),
        run_one("matching", matching_score.run),
        run_one("anomaly",  anomaly_detection.run),
    ]

    total_written = sum(r.get("rows_written", 0) for r in results)
    total_errors  = sum(1 for r in results if r["status"] == "error")
    duration_s    = (datetime.now(timezone.utc) - started_at).total_seconds()
    first_error   = next((r.get("error") for r in results if r["status"] == "error"), None)

    summary = {
        "started_at": started_at.isoformat(),
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "duration_s": round(duration_s, 1),
        "total_rows_written": total_written,
        "models_with_errors": total_errors,
        "first_error": first_error,
        "per_model": results,
    }

    close_log(log_id, summary, success=(total_errors == 0))

    log.info("===== Done — %d rows written in %.1fs, %d errors =====",
             total_written, duration_s, total_errors)

    # Pretty summary to stdout for cron-mail/diagnostics
    print(json.dumps(summary, indent=2, default=str))

    return 0 if total_errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
