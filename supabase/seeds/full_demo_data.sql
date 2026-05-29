-- ================================================================
-- PTG Group Rental — Full Demo Data (all tables, new schema)
-- Run AFTER 001_schema.sql AND seed.sql
-- Safe to re-run: uses ON CONFLICT DO UPDATE / DO NOTHING
--
-- This script:
--   1. Fixes station filter_keys & names to match stationFilterContext
--   2. Adds STN-018 (PTG Nonthaburi) for Lumina's 2nd branch
--   3. Adds units/metrics for STN-004, STN-005, STN-018
--   4. Adds Lumina Artisan Roastery retailer profile
--   5. Adds approved applications + tenant leases for Lumina
--   6. Adds a pending application with booking (STN-003)
--   7. Adds notifications (requires demo users to exist)
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- 1. FIX STATION filter_keys + names (was swapped in initial seed)
--    STN-001 = Lat Phrao 71, STN-002 = Sukhumvit 62, etc.
-- ────────────────────────────────────────────────────────────────
UPDATE public.stations SET
  filter_key    = 'lat_phrao',
  name          = 'PTG Lat Phrao 71',
  location_text = 'Lat Phrao Road, Bangkok',
  lat           = 13.8046, lng = 100.5800
WHERE display_id = 'STN-001';

UPDATE public.stations SET
  filter_key    = 'sukhumvit',
  name          = 'PTG Sukhumvit 62',
  location_text = 'Sukhumvit Road, Bangkok',
  lat           = 13.7200, lng = 100.5990
WHERE display_id = 'STN-002';

UPDATE public.stations SET
  filter_key    = 'rama9',
  name          = 'PTG Rama 9',
  location_text = 'Rama IX Road, Bangkok'
WHERE display_id = 'STN-003';

UPDATE public.stations SET
  filter_key    = 'bang_na',
  name          = 'PTG Bang Na Complex',
  location_text = 'Bang Na, Bangkok'
WHERE display_id = 'STN-004';

UPDATE public.stations SET
  filter_key    = 'main',
  name          = 'PTG Main Station',
  location_text = 'Din Daeng, Bangkok'
WHERE display_id = 'STN-005';

