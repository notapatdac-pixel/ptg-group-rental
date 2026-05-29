-- 007_may_2026_currency.sql
-- "Current month" data currency pass (2026-05-29).
-- Appends May 2026 as the latest ACTUAL across every monthly table (store + station
-- side), re-anchors the ML sales forecast to June 2026 (next-month prediction), adds
-- May anomaly rows, and adds May/June event reasoning.
--
-- Math is kept coherent with the BA-reconciled series:
--   store revenue ≈ orders × basket × ~30, gentle month-over-month uptrend.
--   STN-018's station_monthly_metrics row mirrors its store row (same physical site).
--
-- Idempotent: every monthly table has a composite UNIQUE (key, year_month, ...), so we
-- DELETE the May/June rows first, then re-INSERT. The forecast is an UPDATE of the two
-- existing rows (exactly one period per store — never a second row, to avoid double-count).

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. STORE-LEVEL ACTUALS — May 2026 (keyed on station display id STN-001 / STN-018)
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM public.store_monthly_pnl         WHERE year_month = '2026-05';
DELETE FROM public.store_monthly_performance WHERE year_month = '2026-05';
DELETE FROM public.store_monthly_retention   WHERE year_month = '2026-05';

-- P&L: STN-001 318k→324k, STN-018 142k→145k. net = revenue − rent − utilities.
INSERT INTO public.store_monthly_pnl
  (store_display_id, year_month, revenue_thb, rent_thb, utilities_thb, net_thb)
VALUES
  ('STN-001', '2026-05', 324000, 49000, 8100, 266900),
  ('STN-018', '2026-05', 145000, 22000, 3000, 120000);

-- Performance: orders ≈ traffic × conversion; revenue ≈ orders × basket × ~30.
INSERT INTO public.store_monthly_performance
  (store_display_id, year_month, orders, traffic, conversion_pct, avg_basket_thb, sales_per_sqm_thb, revisit_rate_pct, patron_score)
VALUES
  ('STN-001', '2026-05', 35, 418, 8.35, 313.00, 7714.00, 63.00, 92),
  ('STN-018', '2026-05', 19, 344, 5.65, 250.00, 5800.00, 55.00, 89);

-- Retention: new/returning continue the climb, lapsed continues the gentle decline.
INSERT INTO public.store_monthly_retention
  (store_display_id, year_month, new_customers, returning_customers, lapsed_customers, new_mom_pct, returning_mom_pct, lapsed_mom_pct)
VALUES
  ('STN-001', '2026-05', 425, 965, 92, 2.40, 1.80, -3.20),
  ('STN-018', '2026-05', 322, 895, 89, 3.20, 1.70, -3.30);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CUSTOMER SEGMENTS — only April existed; add May ≈ April with tiny drift.
--    Shares per (store, segment_type) still sum to 100. age has basket/growth; spend NULL.
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM public.store_customer_segments WHERE year_month = '2026-05';

INSERT INTO public.store_customer_segments
  (store_display_id, year_month, segment_type, segment_label, segment_order, share_pct, avg_basket_thb, growth_pct)
VALUES
  -- STN-001 age (33+44+16+7 = 100)
  ('STN-001', '2026-05', 'age',   '18-25',    0, 33.00, 222.00, 12.00),
  ('STN-001', '2026-05', 'age',   '26-35',    1, 44.00, 298.00, 13.00),
  ('STN-001', '2026-05', 'age',   '36-45',    2, 16.00, 322.00,  4.00),
  ('STN-001', '2026-05', 'age',   '46+',      3,  7.00, 282.00,  2.00),
  -- STN-001 spend (29+47+19+5 = 100)
  ('STN-001', '2026-05', 'spend', '>฿400',    0, 29.00, NULL, NULL),
  ('STN-001', '2026-05', 'spend', '฿200-400', 1, 47.00, NULL, NULL),
  ('STN-001', '2026-05', 'spend', '฿100-200', 2, 19.00, NULL, NULL),
  ('STN-001', '2026-05', 'spend', '<฿100',    3,  5.00, NULL, NULL),
  -- STN-018 age (25+40+22+13 = 100)
  ('STN-018', '2026-05', 'age',   '18-25',    0, 25.00, 177.00,  6.00),
  ('STN-018', '2026-05', 'age',   '26-35',    1, 40.00, 242.00, 10.00),
  ('STN-018', '2026-05', 'age',   '36-45',    2, 22.00, 261.00,  2.00),
  ('STN-018', '2026-05', 'age',   '46+',      3, 13.00, 216.00,  0.00),
  -- STN-018 spend (17+42+29+12 = 100)
  ('STN-018', '2026-05', 'spend', '>฿400',    0, 17.00, NULL, NULL),
  ('STN-018', '2026-05', 'spend', '฿200-400', 1, 42.00, NULL, NULL),
  ('STN-018', '2026-05', 'spend', '฿100-200', 2, 29.00, NULL, NULL),
  ('STN-018', '2026-05', 'spend', '<฿100',    3, 12.00, NULL, NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. STATION-LEVEL METRICS (landlord portfolio) — May 2026, all 6 stations.
--    Station figures follow their OWN slope (concession/footfall, not store sales).
--    STN-018's station row mirrors its store row (same physical site).
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM public.station_monthly_metrics WHERE year_month = '2026-05';

INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct, basket_size_thb)
VALUES
  ('11111111-0000-0000-0000-000000000001', '2026-05', 12850, 33, 506, 94, 313.0),  -- lat_phrao
  ('11111111-0000-0000-0000-000000000002', '2026-05', 10520, 29, 324, 90, 285.0),  -- sukhumvit
  ('11111111-0000-0000-0000-000000000003', '2026-05',  8430, 27, 293, 82, 270.0),  -- rama9
  ('11111111-0000-0000-0000-000000000004', '2026-05',  6590, 25, 249, 76, 250.0),  -- bang_na
  ('11111111-0000-0000-0000-000000000005', '2026-05',  9220, 31, 344, 87, 292.0),  -- main
  ('11111111-0000-0000-0000-000000000018', '2026-05',   344, 23, 145, 89, 250.0);  -- nonthaburi (mirrors store)

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ML SALES FORECAST — re-anchor to June 2026 (UPDATE the two existing rows only).
--    predicted_revenue = May actual × ~1.02; pct_change_vs_last vs the NEW May actual.
--    Preserve existing band ratios (±8.33%) and the ~2.85× monthly→quarterly multiple.
-- ─────────────────────────────────────────────────────────────────────────────

