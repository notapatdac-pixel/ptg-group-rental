-- ================================================================
-- Seed: retail analytics (run AFTER migrations/004_retail_analytics.sql)
-- Stores: STN-001 (Lumina, premium urban) + STN-018 (Nonthaburi, suburban)
-- Months: 2025-11 .. 2026-04 (latest = 2026-04)
-- ================================================================

-- 6-month P&L per store
INSERT INTO public.store_monthly_pnl (store_display_id, year_month, revenue_thb, rent_thb, utilities_thb, net_thb) VALUES
  ('STN-001', '2025-11', 280000, 49000, 7000, 224000),
  ('STN-001', '2025-12', 290000, 49000, 7500, 233500),
  ('STN-001', '2026-01', 295000, 49000, 7800, 238200),
  ('STN-001', '2026-02', 305000, 49000, 7900, 248100),
  ('STN-001', '2026-03', 312000, 49000, 8000, 255000),
  ('STN-001', '2026-04', 318000, 49000, 8000, 261000),
  ('STN-018', '2025-11', 124000, 22000, 2700,  99300),
  ('STN-018', '2025-12', 128000, 22000, 2800, 103200),
  ('STN-018', '2026-01', 132000, 22000, 2900, 107100),
  ('STN-018', '2026-02', 135000, 22000, 2900, 110100),
  ('STN-018', '2026-03', 138000, 22000, 3000, 113000),
  ('STN-018', '2026-04', 142000, 22000, 3000, 117000)
ON CONFLICT (store_display_id, year_month) DO NOTHING;

-- 6-month retention per store
INSERT INTO public.store_monthly_retention (store_display_id, year_month, new_customers, returning_customers, lapsed_customers, new_mom_pct, returning_mom_pct, lapsed_mom_pct) VALUES
  ('STN-001', '2025-11', 350, 820, 110,  5.0, 4.0, -2.0),
  ('STN-001', '2025-12', 365, 855, 105,  4.3, 4.3, -4.5),
  ('STN-001', '2026-01', 378, 890, 102,  3.6, 4.1, -2.9),
  ('STN-001', '2026-02', 388, 910, 100,  2.6, 2.2, -2.0),
  ('STN-001', '2026-03', 400, 925,  98,  3.1, 1.6, -2.0),
  ('STN-001', '2026-04', 415, 948,  95, 11.0, 7.0, -5.0),
  ('STN-018', '2025-11', 240, 780, 115,  4.0, 3.0, -3.0),
  ('STN-018', '2025-12', 255, 810, 108,  6.3, 3.8, -6.1),
  ('STN-018', '2026-01', 270, 830, 102,  5.9, 2.5, -5.6),
  ('STN-018', '2026-02', 282, 845, 100,  4.4, 1.8, -2.0),
  ('STN-018', '2026-03', 295, 860,  96,  4.6, 1.8, -4.0),
  ('STN-018', '2026-04', 312, 880,  92, 18.0, 6.0, -4.0)
ON CONFLICT (store_display_id, year_month) DO NOTHING;

-- Latest-month store performance
INSERT INTO public.store_monthly_performance (store_display_id, year_month, orders, traffic, conversion_pct, avg_basket_thb, sales_per_sqm_thb, revisit_rate_pct, patron_score) VALUES
  ('STN-001', '2026-04', 158, 415, 38.1, 310.0, 4850.0, 62.0, 91),
  ('STN-018', '2026-04', 130, 340, 38.2, 248.0, 2580.0, 54.0, 88)
ON CONFLICT (store_display_id, year_month) DO NOTHING;

-- Customer segments (age + spend)
INSERT INTO public.store_customer_segments (store_display_id, year_month, segment_type, segment_label, segment_order, share_pct, avg_basket_thb, growth_pct) VALUES
  ('STN-001', '2026-04', 'age', '18-25', 0, 32.0, 220.0, 12.0),
  ('STN-001', '2026-04', 'age', '26-35', 1, 44.0, 295.0, 14.0),
  ('STN-001', '2026-04', 'age', '36-45', 2, 17.0, 320.0,  4.0),
  ('STN-001', '2026-04', 'age', '46+',   3,  7.0, 280.0,  2.0),
  ('STN-001', '2026-04', 'spend', '>฿400',    0, 28.0, NULL, NULL),
  ('STN-001', '2026-04', 'spend', '฿200-400', 1, 48.0, NULL, NULL),
  ('STN-001', '2026-04', 'spend', '฿100-200', 2, 19.0, NULL, NULL),
  ('STN-001', '2026-04', 'spend', '<฿100',    3,  5.0, NULL, NULL),
  ('STN-018', '2026-04', 'age', '18-25', 0, 24.0, 175.0,  5.0),
  ('STN-018', '2026-04', 'age', '26-35', 1, 40.0, 240.0, 10.0),
  ('STN-018', '2026-04', 'age', '36-45', 2, 23.0, 260.0,  2.0),
  ('STN-018', '2026-04', 'age', '46+',   3, 13.0, 215.0,  0.0),
  ('STN-018', '2026-04', 'spend', '>฿400',    0, 16.0, NULL, NULL),
  ('STN-018', '2026-04', 'spend', '฿200-400', 1, 42.0, NULL, NULL),
  ('STN-018', '2026-04', 'spend', '฿100-200', 2, 30.0, NULL, NULL),
  ('STN-018', '2026-04', 'spend', '<฿100',    3, 12.0, NULL, NULL)
