-- ================================================================
-- PTG Group Rental — ML Model Output Tables
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ================================================================

-- ----------------------------------------------------------------
-- ml_sales_forecasts
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ml_sales_forecasts (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id                TEXT        NOT NULL,
  retailer_id             TEXT        NOT NULL,
  station_id              TEXT        NOT NULL,
  forecast_period         TEXT        NOT NULL,
  predicted_revenue_thb   NUMERIC,
  forecast_lower_thb      NUMERIC,
  forecast_upper_thb      NUMERIC,
  pct_change_vs_last      NUMERIC,
  predicted_quarterly_thb NUMERIC,
  quarterly_lower_thb     NUMERIC,
  quarterly_upper_thb     NUMERIC,
  predicted_avg_spend_thb NUMERIC,
  pct_change_spend_vs_last NUMERIC,
  confidence_pct          NUMERIC,
  is_cold_start           BOOLEAN     NOT NULL DEFAULT FALSE,
  model_version           TEXT,
  trained_on_period       TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, forecast_period)
);

ALTER TABLE public.ml_sales_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ml_sales_forecasts_deny_direct" ON public.ml_sales_forecasts USING (false);

-- ----------------------------------------------------------------
-- ml_churn_segments
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ml_churn_segments (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id               TEXT        NOT NULL,
  age_group              TEXT        NOT NULL,
  spend_range            TEXT        NOT NULL,
  n_monthly_customers    NUMERIC,
  avg_risk_prob_pct      NUMERIC,
  revenue_at_risk_annual NUMERIC,
  risk_level             TEXT        NOT NULL,
  recommended_action     TEXT,
  model_version          TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, age_group, spend_range)
);

ALTER TABLE public.ml_churn_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ml_churn_segments_deny_direct" ON public.ml_churn_segments USING (false);

-- ----------------------------------------------------------------
-- ml_matching_scores
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ml_matching_scores (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id           TEXT        NOT NULL,
  station_id            TEXT        NOT NULL,
  match_score           NUMERIC,
  match_pct             NUMERIC,
  match_label           TEXT,
  estimated_earn_low_thb  NUMERIC,
  estimated_earn_high_thb NUMERIC,
  is_cold_start         BOOLEAN     NOT NULL DEFAULT FALSE,
  model_version         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (retailer_id, station_id)
);

ALTER TABLE public.ml_matching_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ml_matching_scores_deny_direct" ON public.ml_matching_scores USING (false);

-- ----------------------------------------------------------------
-- ml_anomaly_alerts
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ml_anomaly_alerts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id           TEXT        NOT NULL,
  period             TEXT        NOT NULL,
  is_anomaly         BOOLEAN     NOT NULL DEFAULT FALSE,
  anomaly_score      NUMERIC,
  anomaly_dimension  TEXT,
  pct_deviation      NUMERIC,
  direction          TEXT,
  severity           TEXT,
  suggested_action   TEXT,
  model_version      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, period)
);

ALTER TABLE public.ml_anomaly_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ml_anomaly_alerts_deny_direct" ON public.ml_anomaly_alerts USING (false);
