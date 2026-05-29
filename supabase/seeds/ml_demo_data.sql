-- ================================================================
-- PTG Group Rental — ML Demo Data (RET-001 · Lumina Artisan Roastery)
-- Run this in Supabase SQL Editor AFTER running 003_ml_tables.sql
-- Safe to re-run — uses ON CONFLICT DO UPDATE
-- ================================================================

-- ── Sales Forecasts ───────────────────────────────────────────────────────────

INSERT INTO public.ml_sales_forecasts
  (store_id, retailer_id, station_id, forecast_period,
   predicted_revenue_thb, forecast_lower_thb, forecast_upper_thb, pct_change_vs_last,
   predicted_quarterly_thb, quarterly_lower_thb, quarterly_upper_thb,
   predicted_avg_spend_thb, pct_change_spend_vs_last,
   confidence_pct, is_cold_start, model_version, trained_on_period)
VALUES
  -- STR-001 Lat Phrao 71 (Lumina) — slight revenue dip, spend up
  ('STR-001','RET-001','STN-001','2024-07',
   433347, 406424, 460270, -0.0838,
   1235040, 1158311, 1311770,
   9564, 0.0919,
   0.99, false, 'xgb_sales_v2.0', '2024-01 to 2024-04'),

  -- STR-077 Nonthaburi — stable with strong spend growth
  ('STR-077','RET-001','STN-018','2024-07',
   184820, 157897, 211742, -0.0076,
   526738, 450008, 603467,
   8392, 0.2168,
   0.99, false, 'xgb_sales_v2.0', '2024-01 to 2024-04')

ON CONFLICT (store_id, forecast_period) DO UPDATE SET
  predicted_revenue_thb   = EXCLUDED.predicted_revenue_thb,
  forecast_lower_thb      = EXCLUDED.forecast_lower_thb,
  forecast_upper_thb      = EXCLUDED.forecast_upper_thb,
  pct_change_vs_last      = EXCLUDED.pct_change_vs_last,
  predicted_quarterly_thb = EXCLUDED.predicted_quarterly_thb,
  quarterly_lower_thb     = EXCLUDED.quarterly_lower_thb,
  quarterly_upper_thb     = EXCLUDED.quarterly_upper_thb,
  predicted_avg_spend_thb = EXCLUDED.predicted_avg_spend_thb,
  pct_change_spend_vs_last= EXCLUDED.pct_change_spend_vs_last,
  confidence_pct          = EXCLUDED.confidence_pct;

-- ── Churn Segments (STR-001 only — key risk segments) ────────────────────────

INSERT INTO public.ml_churn_segments
  (store_id, age_group, spend_range, n_monthly_customers, avg_risk_prob_pct,
   revenue_at_risk_annual, risk_level, recommended_action, model_version)
VALUES
  -- The one Medium-risk segment
  ('STR-001','46+','<100',      5.67, 49.9, 2543,  'Medium',   'Monitor revenue trend for next 2 months.',            'rf_churn_v3.0'),
  -- Representative Low segments
  ('STR-001','26-35','>400',   95.33, 19.2, 92453, 'Low',      'Healthy momentum — no action required.',              'rf_churn_v3.0'),
  ('STR-001','26-35','200-400',125.33,28.1,118274, 'Low',      'Healthy momentum — no action required.',              'rf_churn_v3.0'),
  ('STR-001','18-25','200-400', 61.0, 17.4, 35623, 'Low',      'Healthy momentum — no action required.',              'rf_churn_v3.0'),
  ('STR-001','36-45','200-400', 61.0, 22.3, 45796, 'Low',      'Healthy momentum — no action required.',              'rf_churn_v3.0'),
  ('STR-001','46+','200-400',   30.33,17.2, 17527, 'Low',      'Healthy momentum — no action required.',              'rf_churn_v3.0'),
  ('STR-001','18-25','>400',    46.67,13.7, 32249, 'Low',      'Healthy momentum — no action required.',              'rf_churn_v3.0'),
  ('STR-001','36-45','>400',    46.67,16.4, 38456, 'Low',      'Healthy momentum — no action required.',              'rf_churn_v3.0')

ON CONFLICT (store_id, age_group, spend_range) DO UPDATE SET
  n_monthly_customers    = EXCLUDED.n_monthly_customers,
  avg_risk_prob_pct      = EXCLUDED.avg_risk_prob_pct,
  revenue_at_risk_annual = EXCLUDED.revenue_at_risk_annual,
  risk_level             = EXCLUDED.risk_level,
  recommended_action     = EXCLUDED.recommended_action;

-- ── Matching Scores (top 5 expansion candidates for RET-001) ─────────────────

INSERT INTO public.ml_matching_scores
  (retailer_id, station_id, match_score, match_pct, match_label,
   estimated_earn_low_thb, estimated_earn_high_thb, is_cold_start, model_version)
