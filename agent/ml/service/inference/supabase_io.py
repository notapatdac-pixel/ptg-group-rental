"""
supabase_io.py — single source of truth for the schema mapping.

The pre-trained ML models were trained on a synthetic dataset whose
columns are different from this project's actual Supabase schema. We
map them once here so the per-model inference files don't have to
know anything about Supabase.

Mapping (model column -> Supabase source):
    revenue        -> store_monthly_pnl.revenue_thb
    rent           -> store_monthly_pnl.rent_thb
    visitors       -> store_monthly_performance.traffic
    conv_rate      -> store_monthly_performance.conversion_pct
    avg_spend      -> store_monthly_performance.avg_basket_thb
    Store ID       -> store_monthly_pnl.store_display_id
    Zone           -> stations.province              (closest proxy)
    Store Type     -> retailer_profiles.category
    foot_traffic   -> stations.traffic_level         (low/medium/high)
    est_rev        -> station_monthly_metrics.est_revenue_k_thb * 1000
    base_rent      -> latest station_units.price_thb per station
    total_area     -> sum(station_units.area_sqm) per station
    Retailer ID    -> retailer_profiles.id
    branches       -> retailer_profiles.num_stores (parsed int)
    experience     -> retailer_profiles.experience  (parsed int)

A store ("Store ID") in the model's frame corresponds to one
station_display_id in this project for now. The simulation only seeds
one tenant per station so this 1:1 is safe; revisit when multi-tenant
seeding lands.
"""

from __future__ import annotations

import logging
import os
import re
from datetime import datetime, timezone
from typing import Any, Iterable

from supabase import Client, create_client

log = logging.getLogger("ptg_ml.supabase_io")


# ──────────────────────────────────────────────────────────────────────
# Client factory
# ──────────────────────────────────────────────────────────────────────


_client: Client | None = None


def client() -> Client:
    """Return a cached service-role Supabase client."""
    global _client
    if _client is not None:
        return _client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise RuntimeError(
            "Missing SUPABASE_URL / SUPABASE_SERVICE_KEY — copy .env.example -> .env"
        )

    _client = create_client(url, key)
    return _client


# ──────────────────────────────────────────────────────────────────────
# Per-run table cache.
#
# Each inference run does ~12 redundant full-table scans because
# station_lookup() and _build_frame() each re-call fetch_stations(),
# fetch_station_units(), fetch_station_monthly_metrics(),
# fetch_retailer_profiles(), fetch_applications(). We memoise them in
# this module-level dict so a single run hits Supabase once per table.
#
# IMPORTANT: callers MUST invoke reset_cache() at the start of each run
# (cron + FastAPI _safe_run) to avoid serving stale data across runs.
# ──────────────────────────────────────────────────────────────────────


_table_cache: dict[str, Any] = {}


def reset_cache() -> None:
    """Clear the per-run table cache. Call before each inference run."""
    _table_cache.clear()


def _cached(key: str, fetcher):
    """Memoise a zero-arg fetcher by key for the current run."""
    if key in _table_cache:
        return _table_cache[key]
    val = fetcher()
    _table_cache[key] = val
    return val


def health_check() -> bool:
    """Lightweight ping for /ml/health."""
    try:
        client().table("stations").select("id").limit(1).execute()
        return True
    except Exception as exc:  # noqa: BLE001
        log.warning("Supabase health check failed: %s", exc)
        return False


# ──────────────────────────────────────────────────────────────────────
# Parsing helpers — Supabase has several TEXT cols that store numbers
# ──────────────────────────────────────────────────────────────────────


def parse_int(value: Any, default: int = 0) -> int:
    """Pull the first integer out of a string (or accept a number)."""
    if value is None:
        return default
    if isinstance(value, (int, float)):
        try:
            return int(value)
        except (ValueError, OverflowError):
            return default
    match = re.search(r"-?\d+", str(value))
    return int(match.group(0)) if match else default


