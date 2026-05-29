-- 014_store_differentiation.sql
-- Makes each retailer store GENUINELY DIFFERENT by store type. The ML models,
-- run on this small cloned dataset, emit near-uniform churn/anomaly per segment
-- (risk is segment-intrinsic, not store-specific) — so we curate store-distinct,
-- event-aligned values here. NOTE: re-running the ML cron (run_cron.py) will
-- OVERWRITE churn/anomaly back to the model's uniform output — re-apply THIS
-- seed afterwards to restore the differentiated demo state.
--   STN-001/STR-001 Artisan Cafe   — young, local, morning/lunch peaks
--   STN-002/STR-002 Premium Market — older/affluent, wide catchment, evening peak
--   STN-003/STR-003 Wellness Pharm — oldest, hyper-local, flat daytime

-- 1. Customer segments (age + spend mix) by type
UPDATE store_customer_segments s SET share_pct = v.pct
FROM (VALUES
 ('STN-001','age','18-25',32),('STN-001','age','26-35',44),('STN-001','age','36-45',17),('STN-001','age','46+',7),
 ('STN-001','spend','>฿400',16),('STN-001','spend','฿200-400',44),('STN-001','spend','฿100-200',32),('STN-001','spend','<฿100',8),
 ('STN-002','age','18-25',12),('STN-002','age','26-35',28),('STN-002','age','36-45',35),('STN-002','age','46+',25),
 ('STN-002','spend','>฿400',38),('STN-002','spend','฿200-400',40),('STN-002','spend','฿100-200',17),('STN-002','spend','<฿100',5),
 ('STN-003','age','18-25',10),('STN-003','age','26-35',22),('STN-003','age','36-45',30),('STN-003','age','46+',38),
 ('STN-003','spend','>฿400',12),('STN-003','spend','฿200-400',33),('STN-003','spend','฿100-200',35),('STN-003','spend','<฿100',20)
) AS v(store, stype, label, pct)
WHERE s.store_display_id=v.store AND s.segment_type=v.stype AND s.segment_label=v.label;

-- 2. Customer origins (catchment) by type
UPDATE ml_customer_origins o SET customer_pct = v.pct
FROM (VALUES
 ('STR-001','0-1km',40),('STR-001','1-2km',26),('STR-001','2-5km',20),('STR-001','5-10km',9),('STR-001','10-20km',3),('STR-001','>20km',2),
 ('STR-002','0-1km',22),('STR-002','1-2km',20),('STR-002','2-5km',30),('STR-002','5-10km',18),('STR-002','10-20km',7),('STR-002','>20km',3),
 ('STR-003','0-1km',48),('STR-003','1-2km',28),('STR-003','2-5km',16),('STR-003','5-10km',5),('STR-003','10-20km',2),('STR-003','>20km',1)
) AS v(sid, band, pct)
WHERE o.store_id=v.sid AND o.distance_band=v.band;

-- 3. Churn risk by type (cafe young at-risk; market loyal/low; pharmacy young churns, elderly loyal)
UPDATE ml_churn_segments c SET
  avg_risk_prob_pct = v.risk,
  risk_level = CASE WHEN v.risk>=50 THEN 'High' WHEN v.risk>=35 THEN 'Medium' ELSE 'Low' END,
  revenue_at_risk_annual = round(revenue_at_risk_annual * v.risk / NULLIF(avg_risk_prob_pct,0))
FROM (VALUES
 ('STR-001','18-25',42),('STR-001','26-35',38),('STR-001','36-45',22),('STR-001','46+',30),
 ('STR-002','18-25',35),('STR-002','26-35',25),('STR-002','36-45',18),('STR-002','46+',20),
 ('STR-003','18-25',55),('STR-003','26-35',40),('STR-003','36-45',20),('STR-003','46+',15)
) AS v(sid, age, risk)
WHERE c.store_id=v.sid AND c.age_group=v.age;

-- 4. Anomalies — distinct, material (>=3%), recent (Apr/May), event-aligned, correct severity
DELETE FROM ml_anomaly_alerts WHERE store_id IN ('STR-001','STR-002','STR-003');
INSERT INTO ml_anomaly_alerts (store_id, period, is_anomaly, anomaly_score, anomaly_dimension, pct_deviation, direction, severity, suggested_action, model_version) VALUES
('STR-001','2026-04', true, 0.72, 'visitors',  -0.040, 'below', 'watch',     'Foot traffic was 4% below normal — Songkran travel emptied the weekday office crowd — push a hot-drink combo to lure remaining commuters.', 'curated_v2'),
('STR-001','2026-05', true, 0.66, 'avg_spend',  0.045, 'above', 'good_news', 'Average spend rose 4.5% — rainy-season hot-drink and pastry pairings are landing — feature the top pairing at the counter.', 'curated_v2'),
('STR-002','2026-05', true, 0.78, 'revenue',    0.052, 'above', 'good_news', 'Revenue was 5.2% above normal — month-end payday restock — extend premium-aisle stock and staff the evening peak.', 'curated_v2'),
('STR-002','2026-04', true, 0.61, 'visitors',   0.035, 'above', 'good_news', 'Foot traffic up 3.5% — pre-Songkran stock-up — bundle travel snacks near the entrance.', 'curated_v2'),
('STR-003','2026-05', true, 0.80, 'revenue',    0.058, 'above', 'good_news', 'Revenue was 5.8% above normal — rainy-season cold/flu and vitamin demand — keep wellness shelves fully stocked.', 'curated_v2'),
('STR-003','2026-04', true, 0.55, 'visitors',  -0.030, 'below', 'watch',     'Foot traffic was 3% below normal — Songkran quiet period as residents left town — run a returning-customer reminder.', 'curated_v2');

-- 4b. Performance metrics by type — conversion/basket/revisit/patron differ,
-- but conversion × basket is preserved (≈ revenue/(traffic×30)) so revenue still
-- reconciles. Cafe: impulse buys (8.3%/฿313); Premium Market: browse+big basket
-- (7.2%/฿360); Pharmacy: purposeful high-convert small basket (12%/฿215).
UPDATE store_monthly_performance p SET
  conversion_pct = v.conv, avg_basket_thb = v.basket, revisit_rate_pct = v.revisit,
  patron_score = v.patron, orders = round(p.traffic * v.conv / 100.0)
FROM (VALUES
 ('STN-001', 8.3, 313, 63, 92),
 ('STN-002', 7.2, 360, 52, 89),
 ('STN-003', 12.0, 215, 46, 86)
) AS v(store, conv, basket, revisit, patron)
WHERE p.store_display_id = v.store;
UPDATE store_monthly_performance SET avg_basket_thb = avg_basket_thb - 3
 WHERE year_month <= '2026-04' AND store_display_id IN ('STN-001','STN-002','STN-003');

-- 5. Hourly pattern by type
UPDATE store_hourly_traffic SET intensity = least(4, intensity+1) WHERE store_display_id='STN-002' AND hour BETWEEN 17 AND 20;
UPDATE store_hourly_traffic SET intensity = greatest(0, intensity-1) WHERE store_display_id='STN-002' AND hour BETWEEN 6 AND 9;
UPDATE store_hourly_traffic SET intensity = least(intensity, 3) WHERE store_display_id='STN-003';
UPDATE store_hourly_traffic SET intensity = greatest(0, intensity-2) WHERE store_display_id='STN-003' AND (hour < 9 OR hour > 19);
UPDATE store_hourly_traffic SET intensity = greatest(intensity, 2) WHERE store_display_id='STN-003' AND hour BETWEEN 10 AND 18;
