-- ================================================================
-- PTG Group Rental — Retail Analytics Tables
-- Adds per-store financial, retention, performance, demographic,
-- hourly-traffic, and platform-benchmark data so the retailer
-- dashboard / performance / landlord-advisor pages can be DB-driven
-- ================================================================

-- ----------------------------------------------------------------
-- Per-store monthly P&L (revenue / rent / utilities / net)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_monthly_pnl (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_display_id  TEXT NOT NULL,
  year_month        TEXT NOT NULL,
  revenue_thb       INT  NOT NULL,
  rent_thb          INT  NOT NULL,
  utilities_thb     INT  NOT NULL,
  net_thb           INT  NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_display_id, year_month)
);

-- ----------------------------------------------------------------
-- Per-store monthly retention (new/returning/lapsed)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_monthly_retention (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_display_id    TEXT NOT NULL,
  year_month          TEXT NOT NULL,
  new_customers       INT  NOT NULL,
  returning_customers INT  NOT NULL,
  lapsed_customers    INT  NOT NULL,
  new_mom_pct         NUMERIC(5,2),
  returning_mom_pct   NUMERIC(5,2),
  lapsed_mom_pct      NUMERIC(5,2),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_display_id, year_month)
);

-- ----------------------------------------------------------------
-- Per-store monthly performance (orders, conversion, basket, etc)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_monthly_performance (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_display_id   TEXT NOT NULL,
  year_month         TEXT NOT NULL,
  orders             INT  NOT NULL,
  traffic            INT  NOT NULL,
  conversion_pct     NUMERIC(5,2) NOT NULL,
  avg_basket_thb     NUMERIC(10,2) NOT NULL,
  sales_per_sqm_thb  NUMERIC(10,2) NOT NULL,
  revisit_rate_pct   NUMERIC(5,2) NOT NULL,
  patron_score       INT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_display_id, year_month)
);

-- ----------------------------------------------------------------
-- Customer segments (age + spend)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_customer_segments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_display_id  TEXT NOT NULL,
  year_month        TEXT NOT NULL,
  segment_type      TEXT NOT NULL CHECK (segment_type IN ('age','spend')),
  segment_label     TEXT NOT NULL,
  segment_order     INT  NOT NULL DEFAULT 0,
  share_pct         NUMERIC(5,2) NOT NULL,
  avg_basket_thb    NUMERIC(10,2),
  growth_pct        NUMERIC(5,2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_display_id, year_month, segment_type, segment_label)
);

-- ----------------------------------------------------------------
-- Hourly traffic intensity per day-of-week (heatmap source)
-- day_of_week: 0=Mon … 6=Sun ; intensity: 0–4
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_hourly_traffic (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_display_id  TEXT NOT NULL,
  year_month        TEXT NOT NULL,
  day_of_week       INT  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  hour              INT  NOT NULL CHECK (hour BETWEEN 0 AND 23),
  intensity         INT  NOT NULL CHECK (intensity BETWEEN 0 AND 4),
  visitors          INT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_display_id, year_month, day_of_week, hour)
);

-- ----------------------------------------------------------------
-- Platform-wide benchmarks (top / median / bottom by metric)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_benchmarks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key        TEXT NOT NULL,
  category          TEXT NOT NULL DEFAULT 'all',
  year_month        TEXT NOT NULL,
  top_25_value      NUMERIC(10,2) NOT NULL,
  median_value      NUMERIC(10,2) NOT NULL,
  bottom_25_value   NUMERIC(10,2) NOT NULL,
  unit_label        TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (metric_key, category, year_month)
);

-- ----------------------------------------------------------------
-- Helpful indexes for filter-heavy queries
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pnl_store_ym         ON public.store_monthly_pnl(store_display_id, year_month);
CREATE INDEX IF NOT EXISTS idx_retention_store_ym   ON public.store_monthly_retention(store_display_id, year_month);
CREATE INDEX IF NOT EXISTS idx_perf_store_ym        ON public.store_monthly_performance(store_display_id, year_month);
CREATE INDEX IF NOT EXISTS idx_segments_store_ym    ON public.store_customer_segments(store_display_id, year_month, segment_type);
CREATE INDEX IF NOT EXISTS idx_hourly_store_ym      ON public.store_hourly_traffic(store_display_id, year_month);
CREATE INDEX IF NOT EXISTS idx_bench_metric_ym      ON public.platform_benchmarks(metric_key, category, year_month);

-- ----------------------------------------------------------------
-- RLS — service role bypasses; service-key API can read/write freely.
-- (Frontends never query these tables directly — only via /api/*)
-- ----------------------------------------------------------------
ALTER TABLE public.store_monthly_pnl         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_monthly_retention   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_monthly_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_customer_segments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_hourly_traffic      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_benchmarks       ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read (service role bypasses RLS automatically)
DROP POLICY IF EXISTS "read_all_pnl"        ON public.store_monthly_pnl;
DROP POLICY IF EXISTS "read_all_retention"  ON public.store_monthly_retention;
DROP POLICY IF EXISTS "read_all_perf"       ON public.store_monthly_performance;
DROP POLICY IF EXISTS "read_all_segments"   ON public.store_customer_segments;
DROP POLICY IF EXISTS "read_all_hourly"     ON public.store_hourly_traffic;
DROP POLICY IF EXISTS "read_all_benchmarks" ON public.platform_benchmarks;

CREATE POLICY "read_all_pnl"        ON public.store_monthly_pnl        FOR SELECT USING (true);
CREATE POLICY "read_all_retention"  ON public.store_monthly_retention  FOR SELECT USING (true);
CREATE POLICY "read_all_perf"       ON public.store_monthly_performance FOR SELECT USING (true);
CREATE POLICY "read_all_segments"   ON public.store_customer_segments  FOR SELECT USING (true);
CREATE POLICY "read_all_hourly"     ON public.store_hourly_traffic     FOR SELECT USING (true);
CREATE POLICY "read_all_benchmarks" ON public.platform_benchmarks      FOR SELECT USING (true);