VALUES
  ('RET-001','STN-026', 0.9977, 99.8, 'EXCELLENT', 57767, 107831, false, 'lr_match_v2.0'),
  ('RET-001','STN-021', 0.9973, 99.7, 'EXCELLENT', 46672,  87121, false, 'lr_match_v2.0'),
  ('RET-001','STN-002', 0.9972, 99.7, 'EXCELLENT', 47565,  88788, false, 'lr_match_v2.0'),
  ('RET-001','STN-027', 0.9961, 99.6, 'EXCELLENT', 39445,  73630, false, 'lr_match_v2.0'),
  ('RET-001','STN-006', 0.9968, 99.7, 'EXCELLENT', 42911,  80100, false, 'lr_match_v2.0'),
  -- Current stations (also stored, filtered out in API)
  ('RET-001','STN-001', 0.9981, 99.8, 'EXCELLENT', 74561, 139181, false, 'lr_match_v2.0'),
  ('RET-001','STN-018', 0.9971, 99.7, 'EXCELLENT', 29615,  55281, false, 'lr_match_v2.0')

ON CONFLICT (retailer_id, station_id) DO UPDATE SET
  match_score             = EXCLUDED.match_score,
  match_pct               = EXCLUDED.match_pct,
  match_label             = EXCLUDED.match_label,
  estimated_earn_low_thb  = EXCLUDED.estimated_earn_low_thb,
  estimated_earn_high_thb = EXCLUDED.estimated_earn_high_thb;

-- ── Anomaly Alerts — all 3 severities × both stores ──────────────────────────
--
-- severity levels:
--   good_news  = above normal on a positive metric (conv_rate / revenue / visitors)
--   watch      = below normal, anomaly_score >= -0.15 (worth watching)
--   critical   = below normal, anomaly_score <  -0.15 (act now)
--
-- STR-001 Lat Phrao 71 (Lumina):
--   2024-06  good_news  conv_rate    +10%   ← most recent, good news
--   2024-05  good_news  conv_rate    +10%   ← same pattern previous month
--   2024-04  watch      avg_spend     -7%   ← mid-week spend dip
--   2024-03  critical   revenue      -15%   ← revenue shortfall
--
-- STR-077 Nonthaburi:
--   2024-06  good_news  visitors     +12%   ← foot traffic spike
--   2024-05  watch      revenue       -8%   ← slight revenue softness
--   2024-04  critical   conv_rate    -11%   ← conversion drop

INSERT INTO public.ml_anomaly_alerts
  (store_id, period, is_anomaly, anomaly_score, anomaly_dimension,
   pct_deviation, direction, severity, suggested_action, model_version)
VALUES

  -- STR-001 · 2024-06 · good_news
  ('STR-001','2024-06', true, -0.512, 'conv_rate',
   0.10, 'above', 'good_news',
   'Conversion rate improved 10.0% — analyse what worked and replicate.',
   'iso_anomaly_v2.0'),

  -- STR-001 · 2024-05 · good_news (same metric, consistent trend)
  ('STR-001','2024-05', true, -0.556, 'conv_rate',
   0.10, 'above', 'good_news',
   'Conversion rate improved 10.0% — analyse what worked and replicate.',
   'iso_anomaly_v2.0'),

  -- STR-001 · 2024-04 · watch (avg_spend dipped mid-week)
  ('STR-001','2024-04', true, -0.228, 'avg_spend',
   -0.07, 'below', 'watch',
   'Average spend dipped 7.0% — introduce a mid-week upsell or bundle offer.',
   'iso_anomaly_v2.0'),

  -- STR-001 · 2024-03 · critical (revenue shortfall)
  ('STR-001','2024-03', true, -0.447, 'revenue',
   -0.15, 'below', 'critical',
   'Revenue was 15.0% below normal — review pricing and promote high-margin items.',
   'iso_anomaly_v2.0'),

  -- STR-077 · 2024-06 · good_news (foot traffic surge)
  ('STR-077','2024-06', true, -0.489, 'visitors',
   0.12, 'above', 'good_news',
   'Foot traffic was 12.0% higher than usual — prepare extra stock and staff.',
   'iso_anomaly_v2.0'),

  -- STR-077 · 2024-05 · watch (revenue softness)
  ('STR-077','2024-05', true, -0.193, 'revenue',
   -0.08, 'below', 'watch',
   'Revenue was 8.0% below normal — check if a local promotion or event affected footfall.',
   'iso_anomaly_v2.0'),

  -- STR-077 · 2024-04 · critical (conversion rate drop)
  ('STR-077','2024-04', true, -0.421, 'conv_rate',
   -0.11, 'below', 'critical',
   'Conversion rate dropped 11.0% — review product placement or run a targeted promo.',
   'iso_anomaly_v2.0')

ON CONFLICT (store_id, period) DO UPDATE SET
  is_anomaly         = EXCLUDED.is_anomaly,
  anomaly_score      = EXCLUDED.anomaly_score,
  anomaly_dimension  = EXCLUDED.anomaly_dimension,
  pct_deviation      = EXCLUDED.pct_deviation,
  direction          = EXCLUDED.direction,
  severity           = EXCLUDED.severity,
  suggested_action   = EXCLUDED.suggested_action,
  model_version      = EXCLUDED.model_version;