-- STR-001: May actual 324000 → June 330480 (+2.00%); band ±8.33%; quarterly ×2.85.
UPDATE public.ml_sales_forecasts SET
  forecast_period       = '2026-06',
  predicted_revenue_thb = 330480.00,
  forecast_lower_thb    = 302945.00,
  forecast_upper_thb    = 358015.00,
  pct_change_vs_last    = 0.0200,
  predicted_quarterly_thb = 941868.00,
  quarterly_lower_thb     = 863362.00,
  quarterly_upper_thb     = 1020374.00
WHERE store_id = 'STR-001';

-- STR-077: May actual 145000 → June 147900 (+2.00%); band ±8.33%; quarterly ×2.85.
UPDATE public.ml_sales_forecasts SET
  forecast_period       = '2026-06',
  predicted_revenue_thb = 147900.00,
  forecast_lower_thb    = 135578.00,
  forecast_upper_thb    = 160222.00,
  pct_change_vs_last    = 0.0200,
  predicted_quarterly_thb = 421515.00,
  quarterly_lower_thb     = 386396.00,
  quarterly_upper_thb     = 456634.00
WHERE store_id = 'STR-077';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ANOMALY ALERTS — add a May 2026 row per store (UNIQUE on store_id+period).
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM public.ml_anomaly_alerts WHERE period = '2026-05';

INSERT INTO public.ml_anomaly_alerts
  (store_id, period, is_anomaly, anomaly_score, anomaly_dimension, pct_deviation, direction, severity, suggested_action, model_version)
VALUES
  ('STR-001', '2026-05', true, -0.612000, 'revenue', 0.0190, 'above', 'good_news',
   'Revenue was 1.9% above normal — keep top sellers well stocked through the mid-year restock.', 'iso_anomaly_v2.0'),
  ('STR-077', '2026-05', true, -0.598000, 'visitors', 0.0120, 'above', 'good_news',
   'Foot traffic was 1.2% higher than usual — add a staff member at peak hours to keep queues short.', 'iso_anomaly_v2.0');

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. EVENTS — May & June 2026 so the June forecast box has reasoning.
--    May: Visakha Bucha + Coronation Day + start of rainy season.
--    June: mid-year school-term restock + mid-year sale.
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM public.store_events WHERE year_month IN ('2026-05', '2026-06');

INSERT INTO public.store_events
  (store_display_id, year_month, event_name, event_type, description, est_traffic_lift_pct, est_sales_lift_pct)
VALUES
  (NULL,      '2026-05', 'Coronation Day & Visakha Bucha', 'holiday', 'Coronation Day (May 4) and Visakha Bucha long weekend lift highway travel and convenience spend across PTG stations.', 2.5, 2.0),
  (NULL,      '2026-05', 'Start of Rainy Season',          'seasonal','Early monsoon shifts demand toward quick in-store stops (drinks, snacks, rain gear) and shortens forecourt dwell.', 1.5, 1.0),
  ('STN-001', '2026-05', 'Mid-Year Restock Run-Up',        'seasonal','Lat Phrao 71 households begin pre-school-term shopping, lifting premium F&B and grab-and-go.', 1.5, 2.0),
  (NULL,      '2026-06', 'Mid-Year Sale',                  'promotion','Nationwide mid-year sale season raises basket sizes and impulse purchases at PTG retail bays.', 3.0, 4.0),
  ('STN-001', '2026-06', 'School-Term Restock',            'seasonal','Term reopens — families restock snacks, stationery and daily essentials, lifting Lat Phrao 71 traffic.', 3.0, 3.0),
  ('STN-018', '2026-06', 'School-Term Restock',            'seasonal','Nonthaburi neighbourhood demand rises as the school term reopens, lifting daily-essentials spend.', 2.5, 2.5);

COMMIT;