ON CONFLICT (store_display_id, year_month, segment_type, segment_label) DO NOTHING;

-- Platform benchmarks
INSERT INTO public.platform_benchmarks (metric_key, category, year_month, top_25_value, median_value, bottom_25_value, unit_label) VALUES
  ('sales_per_sqm',  'cafe', '2026-04', 5200, 3100, 1900, '฿/sqm'),
  ('daily_visitors', 'cafe', '2026-04',  420,  285,  175, '/day'),
  ('revisit_rate',   'cafe', '2026-04',   68,   47,   31, '%')
ON CONFLICT (metric_key, category, year_month) DO NOTHING;

-- Hourly traffic heatmap (2 stores × 7 days × 18 hours = 252 rows)
INSERT INTO public.store_hourly_traffic (store_display_id, year_month, day_of_week, hour, intensity, visitors)
SELECT
  store_display_id,
  '2026-04' as year_month,
  day_of_week,
  hour,
  intensity,
  CASE store_display_id WHEN 'STN-001' THEN intensity * 45 + 5 ELSE intensity * 35 + 4 END as visitors
FROM (
  VALUES
    (0,  6, 0), (0,  7, 0), (0,  8, 2), (0,  9, 3), (0, 10, 1), (0, 11, 2),
    (0, 12, 4), (0, 13, 3), (0, 14, 2), (0, 15, 2), (0, 16, 2), (0, 17, 1),
    (0, 18, 3), (0, 19, 4), (0, 20, 3), (0, 21, 2), (0, 22, 1), (0, 23, 0),
    (1,  6, 0), (1,  7, 0), (1,  8, 2), (1,  9, 3), (1, 10, 1), (1, 11, 2),
    (1, 12, 3), (1, 13, 3), (1, 14, 2), (1, 15, 1), (1, 16, 2), (1, 17, 1),
    (1, 18, 3), (1, 19, 4), (1, 20, 2), (1, 21, 2), (1, 22, 1), (1, 23, 0),
    (2,  6, 0), (2,  7, 0), (2,  8, 2), (2,  9, 4), (2, 10, 1), (2, 11, 2),
    (2, 12, 4), (2, 13, 3), (2, 14, 2), (2, 15, 2), (2, 16, 2), (2, 17, 2),
    (2, 18, 3), (2, 19, 3), (2, 20, 3), (2, 21, 2), (2, 22, 1), (2, 23, 0),
    (3,  6, 0), (3,  7, 0), (3,  8, 1), (3,  9, 3), (3, 10, 1), (3, 11, 2),
    (3, 12, 3), (3, 13, 3), (3, 14, 2), (3, 15, 1), (3, 16, 2), (3, 17, 2),
    (3, 18, 3), (3, 19, 4), (3, 20, 2), (3, 21, 2), (3, 22, 1), (3, 23, 0),
    (4,  6, 0), (4,  7, 0), (4,  8, 2), (4,  9, 3), (4, 10, 1), (4, 11, 2),
    (4, 12, 4), (4, 13, 3), (4, 14, 2), (4, 15, 2), (4, 16, 3), (4, 17, 2),
    (4, 18, 4), (4, 19, 4), (4, 20, 3), (4, 21, 3), (4, 22, 2), (4, 23, 1),
    (5,  6, 0), (5,  7, 0), (5,  8, 0), (5,  9, 1), (5, 10, 2), (5, 11, 3),
    (5, 12, 4), (5, 13, 4), (5, 14, 3), (5, 15, 3), (5, 16, 3), (5, 17, 3),
    (5, 18, 4), (5, 19, 4), (5, 20, 3), (5, 21, 3), (5, 22, 2), (5, 23, 1),
    (6,  6, 0), (6,  7, 0), (6,  8, 0), (6,  9, 1), (6, 10, 2), (6, 11, 3),
    (6, 12, 4), (6, 13, 4), (6, 14, 3), (6, 15, 3), (6, 16, 3), (6, 17, 2),
    (6, 18, 3), (6, 19, 3), (6, 20, 2), (6, 21, 2), (6, 22, 1), (6, 23, 0)
) AS heatmap(day_of_week, hour, intensity)
CROSS JOIN (VALUES ('STN-001'), ('STN-018')) AS s(store_display_id)
ON CONFLICT (store_display_id, year_month, day_of_week, hour) DO NOTHING;