def parse_float(value: Any, default: float = 0.0) -> float:
    """First float in a string; tolerates % signs, +/-, commas."""
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)
    cleaned = str(value).replace(",", "").replace("%", "").replace("+", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        match = re.search(r"-?\d+(\.\d+)?", cleaned)
        return float(match.group(0)) if match else default


# Foot traffic / tier ordinals — match training scripts exactly.
FOOT_ORD = {"high": 3, "medium": 2, "low": 1, "High": 3, "Medium": 2, "Low": 1}
TIER_ORD = {"high": 3, "normal": 2, "low": 1, "High": 3, "Normal": 2, "Low": 1}


# ──────────────────────────────────────────────────────────────────────
# Store / retailer ID mapping.
#
# The Next.js UI and seed data use logical IDs (STR-001, STR-077,
# RET-001) that don't exist as columns in our DB — they were the
# synthetic-data convention from the ML training package. Until the
# UI is refactored to consume station.display_id + retailer_profiles.id
# directly, the ML service writes the legacy logical IDs the UI
# expects, mapping from real DB identifiers at write time.
# ──────────────────────────────────────────────────────────────────────

STORE_DISPLAY_TO_LEGACY: dict[str, str] = {
    "STN-001": "STR-001",   # Lumina @ Lat Phrao
    "STN-018": "STR-077",   # Lumina @ Nonthaburi
}

# Demo retailer profile UUID -> logical RET- id used by the UI.
RETAILER_UUID_TO_LEGACY: dict[str, str] = {
    "55555555-0000-0000-0000-000000000001": "RET-001",  # Lumina Artisan Roastery
}


def to_legacy_store_id(display_or_uuid: str) -> str:
    """Convert STN-* -> STR-* for ml_* tables consumed by the Next.js UI."""
    return STORE_DISPLAY_TO_LEGACY.get(display_or_uuid, display_or_uuid)


def to_legacy_retailer_id(profile_uuid: str) -> str:
    """Convert retailer_profiles.id UUID -> RET- legacy id."""
    return RETAILER_UUID_TO_LEGACY.get(profile_uuid, profile_uuid)


def safe_encode(encoder, value: Any) -> int:
    """LabelEncoder.transform but tolerant of unseen labels.

    The training data has a small label space; once we hit real
    user-entered categories some values won't be in encoder.classes_.
    Returning 0 (instead of raising) means inference keeps working —
    the row gets the "majority" class and we log the substitution.
    """
    if encoder is None:
        return 0
    try:
        s = str(value) if value is not None else ""
        classes = list(getattr(encoder, "classes_", []))
        if s in classes:
            return int(encoder.transform([s])[0])
        log.warning("Unknown label %r for %s — defaulting to 0", s, type(encoder).__name__)
        return 0
    except Exception as exc:  # noqa: BLE001
        log.warning("safe_encode failed for %r: %s", value, exc)
        return 0


# ──────────────────────────────────────────────────────────────────────
# Misc helpers
# ──────────────────────────────────────────────────────────────────────


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def next_month(ym: str) -> str:
    """'2024-06' -> '2024-07' (handles year roll-over)."""
    try:
        y, m = ym.split("-")
        y, m = int(y), int(m)
        m += 1
        if m == 13:
            m = 1
            y += 1
        return f"{y:04d}-{m:02d}"
    except Exception:  # noqa: BLE001
        return ym


def latest_ym(rows: Iterable[dict]) -> str | None:
    """Largest YYYY-MM value present in a list of rows (key 'year_month')."""
    found = sorted({r.get("year_month") for r in rows if r.get("year_month")})
    return found[-1] if found else None


# ──────────────────────────────────────────────────────────────────────
# Readers — return raw rows; inference modules build feature frames.
# ──────────────────────────────────────────────────────────────────────


def fetch_stations() -> list[dict]:
    return _cached(
        "stations",
        lambda: client().table("stations").select("*").execute().data or [],
    )


def fetch_station_units() -> list[dict]:
    return _cached(
        "station_units",
        lambda: client().table("station_units").select("*").execute().data or [],
    )


def fetch_station_monthly_metrics() -> list[dict]:
    return _cached(
        "station_monthly_metrics",
        lambda: client().table("station_monthly_metrics").select("*").execute().data or [],
    )


def fetch_store_pnl() -> list[dict]:
    return _cached(
        "store_monthly_pnl",
        lambda: client().table("store_monthly_pnl").select("*").execute().data or [],
    )


def fetch_store_performance() -> list[dict]:
    return _cached(
        "store_monthly_performance",
        lambda: client().table("store_monthly_performance").select("*").execute().data or [],
    )


def fetch_store_segments() -> list[dict]:
    return _cached(
        "store_customer_segments",
        lambda: client().table("store_customer_segments").select("*").execute().data or [],
    )


def fetch_retailer_profiles(only_with_mapping: bool = True) -> list[dict]:
    """Return retailer profiles.

    `only_with_mapping=True` (default) skips stub profiles attached to
    landlord users that exist only to populate the demo applications
    list — they have no STR/RET mapping and would clutter ml_matching_scores
    with cartesian noise.
    """
    rows = _cached(
        "retailer_profiles",
        lambda: client().table("retailer_profiles").select("*").execute().data or [],
    )
    if only_with_mapping:
        rows = [r for r in rows if r.get("id") in RETAILER_UUID_TO_LEGACY]
    return rows


def fetch_applications() -> list[dict]:
    """For matching label / lease success — currently informational."""
    return _cached(
        "applications",
        lambda: client().table("applications").select("*").execute().data or [],
    )


# ──────────────────────────────────────────────────────────────────────
# Writers — every ml_* table has a UNIQUE constraint; use upsert.
# ──────────────────────────────────────────────────────────────────────


def _remap_store(rows: list[dict], field: str = "store_id") -> list[dict]:
    """Apply STN -> STR mapping before write, in-place safe."""
    return [{**r, field: to_legacy_store_id(r.get(field, ""))} for r in rows]


def _remap_retailer(rows: list[dict], field: str = "retailer_id") -> list[dict]:
    """Apply retailer UUID -> RET- mapping before write."""
    return [{**r, field: to_legacy_retailer_id(r.get(field, ""))} for r in rows]


def upsert_forecasts(rows: list[dict]) -> int:
    if not rows:
        return 0
    mapped = _remap_retailer(_remap_store(rows, "store_id"), "retailer_id")
    res = (
        client()
        .table("ml_sales_forecasts")
        .upsert(mapped, on_conflict="store_id,forecast_period")
        .execute()
    )
    return len(res.data or [])


def upsert_churn(rows: list[dict]) -> int:
    if not rows:
        return 0
    mapped = _remap_store(rows, "store_id")
    res = (
        client()
        .table("ml_churn_segments")
        .upsert(mapped, on_conflict="store_id,age_group,spend_range")
        .execute()
    )
    return len(res.data or [])


def upsert_matching(rows: list[dict]) -> int:
    if not rows:
        return 0
    mapped = _remap_retailer(rows, "retailer_id")
    res = (
        client()
        .table("ml_matching_scores")
        .upsert(mapped, on_conflict="retailer_id,station_id")
        .execute()
    )
    return len(res.data or [])


def upsert_anomalies(rows: list[dict]) -> int:
    if not rows:
        return 0
    mapped = _remap_store(rows, "store_id")
    res = (
        client()
        .table("ml_anomaly_alerts")
        .upsert(mapped, on_conflict="store_id,period")
        .execute()
    )
    return len(res.data or [])


# ──────────────────────────────────────────────────────────────────────
# Convenience views — assemble the joined frames each model needs.
# ──────────────────────────────────────────────────────────────────────


def assemble_store_monthly() -> list[dict]:
    """One row per (store_display_id, year_month).

    Joins pnl + performance into one flat record with the column names
    the model expects (revenue / avg_spend / visitors / conv_rate /
    rent / month_num / year_num).

    Memoised for the lifetime of a run — sales_forecast + anomaly both
    consume this and would otherwise rebuild the same frame twice.
    """
    if "_assembled_store_monthly" in _table_cache:
        return _table_cache["_assembled_store_monthly"]

    pnl = {(r["store_display_id"], r["year_month"]): r for r in fetch_store_pnl()}
    perf = {(r["store_display_id"], r["year_month"]): r for r in fetch_store_performance()}

    keys = set(pnl) | set(perf)
    out: list[dict] = []
    for store_id, ym in keys:
        p = pnl.get((store_id, ym), {})
        q = perf.get((store_id, ym), {})
        try:
            y, m = ym.split("-")
            year_num, month_num = int(y), int(m)
        except Exception:  # noqa: BLE001
            year_num = month_num = 0
        out.append(
            {
                "store_id": store_id,
                "year_month": ym,
                "year_num": year_num,
                "month_num": month_num,
                "revenue": parse_float(p.get("revenue_thb")),
                "rent": parse_float(p.get("rent_thb")),
                "visitors": parse_float(q.get("traffic")),
                "avg_spend": parse_float(q.get("avg_basket_thb")),
                "conv_rate": parse_float(q.get("conversion_pct")),
            }
        )
    out.sort(key=lambda r: (r["store_id"], r["year_num"], r["month_num"]))
    _table_cache["_assembled_store_monthly"] = out
    return out


def station_lookup() -> dict[str, dict]:
    """{display_id: station_row}. Also aggregates units area + price.

    Memoised — called by sales_forecast, churn_segment, and matching_score
    in a single cron run; without this it would do 9 redundant full table
    scans (3 tables × 3 callers).
    """
    if "_station_lookup" in _table_cache:
        return _table_cache["_station_lookup"]

    stations = {s["display_id"]: dict(s) for s in fetch_stations()}
    # station_units gives total_area and base_rent (use latest non-zero price)
    units_by_station: dict[str, list[dict]] = {}
    for u in fetch_station_units():
        sid = u.get("station_id")
        if not sid:
            continue
        units_by_station.setdefault(sid, []).append(u)

    # Build display_id -> id reverse map so unit rows can resolve
    id_to_display = {s["id"]: s["display_id"] for s in stations.values() if s.get("id")}
    aggregated_by_display: dict[str, dict] = {}
    for station_uuid, units in units_by_station.items():
        display_id = id_to_display.get(station_uuid)
        if not display_id:
            continue
        total_area = sum(parse_int(u.get("area_sqm")) for u in units)
        prices = [parse_int(u.get("price_thb")) for u in units if parse_int(u.get("price_thb")) > 0]
        base_rent = max(prices) if prices else 0
        aggregated_by_display[display_id] = {
            "total_area": total_area,
            "base_rent": base_rent,
            "unit_count": len(units),
        }
    for display_id, st in stations.items():
        st.update(aggregated_by_display.get(display_id, {"total_area": 0, "base_rent": 0, "unit_count": 0}))

    # Latest est_revenue_k_thb -> est_rev
    metrics_by_station: dict[str, list[dict]] = {}
    for m in fetch_station_monthly_metrics():
        sid = m.get("station_id")
        if not sid:
            continue
        metrics_by_station.setdefault(sid, []).append(m)

    for display_id, st in stations.items():
        uuid_ = st.get("id")
        rows = metrics_by_station.get(uuid_, [])
        rows.sort(key=lambda r: r.get("year_month", ""))
        if rows:
            latest = rows[-1]
            st["est_rev"] = parse_int(latest.get("est_revenue_k_thb")) * 1000
            st["latest_ai_score_pct"] = parse_int(latest.get("ai_score_pct"))
        else:
            st["est_rev"] = 0
            st["latest_ai_score_pct"] = 0

    _table_cache["_station_lookup"] = stations
    return stations