-- ────────────────────────────────────────────────────────────────
-- 2. ADD STN-018 (Lumina's Nonthaburi branch)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.stations
  (id, display_id, filter_key, name, province, traffic_level,
   location_text, lat, lng, land_area_sqm, fueling_points, peak_hours, nearby_competitors)
VALUES
  ('11111111-0000-0000-0000-000000000018',
   'STN-018', 'nonthaburi', 'PTG Nonthaburi', 'Nonthaburi', 'medium',
   'Nonthaburi City District', 13.8624, 100.5185,
   2800, 10, '07:00-09:00, 17:00-19:30', 2)
ON CONFLICT (display_id) DO UPDATE SET
  filter_key    = EXCLUDED.filter_key,
  name          = EXCLUDED.name,
  location_text = EXCLUDED.location_text;

-- ────────────────────────────────────────────────────────────────
-- 3. STATION UNITS (add missing units for STN-004, STN-005, STN-018)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.station_units
  (id, station_id, unit_code, unit_label, area_sqm, price_thb, lease_type, available)
VALUES
  -- STN-001 (Lat Phrao 71) — additional units to reach 8 total
  ('22222222-0000-0000-0000-000000000021', '11111111-0000-0000-0000-000000000001',
   'D-01', 'Inner Kiosk',        18, 25000, 'Standard Kiosk · 18 sqm',  FALSE),
  ('22222222-0000-0000-0000-000000000022', '11111111-0000-0000-0000-000000000001',
   'D-02', 'Corridor Unit',      22, 28000, 'Corridor Unit · 22 sqm',   FALSE),
  ('22222222-0000-0000-0000-000000000023', '11111111-0000-0000-0000-000000000001',
   'D-03', 'Premium Shopfront',  42, 55000, 'Premium Shopfront · 42 sqm', FALSE),
  ('22222222-0000-0000-0000-000000000024', '11111111-0000-0000-0000-000000000001',
   'D-04', 'Open-bay Kiosk',     15, 19000, 'Open-bay Kiosk · 15 sqm',   TRUE),

  -- STN-002 (Sukhumvit 62) — additional units
  ('22222222-0000-0000-0000-000000000031', '11111111-0000-0000-0000-000000000002',
   'D-01', 'Side Kiosk',         20, 22000, 'Side Kiosk · 20 sqm',      FALSE),
  ('22222222-0000-0000-0000-000000000032', '11111111-0000-0000-0000-000000000002',
   'D-02', 'Boutique Shop',      55, 72000, 'Boutique Shop · 55 sqm',   FALSE),
  ('22222222-0000-0000-0000-000000000033', '11111111-0000-0000-0000-000000000002',
   'D-03', 'Express Counter',    12, 18000, 'Express Counter · 12 sqm', FALSE),
  ('22222222-0000-0000-0000-000000000034', '11111111-0000-0000-0000-000000000002',
   'D-04', 'Premium Kiosk',      28, 38000, 'Premium Kiosk · 28 sqm',   FALSE),

  -- STN-004 (Bang Na)
  ('22222222-0000-0000-0000-000000000041', '11111111-0000-0000-0000-000000000004',
   'A-01', 'Corner Kiosk',       30, 28000, 'Corner Kiosk · 30 sqm',    FALSE),
  ('22222222-0000-0000-0000-000000000042', '11111111-0000-0000-0000-000000000004',
   'A-02', 'Shopfront',          40, 35000, 'Shopfront · 40 sqm',       TRUE),
  ('22222222-0000-0000-0000-000000000043', '11111111-0000-0000-0000-000000000004',
   'B-01', 'Inner Unit',         25, 22000, 'Inner Unit · 25 sqm',      TRUE),
  ('22222222-0000-0000-0000-000000000044', '11111111-0000-0000-0000-000000000004',
   'B-02', 'Express Counter',    12, 15000, 'Express Counter · 12 sqm', TRUE),
  ('22222222-0000-0000-0000-000000000045', '11111111-0000-0000-0000-000000000004',
   'C-01', 'Boutique Unit',      50, 48000, 'Boutique Unit · 50 sqm',   TRUE),
  ('22222222-0000-0000-0000-000000000046', '11111111-0000-0000-0000-000000000004',
   'C-02', 'Kiosk Bay',          18, 18000, 'Kiosk Bay · 18 sqm',       FALSE),

  -- STN-005 (Main Station)
  ('22222222-0000-0000-0000-000000000051', '11111111-0000-0000-0000-000000000005',
   'A-01', 'Flagship Corner',    65, 72000, 'Flagship Corner · 65 sqm', FALSE),
  ('22222222-0000-0000-0000-000000000052', '11111111-0000-0000-0000-000000000005',
   'A-02', 'Kiosk Unit',         22, 24000, 'Kiosk Unit · 22 sqm',      FALSE),
  ('22222222-0000-0000-0000-000000000053', '11111111-0000-0000-0000-000000000005',
   'B-01', 'Mid-size Shop',      40, 38000, 'Mid-size Shop · 40 sqm',   FALSE),
  ('22222222-0000-0000-0000-000000000054', '11111111-0000-0000-0000-000000000005',
   'B-02', 'Express Counter',    14, 16000, 'Express Counter · 14 sqm', FALSE),
  ('22222222-0000-0000-0000-000000000055', '11111111-0000-0000-0000-000000000005',
   'C-01', 'Open Kiosk',         20, 21000, 'Open Kiosk · 20 sqm',      TRUE),
  ('22222222-0000-0000-0000-000000000056', '11111111-0000-0000-0000-000000000005',
   'C-02', 'Corner Bay',         28, 29000, 'Corner Bay · 28 sqm',      TRUE),

  -- STN-018 (Nonthaburi — Lumina's 2nd branch)
  ('22222222-0000-0000-0000-000000000181', '11111111-0000-0000-0000-000000000018',
   'A-01', 'Corner Kiosk',       25, 22000, 'Corner Kiosk · 25 sqm',    FALSE),
  ('22222222-0000-0000-0000-000000000182', '11111111-0000-0000-0000-000000000018',
   'A-02', 'Shopfront',          32, 28000, 'Shopfront · 32 sqm',       FALSE),
  ('22222222-0000-0000-0000-000000000183', '11111111-0000-0000-0000-000000000018',
   'B-01', 'Inner Unit',         20, 18000, 'Inner Unit · 20 sqm',      TRUE),
  ('22222222-0000-0000-0000-000000000184', '11111111-0000-0000-0000-000000000018',
   'B-02', 'Express Counter',    10, 12000, 'Express Counter · 10 sqm', TRUE)

ON CONFLICT (station_id, unit_code) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 4. STATION MONTHLY METRICS
--    Add STN-004, STN-005, STN-018 (6 months each: 2025-11→2026-04)
--    Update STN-001 to reflect Lat Phrao 71 station-level data
-- ────────────────────────────────────────────────────────────────

-- STN-001 (Lat Phrao 71) — station-level data for landlord overview
-- (update to realistic Lat Phrao 71 values)
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000001','2025-11',11800,18,452,90),
  ('11111111-0000-0000-0000-000000000001','2025-12',12100,19,478,92),
  ('11111111-0000-0000-0000-000000000001','2026-01',12300,18,481,92),
  ('11111111-0000-0000-0000-000000000001','2026-02',11950,17,465,91),
  ('11111111-0000-0000-0000-000000000001','2026-03',12600,19,492,93),
  ('11111111-0000-0000-0000-000000000001','2026-04',12715,19,498,94)
ON CONFLICT (station_id, year_month) DO UPDATE SET
  daily_customers_avg = EXCLUDED.daily_customers_avg,
  dwell_min_avg       = EXCLUDED.dwell_min_avg,
  est_revenue_k_thb   = EXCLUDED.est_revenue_k_thb,
  ai_score_pct        = EXCLUDED.ai_score_pct;

-- STN-002 (Sukhumvit 62)
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000002','2025-11', 9800,15,290,87),
  ('11111111-0000-0000-0000-000000000002','2025-12',10100,15,302,88),
  ('11111111-0000-0000-0000-000000000002','2026-01',10200,16,308,88),
  ('11111111-0000-0000-0000-000000000002','2026-02', 9950,15,295,87),
  ('11111111-0000-0000-0000-000000000002','2026-03',10300,16,314,89),
  ('11111111-0000-0000-0000-000000000002','2026-04',10398,16,318,89)
ON CONFLICT (station_id, year_month) DO UPDATE SET
  daily_customers_avg = EXCLUDED.daily_customers_avg,
  dwell_min_avg       = EXCLUDED.dwell_min_avg,
  est_revenue_k_thb   = EXCLUDED.est_revenue_k_thb,
  ai_score_pct        = EXCLUDED.ai_score_pct;

-- STN-003 (Rama 9)
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000003','2025-11',8100,13,270,78),
  ('11111111-0000-0000-0000-000000000003','2025-12',8300,14,278,79),
  ('11111111-0000-0000-0000-000000000003','2026-01',8400,13,282,80),
  ('11111111-0000-0000-0000-000000000003','2026-02',8200,13,275,79),
  ('11111111-0000-0000-0000-000000000003','2026-03',8350,14,284,81),
  ('11111111-0000-0000-0000-000000000003','2026-04',8326,14,287,81)
ON CONFLICT (station_id, year_month) DO UPDATE SET
  daily_customers_avg = EXCLUDED.daily_customers_avg,
  dwell_min_avg       = EXCLUDED.dwell_min_avg,
  est_revenue_k_thb   = EXCLUDED.est_revenue_k_thb,
  ai_score_pct        = EXCLUDED.ai_score_pct;

-- STN-004 (Bang Na) — lowest occupancy, building up
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000004','2025-11',5800,11,228,72),
  ('11111111-0000-0000-0000-000000000004','2025-12',6000,12,234,73),
  ('11111111-0000-0000-0000-000000000004','2026-01',6100,11,237,74),
  ('11111111-0000-0000-0000-000000000004','2026-02',5950,11,231,73),
  ('11111111-0000-0000-0000-000000000004','2026-03',6200,12,240,74),
  ('11111111-0000-0000-0000-000000000004','2026-04',6512,12,244,75)
ON CONFLICT (station_id, year_month) DO UPDATE SET
  daily_customers_avg = EXCLUDED.daily_customers_avg,
  dwell_min_avg       = EXCLUDED.dwell_min_avg,
  est_revenue_k_thb   = EXCLUDED.est_revenue_k_thb,
  ai_score_pct        = EXCLUDED.ai_score_pct;

-- STN-005 (Main Station)
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000005','2025-11',8700,14,316,83),
  ('11111111-0000-0000-0000-000000000005','2025-12',8900,14,325,84),
  ('11111111-0000-0000-0000-000000000005','2026-01',9000,15,330,85),
  ('11111111-0000-0000-0000-000000000005','2026-02',8800,14,322,84),
  ('11111111-0000-0000-0000-000000000005','2026-03',9050,15,334,85),
  ('11111111-0000-0000-0000-000000000005','2026-04',9100,15,337,86)
ON CONFLICT (station_id, year_month) DO UPDATE SET
  daily_customers_avg = EXCLUDED.daily_customers_avg,
  dwell_min_avg       = EXCLUDED.dwell_min_avg,
  est_revenue_k_thb   = EXCLUDED.est_revenue_k_thb,
  ai_score_pct        = EXCLUDED.ai_score_pct;

-- STN-018 (Nonthaburi — Lumina's 2nd branch)
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000018','2025-11',290,14,118,84),
  ('11111111-0000-0000-0000-000000000018','2025-12',310,15,126,85),
  ('11111111-0000-0000-0000-000000000018','2026-01',318,14,130,86),
  ('11111111-0000-0000-0000-000000000018','2026-02',305,14,124,85),
  ('11111111-0000-0000-0000-000000000018','2026-03',328,15,136,87),
  ('11111111-0000-0000-0000-000000000018','2026-04',340,15,142,88)
ON CONFLICT (station_id, year_month) DO UPDATE SET
  daily_customers_avg = EXCLUDED.daily_customers_avg,
  dwell_min_avg       = EXCLUDED.dwell_min_avg,
  est_revenue_k_thb   = EXCLUDED.est_revenue_k_thb,
  ai_score_pct        = EXCLUDED.ai_score_pct;

-- ────────────────────────────────────────────────────────────────
-- 5. RETAILER PROFILE — Lumina Artisan Roastery
--    Linked to retailer@ptg.test (same user as seed.sql)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.retailer_profiles
  (id, user_id, business_name, category, experience, num_stores, max_budget, concept)
SELECT
  '55555555-0000-0000-0000-000000000001'::uuid,
  u.id,
  'Lumina Artisan Roastery',
  'Artisan Café',
  '8 Years',
  '2',
  '฿55,000',
  'Specialty coffee roastery and café serving ethically sourced single-origin brews with artisan pastries, targeting urban professionals and coffee enthusiasts at EV-charging stations.'
FROM auth.users u
WHERE u.email = 'retailer@ptg.test'
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  category      = EXCLUDED.category,
  concept       = EXCLUDED.concept;

-- ────────────────────────────────────────────────────────────────
-- 6. APPLICATIONS — Lumina at STN-001 (approved) and STN-018 (approved)
--    + pending application at STN-003
--    + a second approved tenant at STN-002 for landlord tenants view
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.applications
  (id, retailer_display_id, landlord_display_id,
   retailer_profile_id, station_unit_id,
   status, ai_score, ai_text, ai_text_th,
   est_revenue_thb, panel_color,
   applied_date, specialist_name, specialist_initials)
VALUES

  -- Lumina @ STN-001 Lat Phrao 71 (unit D-03, Premium Shopfront)
  ('44444444-0000-0000-0000-000000000011',
   'PTG-APP-2024-1001', 'LAND-APP-2024-001',
   '55555555-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000023',
   'approved',
   '91%',
   'Lumina Artisan Roastery is a top-tier specialty coffee brand with strong customer loyalty. Dwell-time alignment with EV charging (20–35 min) makes this a premium fit for Lat Phrao 71. Projected revenue supports a healthy lease ratio.',
   'Lumina Artisan Roastery เป็นแบรนด์กาแฟพิเศษระดับสูงที่มีฐานลูกค้าภักดี ระยะเวลาจอดรถชาร์จ EV (20–35 นาที) เหมาะกับแบรนด์นี้มาก รายได้ที่คาดการณ์ไว้รองรับอัตราส่วนค่าเช่าได้ดี',
   '318000', '#2d5a1b',
   '2024-01-15', 'Kanya Srisuk', 'KS'),

  -- Lumina @ STN-018 Nonthaburi (unit A-01, Corner Kiosk)
  ('44444444-0000-0000-0000-000000000012',
   'PTG-APP-2024-1002', 'LAND-APP-2024-002',
   '55555555-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000181',
   'approved',
   '88%',
   'Strong brand extension for Lumina into the Nonthaburi corridor. Compact kiosk format is well-suited to the station layout. Slightly lower traffic than Lat Phrao 71 but strong growth trend.',
   'การขยายแบรนด์ Lumina เข้าสู่เส้นทาง Nonthaburi ที่แข็งแกร่ง รูปแบบ kiosk ขนาดกะทัดรัดเหมาะกับสถานีนี้ การจราจรต่ำกว่า Lat Phrao 71 เล็กน้อย แต่มีแนวโน้มเติบโต',
   '142000', '#2d5a1b',
   '2024-03-10', 'Kanya Srisuk', 'KS'),

  -- Artisan Brew @ STN-002 Sukhumvit 62 (unit A-01, Corner Kiosk — already approved)
  -- This uses the existing profile '33333333-0000-0000-0000-000000000001'
  -- and reuses unit '22222222-0000-0000-0000-000000000001'
  ('44444444-0000-0000-0000-000000000013',
   'PTG-APP-2024-1003', 'LAND-APP-2024-003',
   '33333333-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000001',
   'approved',
   '89%',
   'The Artisan Brew brings strong morning commuter traffic. Corner kiosk placement at Sukhumvit 62 maximises visibility during peak hours.',
   'The Artisan Brew ดึงดูดลูกค้าช่วงเช้าได้ดี การวาง kiosk มุมที่ Sukhumvit 62 เพิ่มการมองเห็นในช่วงพีค',
   '185000', '#4a5568',
   '2024-02-20', 'Kanya Srisuk', 'KS'),

  -- Pending application @ STN-003 Rama 9 (Tanaka Premium Market)
  ('44444444-0000-0000-0000-000000000014',
   'PTG-APP-2024-1004', 'LAND-APP-2024-004',
   '33333333-0000-0000-0000-000000000002',
   '22222222-0000-0000-0000-000000000010',
   'pending_review',
   '94%',
   'Tanaka Premium Market would be an excellent anchor tenant for Rama 9. Strong brand recognition and proven EV-station format in Japan and Southeast Asia.',
   'Tanaka Premium Market จะเป็นผู้เช่าหลักที่ยอดเยี่ยมสำหรับ Rama 9 มีชื่อเสียงแบรนด์และรูปแบบสถานี EV ที่พิสูจน์แล้วในญี่ปุ่นและเอเชียตะวันออกเฉียงใต้',
   '210000', '#744210',
   '2024-04-05', 'Kanya Srisuk', 'KS'),

  -- Not-approved application @ STN-004 Bang Na (PharmaPlus)
  ('44444444-0000-0000-0000-000000000015',
   'PTG-APP-2024-1005', 'LAND-APP-2024-005',
   '33333333-0000-0000-0000-000000000003',
   '22222222-0000-0000-0000-000000000043',
   'not_approved',
   '71%',
   'PharmaPlus Express does not meet minimum traffic threshold requirements for Bang Na at this time. Reapplication recommended after Q3 2024 when new traffic projections are available.',
   'PharmaPlus Express ไม่ผ่านเกณฑ์การจราจรขั้นต่ำสำหรับ Bang Na ในขณะนี้ แนะนำให้สมัครใหม่หลัง Q3 2024 เมื่อมีข้อมูลการจราจรใหม่',
   '95000', '#1a4a5e',
   '2024-03-28', 'Kanya Srisuk', 'KS')

ON CONFLICT (retailer_display_id) DO UPDATE SET
  status    = EXCLUDED.status,
  ai_score  = EXCLUDED.ai_score,
  ai_text   = EXCLUDED.ai_text;

-- ────────────────────────────────────────────────────────────────
-- 7. TENANT LEASES — Lumina at STN-001 and STN-018 + Artisan Brew at STN-002
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.tenant_leases
  (id, application_id, start_date, end_date, monthly_rent, lease_type, duration, signed_at)
VALUES
  -- Lumina @ Lat Phrao 71 (24-month lease)
  ('66666666-0000-0000-0000-000000000001',
   '44444444-0000-0000-0000-000000000011',
   '2024-02-01', '2026-01-31',
   49000, 'Fixed-term', '24 months',
   '2024-01-28 10:00:00+07'),

  -- Lumina @ Nonthaburi (12-month lease)
  ('66666666-0000-0000-0000-000000000002',
   '44444444-0000-0000-0000-000000000012',
   '2024-04-01', '2025-03-31',
   22000, 'Fixed-term', '12 months',
   '2024-03-25 10:00:00+07'),

  -- Artisan Brew @ Sukhumvit 62 (12-month lease)
  ('66666666-0000-0000-0000-000000000003',
   '44444444-0000-0000-0000-000000000013',
   '2024-03-01', '2025-02-28',
   30000, 'Fixed-term', '12 months',
   '2024-02-26 10:00:00+07')

ON CONFLICT (id) DO UPDATE SET
  monthly_rent = EXCLUDED.monthly_rent,
  start_date   = EXCLUDED.start_date,
  end_date     = EXCLUDED.end_date;

-- ────────────────────────────────────────────────────────────────
-- 8. BOOKINGS — site visit for pending Tanaka application at STN-003
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.bookings
  (id, application_id, visit_date, visit_time, status, notes)
VALUES
  ('77777777-0000-0000-0000-000000000001',
   '44444444-0000-0000-0000-000000000014',
   '2024-05-08', '14:00',
   'confirmed',
   'Site walkthrough at PTG Rama 9. Meet Kanya at the main entrance.'),

  ('77777777-0000-0000-0000-000000000002',
   '44444444-0000-0000-0000-000000000013',
   '2024-02-22', '10:30',
   'confirmed',
   'Lease signing walkthrough at PTG Sukhumvit 62.')

ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 9. NOTIFICATIONS
--    Requires users to exist from seed.sql
--    Inserts role-based notifications (no specific user_id needed for
--    API queries that use service role; add user_id if using RLS)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.notifications
  (user_role, type, title, body, href, read, created_at)
VALUES
  -- Retailer notifications
  ('retailer', 'status_update',
   'Lease Active — Lat Phrao 71',
   'Your lease for PTG Lat Phrao 71 (Unit D-03) is now active. Rental starts 1 Feb 2024.',
   '/retailer_backoffice/myApplicationsPage', TRUE,
   NOW() - INTERVAL '90 days'),

  ('retailer', 'status_update',
   'Lease Active — Nonthaburi',
   'Your lease for PTG Nonthaburi (Unit A-01) is now active. Rental starts 1 Apr 2024.',
   '/retailer_backoffice/myApplicationsPage', FALSE,
   NOW() - INTERVAL '30 days'),

  ('retailer', 'message',
   'Monthly Revenue Report Ready',
   'Your April 2026 performance report is available. Lat Phrao 71 is up +1.2% MoM.',
   '/retailer_backoffice/performancePage', FALSE,
   NOW() - INTERVAL '2 days'),

  ('retailer', 'system',
   'Lease Renewal Reminder',
   'Your Nonthaburi lease expires in 60 days (31 Mar 2025). Contact your specialist to discuss renewal.',
   '/retailer_backoffice/myApplicationsPage', FALSE,
   NOW() - INTERVAL '1 day'),

  -- Landlord notifications
  ('landlord', 'status_update',
   'New Application — PTG Rama 9',
   'Tanaka Premium Market has submitted an application for Unit F-01 at PTG Rama 9. Score: 94%.',
   '/landlord_backoffice/landlordApplicationsPage', FALSE,
   NOW() - INTERVAL '5 days'),

  ('landlord', 'booking',
   'Site Visit Confirmed — Rama 9',
   'Tanaka Premium Market has confirmed a site visit for 8 May 2024 at 14:00.',
   '/landlord_backoffice/landlordApplicationsPage', FALSE,
   NOW() - INTERVAL '3 days'),

  ('landlord', 'message',
   'Message from Lumina — Lat Phrao 71',
   'Lumina Artisan Roastery is asking about early renewal terms for their Lat Phrao 71 lease.',
   '/landlord_backoffice/landlordApplicationsPage', FALSE,
   NOW() - INTERVAL '1 day'),

  ('landlord', 'system',
   'Monthly Portfolio Report',
   'April 2026: Portfolio revenue up 1.4% MoM. PTG Lat Phrao 71 leads with ฿498K.',
   '/landlord_backoffice/landlordOverviewPage', TRUE,
   NOW() - INTERVAL '2 days')

ON CONFLICT DO NOTHING;
