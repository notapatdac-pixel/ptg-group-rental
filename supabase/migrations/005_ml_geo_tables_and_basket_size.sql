-- ================================================================
-- Migration 005: ML geo tables + basket_size column
--
-- Captures schema that was previously ad-hoc (created outside of
-- migration files). Re-runnable: every CREATE/ADD uses IF NOT EXISTS.
-- ================================================================

-- ── basket_size_thb on station_monthly_metrics ────────────────────
-- (Earlier seed used ad-hoc ALTER; this migration commits it.)
ALTER TABLE public.station_monthly_metrics
  ADD COLUMN IF NOT EXISTS basket_size_thb NUMERIC;

-- ── ml_customer_origins ───────────────────────────────────────────
-- Read by /api/retailer/ml (for catchment overview), written by
-- ml_service when v3 adds an origin model.
CREATE TABLE IF NOT EXISTS public.ml_customer_origins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id       TEXT NOT NULL,
  distance_band  TEXT NOT NULL,   -- '0-1km' | '1-2km' | … | '>20km'
  customer_pct   NUMERIC NOT NULL,
  model_version  TEXT NOT NULL DEFAULT 'v1.0',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, distance_band)
);

-- ── ml_store_catchment ────────────────────────────────────────────
-- One row per store. PK is store_id (no surrogate id column).
CREATE TABLE IF NOT EXISTS public.ml_store_catchment (
  store_id            TEXT PRIMARY KEY,
  station_display_id  TEXT NOT NULL,
  reach_5km_k         INT  NOT NULL DEFAULT 0,
  model_version       TEXT NOT NULL DEFAULT 'v1.0',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_origins_store     ON public.ml_customer_origins(store_id);
CREATE INDEX IF NOT EXISTS idx_catchment_station ON public.ml_store_catchment(station_display_id);

-- ── RLS — deny all; service role bypasses RLS automatically ───────
ALTER TABLE public.ml_customer_origins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_store_catchment  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ml_customer_origins_deny" ON public.ml_customer_origins;
DROP POLICY IF EXISTS "ml_store_catchment_deny"  ON public.ml_store_catchment;

CREATE POLICY "ml_customer_origins_deny" ON public.ml_customer_origins
  USING (false) WITH CHECK (false);
CREATE POLICY "ml_store_catchment_deny"  ON public.ml_store_catchment
  USING (false) WITH CHECK (false);
