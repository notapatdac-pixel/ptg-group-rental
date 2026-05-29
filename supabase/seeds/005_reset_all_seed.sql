-- ================================================================
-- PTG Group Rental — Full Reset Re-Seed (005)
-- Run AFTER all 4 migrations have been applied. Tables expected
-- empty (public.users preserved). All INSERTs are idempotent via
-- ON CONFLICT DO NOTHING.
--
-- Demo users in public.users (DO NOT touch):
--   712fef98-03ee-442b-a7b4-2fb3428e4e90  retailer@ptg.test  (Demo Retailer)
--   57cfd38a-473d-4cd5-9d8e-61fc37f5320d  landlord@ptg.test  (Demo Landlord)
--
-- Calendar: 6 months 2025-11 .. 2026-04 (latest = 2026-04).
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- 0. ENSURE basket_size_thb COLUMN EXISTS (was added ad-hoc; not
--    in any committed migration). Safe no-op if already there.
-- ────────────────────────────────────────────────────────────────
ALTER TABLE public.station_monthly_metrics
  ADD COLUMN IF NOT EXISTS basket_size_thb NUMERIC;

-- ────────────────────────────────────────────────────────────────
-- 1. RETAILER PROFILES
--    Lumina Artisan Roastery → retailer@ptg.test (the real demo retailer)
--    Stub profiles for landlord-side demo applications are attached
--    to the landlord user so they do NOT appear in the retailer's
--    /api/retailer/branches dropdown.
-- ────────────────────────────────────────────────────────────────
ALTER TABLE public.retailer_profiles ADD COLUMN IF NOT EXISTS owner_name text;

INSERT INTO public.retailer_profiles
  (id, user_id, business_name, category, experience, num_stores, max_budget, concept, owner_name)
VALUES
  ('55555555-0000-0000-0000-000000000001',
   '712fef98-03ee-442b-a7b4-2fb3428e4e90',
   'Lumina Artisan Roastery',
   'Cafe & Roastery',
   '5 years',
   '2',
   '50000',
   'Single-origin coffee roastery with Instagram-ready packaging and student-friendly pricing.',
   'Arisa Nakamura'),

  ('33333333-0000-0000-0000-000000000001',
   '57cfd38a-473d-4cd5-9d8e-61fc37f5320d',
   'The Artisan Brew', 'Artisan Cafe', '12 Years', '3', '30000',
   'Specialty coffee kiosk serving the EV charging community with premium single-origin brews and artisan pastry.',
   'Nattapong Sirikul'),

  ('33333333-0000-0000-0000-000000000002',
   '57cfd38a-473d-4cd5-9d8e-61fc37f5320d',
   'Tanaka Premium Market', 'Premium Retail', '25 Years', '12', '90000',
   'Premium Japanese convenience market with curated snacks, ready meals, and lifestyle products for urban commuters.',
   'Kenji Tanaka'),

  ('33333333-0000-0000-0000-000000000003',
   '57cfd38a-473d-4cd5-9d8e-61fc37f5320d',
   'PharmaPlus Express', 'Pharmacy', '8 Years', '5', '35000',
   'Express pharmacy and health essentials kiosk offering OTC medication, vitamins, and wellness products for daily commuters.',
   'Suchada Wongsiri')
ON CONFLICT (id) DO UPDATE SET owner_name = EXCLUDED.owner_name;

-- ────────────────────────────────────────────────────────────────
-- 2. STATIONS — 6 stations with real BKK coords
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.stations
  (id, display_id, filter_key, name, province, traffic_level,
   location_text, lat, lng, land_area_sqm, fueling_points, peak_hours, nearby_competitors)
VALUES
  ('11111111-0000-0000-0000-000000000001',
   'STN-001', 'lat_phrao', 'PTG Lat Phrao 71', 'Bangkok', 'high',
   'Lat Phrao Road, Bangkok', 13.804600, 100.580000,
   3800, 8, '07:00-09:00, 17:00-19:00', 3),

  ('11111111-0000-0000-0000-000000000002',
   'STN-002', 'sukhumvit', 'PTG Sukhumvit 62', 'Bangkok', 'high',
   'Sukhumvit Road, Bangkok', 13.720000, 100.599000,
   4200, 14, '07:00-09:30, 16:30-19:00', 2),

  ('11111111-0000-0000-0000-000000000003',
   'STN-003', 'rama9', 'PTG Rama 9', 'Bangkok', 'medium',
   'Rama IX Road, Bangkok', 13.750000, 100.565000,
   3100, 16, '07:30-10:00, 17:00-19:30', 2),

  ('11111111-0000-0000-0000-000000000004',
   'STN-004', 'bang_na', 'PTG Bang Na Complex', 'Samut Prakan', 'medium',
   'Bang Na, Samut Prakan', 13.674000, 100.593000,
   1900, 10, '06:30-09:00, 16:00-18:30', 4),

  ('11111111-0000-0000-0000-000000000005',
   'STN-005', 'main', 'PTG Main Station', 'Bangkok', 'high',
   'Chatuchak, Bangkok', 13.802500, 100.553700,
   2500, 12, '08:00-10:00, 17:00-19:00', 1),

  ('11111111-0000-0000-0000-000000000018',
   'STN-018', 'nonthaburi', 'PTG Nonthaburi', 'Nonthaburi', 'medium',
   'Nonthaburi City District', 13.862400, 100.518500,
   2800, 10, '07:00-09:00, 17:00-19:30', 2)
ON CONFLICT (display_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 3. STATION UNITS
--    Lumina branches:
--      STN-001 A-01  @ ฿49,000 (occupied by Lumina)
--      STN-018 A-01  @ ฿22,000 (occupied by Lumina)
--    Other notable units used by demo applications:
--      STN-002 A-01  → Artisan Brew (approved)
--      STN-003 G-01  → Tanaka (pending)
--      STN-004 B-01  → PharmaPlus (rejected)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.station_units
  (id, station_id, unit_code, unit_label, area_sqm, price_thb, lease_type, available)
VALUES
  -- ── STN-001 Lat Phrao 71 · 8 units · 6 occupied · 2 available ──
  ('22222222-0000-0000-0000-000000000101','11111111-0000-0000-0000-000000000001',
   'A-01','Premium Shopfront',  42,49000,'Premium Shopfront · 42 sqm',  FALSE), -- Lumina
  ('22222222-0000-0000-0001-000000000002','11111111-0000-0000-0000-000000000001',
   'A-02','Boutique Shop',      40,38000,'Boutique Shop · 40 sqm',      FALSE),
  ('22222222-0000-0000-0001-000000000003','11111111-0000-0000-0000-000000000001',
   'B-01','Express Counter',    12,16000,'Express Counter · 12 sqm',    FALSE),
  ('22222222-0000-0000-0001-000000000004','11111111-0000-0000-0000-000000000001',
   'B-02','Inner Kiosk',        18,20000,'Inner Kiosk · 18 sqm',        FALSE),
  ('22222222-0000-0000-0001-000000000005','11111111-0000-0000-0000-000000000001',
   'C-01','Standard Shopfront', 30,32000,'Standard Shopfront · 30 sqm', FALSE),
  ('22222222-0000-0000-0001-000000000006','11111111-0000-0000-0000-000000000001',
   'C-02','Corner Kiosk',       25,25000,'Corner Kiosk · 25 sqm',       FALSE),
  ('22222222-0000-0000-0001-000000000007','11111111-0000-0000-0000-000000000001',
   'D-01','Open-bay Kiosk',     15,18000,'Open-bay Kiosk · 15 sqm',     TRUE),
  ('22222222-0000-0000-0001-000000000008','11111111-0000-0000-0000-000000000001',
   'D-02','Corridor Unit',      20,22000,'Corridor Unit · 20 sqm',      TRUE),

  -- ── STN-002 Sukhumvit 62 · 8 units · all occupied ──
  ('22222222-0000-0000-0002-000000000001','11111111-0000-0000-0000-000000000002',
   'A-01','Corner Kiosk',       30,30000,'Corner Kiosk · 30 sqm',       FALSE), -- Artisan Brew
  ('22222222-0000-0000-0002-000000000002','11111111-0000-0000-0000-000000000002',
   'A-02','Boutique Flagship',  55,65000,'Boutique Flagship · 55 sqm',  FALSE),
  ('22222222-0000-0000-0002-000000000003','11111111-0000-0000-0000-000000000002',
   'B-01','Premium Kiosk',      28,38000,'Premium Kiosk · 28 sqm',      FALSE),
  ('22222222-0000-0000-0002-000000000004','11111111-0000-0000-0000-000000000002',
   'B-02','Express Counter',    12,18000,'Express Counter · 12 sqm',    FALSE),
  ('22222222-0000-0000-0002-000000000005','11111111-0000-0000-0000-000000000002',
   'C-01','Mid-size Shop',      35,42000,'Mid-size Shop · 35 sqm',      FALSE),
  ('22222222-0000-0000-0002-000000000006','11111111-0000-0000-0000-000000000002',
   'C-02','Side Kiosk',         20,24000,'Side Kiosk · 20 sqm',         FALSE),
  ('22222222-0000-0000-0002-000000000007','11111111-0000-0000-0000-000000000002',
   'D-01','Inner Unit',         22,26000,'Inner Unit · 22 sqm',         FALSE),
  ('22222222-0000-0000-0002-000000000008','11111111-0000-0000-0000-000000000002',
   'D-02','Rear Unit',          18,20000,'Rear Unit · 18 sqm',          FALSE),

  -- ── STN-003 Rama 9 · 6 units · 4 occupied · 2 available ──
  ('22222222-0000-0000-0003-000000000001','11111111-0000-0000-0000-000000000003',
   'E-01','Front Atrium',       40,55000,'Front Atrium · 40 sqm',       FALSE),
  ('22222222-0000-0000-0003-000000000002','11111111-0000-0000-0000-000000000003',
   'E-02','Boutique Space',     35,48000,'Boutique Space · 35 sqm',     FALSE),
  ('22222222-0000-0000-0003-000000000003','11111111-0000-0000-0000-000000000003',
   'F-01','Express Counter',    12,16000,'Express Counter · 12 sqm',    FALSE),
  ('22222222-0000-0000-0003-000000000004','11111111-0000-0000-0000-000000000003',
   'F-02','Inner Kiosk',        18,20000,'Inner Kiosk · 18 sqm',        FALSE),
  ('22222222-0000-0000-0000-000000000010','11111111-0000-0000-0000-000000000003',
   'G-01','Courtyard Kiosk',    15,18000,'Courtyard Kiosk · 15 sqm',    TRUE), -- Tanaka (pending)
  ('22222222-0000-0000-0003-000000000006','11111111-0000-0000-0000-000000000003',
   'G-02','Pop-up Bay',         20,12000,'Pop-up Bay · 20 sqm',         TRUE),

  -- ── STN-004 Bang Na · 6 units · 2 occupied · 4 available (Low) ──
  ('22222222-0000-0000-0004-000000000001','11111111-0000-0000-0000-000000000004',
   'A-01','Corner Kiosk',       30,28000,'Corner Kiosk · 30 sqm',       FALSE),
  ('22222222-0000-0000-0004-000000000002','11111111-0000-0000-0000-000000000004',
   'A-02','Shopfront',          40,35000,'Shopfront · 40 sqm',          FALSE),
  ('22222222-0000-0000-0000-000000000043','11111111-0000-0000-0000-000000000004',
   'B-01','Inner Unit',         25,22000,'Inner Unit · 25 sqm',         TRUE), -- PharmaPlus (rejected)
  ('22222222-0000-0000-0004-000000000004','11111111-0000-0000-0000-000000000004',
   'B-02','Express Counter',    12,15000,'Express Counter · 12 sqm',    TRUE),
  ('22222222-0000-0000-0004-000000000005','11111111-0000-0000-0000-000000000004',
   'C-01','Boutique Unit',      50,48000,'Boutique Unit · 50 sqm',      TRUE),
  ('22222222-0000-0000-0004-000000000006','11111111-0000-0000-0000-000000000004',
   'C-02','Kiosk Bay',          18,18000,'Kiosk Bay · 18 sqm',          TRUE),

  -- ── STN-005 Main Station · 6 units · 4 occupied · 2 available ──
  ('22222222-0000-0000-0005-000000000001','11111111-0000-0000-0000-000000000005',
   'A-01','Flagship Corner',    65,65000,'Flagship Corner · 65 sqm',    FALSE),
  ('22222222-0000-0000-0005-000000000002','11111111-0000-0000-0000-000000000005',
   'A-02','Kiosk Unit',         22,24000,'Kiosk Unit · 22 sqm',         FALSE),
  ('22222222-0000-0000-0005-000000000003','11111111-0000-0000-0000-000000000005',
   'B-01','Mid-size Shop',      40,38000,'Mid-size Shop · 40 sqm',      FALSE),
  ('22222222-0000-0000-0005-000000000004','11111111-0000-0000-0000-000000000005',
   'B-02','Express Counter',    14,16000,'Express Counter · 14 sqm',    FALSE),
  ('22222222-0000-0000-0005-000000000005','11111111-0000-0000-0000-000000000005',
   'C-01','Open Kiosk',         20,21000,'Open Kiosk · 20 sqm',         TRUE),
  ('22222222-0000-0000-0005-000000000006','11111111-0000-0000-0000-000000000005',
   'C-02','Corner Bay',         28,29000,'Corner Bay · 28 sqm',         TRUE),

  -- ── STN-018 Nonthaburi · 4 units · 2 occupied · 2 available ──
  ('22222222-0000-0000-0000-000000000181','11111111-0000-0000-0000-000000000018',
   'A-01','Corner Kiosk',       25,22000,'Corner Kiosk · 25 sqm',       FALSE), -- Lumina branch 2
  ('22222222-0000-0000-0018-000000000002','11111111-0000-0000-0000-000000000018',
   'A-02','Shopfront',          32,28000,'Shopfront · 32 sqm',          FALSE),
  ('22222222-0000-0000-0018-000000000003','11111111-0000-0000-0000-000000000018',
   'B-01','Inner Unit',         20,18000,'Inner Unit · 20 sqm',         TRUE),
  ('22222222-0000-0000-0018-000000000004','11111111-0000-0000-0000-000000000018',
   'B-02','Express Counter',    10,12000,'Express Counter · 10 sqm',    TRUE)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 4. STATION MONTHLY METRICS — 6 months × 6 stations = 36 rows
--    basket_size_thb seeded so /api/landlord/overview returns it.
--    Latest month (2026-04) basket values aligned with store
--    performance: STN-001 ~310, STN-018 ~248.
-- ────────────────────────────────────────────────────────────────

-- STN-001 Lat Phrao 71 — high traffic, premium basket
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct, basket_size_thb)
VALUES
  ('11111111-0000-0000-0000-000000000001','2025-11',11800,32,452,90,288),
  ('11111111-0000-0000-0000-000000000001','2025-12',12100,33,478,92,295),
  ('11111111-0000-0000-0000-000000000001','2026-01',12300,32,481,92,298),
  ('11111111-0000-0000-0000-000000000001','2026-02',11950,31,465,91,302),
  ('11111111-0000-0000-0000-000000000001','2026-03',12600,33,492,93,306),
  ('11111111-0000-0000-0000-000000000001','2026-04',12715,33,498,94,310)
ON CONFLICT (station_id, year_month) DO NOTHING;

-- STN-002 Sukhumvit 62 — high traffic urban
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct, basket_size_thb)
VALUES
  ('11111111-0000-0000-0000-000000000002','2025-11', 9800,28,290,87,265),
  ('11111111-0000-0000-0000-000000000002','2025-12',10100,28,302,88,270),
  ('11111111-0000-0000-0000-000000000002','2026-01',10200,29,308,88,272),
  ('11111111-0000-0000-0000-000000000002','2026-02', 9950,28,295,87,275),
  ('11111111-0000-0000-0000-000000000002','2026-03',10300,29,314,89,278),
  ('11111111-0000-0000-0000-000000000002','2026-04',10398,29,318,89,282)
ON CONFLICT (station_id, year_month) DO NOTHING;

-- STN-003 Rama 9 — medium traffic
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct, basket_size_thb)
VALUES
  ('11111111-0000-0000-0000-000000000003','2025-11',8100,26,270,78,255),
  ('11111111-0000-0000-0000-000000000003','2025-12',8300,27,278,79,258),
  ('11111111-0000-0000-0000-000000000003','2026-01',8400,26,282,80,260),
  ('11111111-0000-0000-0000-000000000003','2026-02',8200,26,275,79,262),
  ('11111111-0000-0000-0000-000000000003','2026-03',8350,27,284,81,265),
  ('11111111-0000-0000-0000-000000000003','2026-04',8326,27,287,81,268)
ON CONFLICT (station_id, year_month) DO NOTHING;

-- STN-004 Bang Na — medium, lower density
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct, basket_size_thb)
VALUES
  ('11111111-0000-0000-0000-000000000004','2025-11',5800,24,228,72,235),
  ('11111111-0000-0000-0000-000000000004','2025-12',6000,25,234,73,238),
  ('11111111-0000-0000-0000-000000000004','2026-01',6100,24,237,74,240),
  ('11111111-0000-0000-0000-000000000004','2026-02',5950,24,231,73,242),
  ('11111111-0000-0000-0000-000000000004','2026-03',6200,25,240,74,245),
  ('11111111-0000-0000-0000-000000000004','2026-04',6512,25,244,75,248)
ON CONFLICT (station_id, year_month) DO NOTHING;

-- STN-005 Main Station / Chatuchak — high traffic
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct, basket_size_thb)
VALUES
  ('11111111-0000-0000-0000-000000000005','2025-11',8700,30,316,83,275),
  ('11111111-0000-0000-0000-000000000005','2025-12',8900,30,325,84,278),
  ('11111111-0000-0000-0000-000000000005','2026-01',9000,31,330,85,280),
  ('11111111-0000-0000-0000-000000000005','2026-02',8800,30,322,84,282),
  ('11111111-0000-0000-0000-000000000005','2026-03',9050,31,334,85,286),
  ('11111111-0000-0000-0000-000000000005','2026-04',9100,31,337,86,290)
ON CONFLICT (station_id, year_month) DO NOTHING;

-- STN-018 Nonthaburi — suburban, lower volume
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct, basket_size_thb)
VALUES
  ('11111111-0000-0000-0000-000000000018','2025-11', 290,22,118,84,225),
  ('11111111-0000-0000-0000-000000000018','2025-12', 310,23,126,85,230),
  ('11111111-0000-0000-0000-000000000018','2026-01', 318,22,130,86,235),
  ('11111111-0000-0000-0000-000000000018','2026-02', 305,22,124,85,238),
  ('11111111-0000-0000-0000-000000000018','2026-03', 328,23,136,87,242),
  ('11111111-0000-0000-0000-000000000018','2026-04', 340,23,142,88,248)
ON CONFLICT (station_id, year_month) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 5. APPLICATIONS — 5 demo applications
--   Lumina @ STN-001 A-01    approved (the demo retailer)
--   Lumina @ STN-018 A-01    approved
--   Artisan Brew @ STN-002   approved
--   Tanaka @ STN-003 G-01    pending_review
--   PharmaPlus @ STN-004 B-01  not_approved
--
--  ai_text / ai_text_th are placeholders — will be regenerated
--  on demand by Gemini through /api/ai/summary.
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.applications
  (id, retailer_display_id, landlord_display_id,
   retailer_profile_id, station_unit_id,
   status, ai_score, ai_text, ai_text_th,
   est_revenue_thb, panel_color,
   applied_date, specialist_name, specialist_initials)
VALUES
  ('44444444-0000-0000-0000-000000000011',
   'PTG-APP-2025-1001', 'LAND-APP-2025-001',
   '55555555-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000101', -- STN-001 A-01
   'approved', '91%',
   'Lumina Artisan Roastery is a strong specialty-coffee brand with loyal customers. EV dwell time (20-35 min) aligns with their format. Forecasted revenue supports a healthy lease ratio at Lat Phrao 71.',
   'Lumina Artisan Roastery เป็นแบรนด์กาแฟพิเศษที่มีลูกค้าภักดี ระยะเวลาจอดรถชาร์จ EV (20-35 นาที) เหมาะกับรูปแบบร้าน รายได้คาดการณ์รองรับอัตราส่วนค่าเช่าได้ดี',
   '498000', '#2d5a1b',
   '2025-10-12', 'Kanya Srisuk', 'KS'),

  ('44444444-0000-0000-0000-000000000012',
   'PTG-APP-2025-1002', 'LAND-APP-2025-002',
   '55555555-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000181', -- STN-018 A-01
   'approved', '88%',
   'Strong brand extension for Lumina into the Nonthaburi corridor. Compact kiosk format fits the station layout. Lower traffic than Lat Phrao but solid growth trend.',
   'การขยายแบรนด์ Lumina เข้าสู่เส้นทาง Nonthaburi รูปแบบ kiosk ขนาดกะทัดรัดเหมาะกับสถานี การจราจรต่ำกว่า Lat Phrao เล็กน้อย แต่แนวโน้มเติบโตดี',
   '142000', '#2d5a1b',
   '2025-10-18', 'Kanya Srisuk', 'KS'),

  ('44444444-0000-0000-0000-000000000013',
   'PTG-APP-2025-1003', 'LAND-APP-2025-003',
   '33333333-0000-0000-0000-000000000001',
   '22222222-0000-0000-0002-000000000001', -- STN-002 A-01
   'approved', '89%',
   'The Artisan Brew captures strong morning commuter traffic. Corner kiosk placement at Sukhumvit 62 maximises peak-hour visibility.',
   'The Artisan Brew ดึงดูดลูกค้าช่วงเช้าได้ดี การวาง kiosk มุมที่ Sukhumvit 62 เพิ่มการมองเห็นช่วงพีค',
   '185000', '#4a5568',
   '2025-11-04', 'Kanya Srisuk', 'KS'),

  ('44444444-0000-0000-0000-000000000014',
   'PTG-APP-2026-1004', 'LAND-APP-2026-004',
   '33333333-0000-0000-0000-000000000002',
   '22222222-0000-0000-0000-000000000010', -- STN-003 G-01
   'pending_review', '94%',
   'Tanaka Premium Market would be an excellent anchor tenant for Rama 9. Strong brand recognition and proven EV-station format in Japan and Southeast Asia.',
   'Tanaka Premium Market จะเป็นผู้เช่าหลักที่ยอดเยี่ยมสำหรับ Rama 9 มีชื่อเสียงและรูปแบบสถานี EV ที่พิสูจน์แล้ว',
   '210000', '#744210',
   '2026-04-21', 'Kanya Srisuk', 'KS'),

  ('44444444-0000-0000-0000-000000000015',
   'PTG-APP-2026-1005', 'LAND-APP-2026-005',
   '33333333-0000-0000-0000-000000000003',
   '22222222-0000-0000-0000-000000000043', -- STN-004 B-01
   'not_approved', '71%',
   'PharmaPlus Express does not meet minimum traffic thresholds for Bang Na at this time. Recommend reapplication after Q3 2026 traffic projections are released.',
   'PharmaPlus Express ไม่ผ่านเกณฑ์การจราจรขั้นต่ำสำหรับ Bang Na ขณะนี้ แนะนำให้สมัครใหม่หลัง Q3 2026 เมื่อมีข้อมูลการจราจรใหม่',
   '95000', '#1a4a5e',
   '2026-03-08', 'Kanya Srisuk', 'KS')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 6. TENANT LEASES — 2 active leases for the demo retailer
--    (only Lumina's approved apps get explicit leases; Artisan
--    Brew's approval has no lease row since it's not tied to the
--    demo retailer's flow)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.tenant_leases
  (id, application_id, start_date, end_date, monthly_rent, lease_type, duration, signed_at)
VALUES
  ('66666666-0000-0000-0000-000000000001',
   '44444444-0000-0000-0000-000000000011',
   '2025-11-01','2026-10-31',
   49000,'12 Months','12 months','2025-10-25 10:00:00+07'),

  ('66666666-0000-0000-0000-000000000002',
   '44444444-0000-0000-0000-000000000012',
   '2025-11-01','2026-10-31',
   22000,'12 Months','12 months','2025-10-28 10:00:00+07'),

  ('66666666-0000-0000-0000-000000000003',
   '44444444-0000-0000-0000-000000000013',
   '2025-12-01','2026-11-30',
   30000,'12 Months','12 months','2025-11-25 10:00:00+07')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 7. BOOKINGS
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.bookings
  (id, application_id, visit_date, visit_time, status, notes)
VALUES
  ('77777777-0000-0000-0000-000000000001',
   '44444444-0000-0000-0000-000000000014',
   '2026-05-12','14:00','confirmed',
   'Site walkthrough at PTG Rama 9. Meet Kanya at the main entrance.'),

  ('77777777-0000-0000-0000-000000000002',
   '44444444-0000-0000-0000-000000000013',
   '2025-11-22','10:30','confirmed',
   'Lease signing walkthrough at PTG Sukhumvit 62.')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 8. NOTIFICATIONS — retailer + landlord sample feed
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.notifications
  (user_id, user_role, type, title, body, href, read, created_at)
VALUES
  ('712fef98-03ee-442b-a7b4-2fb3428e4e90','retailer','status_update',
   'Lease Active — Lat Phrao 71',
   'Your lease for PTG Lat Phrao 71 (Unit A-01) is now active. Rental starts 1 Nov 2025.',
   '/retailer_backoffice/myApplicationsPage', TRUE, NOW() - INTERVAL '180 days'),

  ('712fef98-03ee-442b-a7b4-2fb3428e4e90','retailer','status_update',
   'Lease Active — Nonthaburi',
   'Your lease for PTG Nonthaburi (Unit A-01) is now active. Rental starts 1 Nov 2025.',
   '/retailer_backoffice/myApplicationsPage', TRUE, NOW() - INTERVAL '178 days'),

  ('712fef98-03ee-442b-a7b4-2fb3428e4e90','retailer','message',
   'Monthly Revenue Report Ready',
   'Your April 2026 performance report is available. Lat Phrao 71 is up +1.2% MoM.',
   '/retailer_backoffice/performancePage', FALSE, NOW() - INTERVAL '2 days'),

  ('712fef98-03ee-442b-a7b4-2fb3428e4e90','retailer','system',
   'Lease Renewal Reminder',
   'Both leases expire 31 Oct 2026 — contact your specialist to discuss renewal terms.',
   '/retailer_backoffice/myApplicationsPage', FALSE, NOW() - INTERVAL '1 day'),

  ('57cfd38a-473d-4cd5-9d8e-61fc37f5320d','landlord','status_update',
   'New Application — PTG Rama 9',
   'Tanaka Premium Market has submitted an application for Unit G-01 at PTG Rama 9. Score: 94%.',
   '/landlord_backoffice/landlordApplicationsPage', FALSE, NOW() - INTERVAL '5 days'),

  ('57cfd38a-473d-4cd5-9d8e-61fc37f5320d','landlord','booking',
   'Site Visit Confirmed — Rama 9',
   'Tanaka Premium Market has confirmed a site visit for 12 May 2026 at 14:00.',
   '/landlord_backoffice/landlordApplicationsPage', FALSE, NOW() - INTERVAL '3 days'),

  ('57cfd38a-473d-4cd5-9d8e-61fc37f5320d','landlord','message',
   'Message from Lumina — Lat Phrao 71',
   'Lumina Artisan Roastery is asking about early renewal terms for their Lat Phrao 71 lease.',
   '/landlord_backoffice/landlordApplicationsPage', FALSE, NOW() - INTERVAL '1 day'),

  ('57cfd38a-473d-4cd5-9d8e-61fc37f5320d','landlord','system',
   'Monthly Portfolio Report',
   'April 2026: Portfolio revenue up 1.4% MoM. PTG Lat Phrao 71 leads with ฿498K.',
   '/landlord_backoffice/landlordOverviewPage', TRUE, NOW() - INTERVAL '2 days');

-- ────────────────────────────────────────────────────────────────
-- 9. STORE MONTHLY P&L — 6 months × 2 stores = 12 rows
--    STN-001 revenue 280-318k, rent 49k, utilities 7-8k
--    STN-018 revenue 124-142k, rent 22k, utilities 2.7-3k
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.store_monthly_pnl
  (store_display_id, year_month, revenue_thb, rent_thb, utilities_thb, net_thb) VALUES
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

-- ────────────────────────────────────────────────────────────────
-- 10. STORE MONTHLY RETENTION — 6 months × 2 stores = 12 rows
--     Latest month MoM percentages match task spec.
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.store_monthly_retention
  (store_display_id, year_month, new_customers, returning_customers, lapsed_customers,
   new_mom_pct, returning_mom_pct, lapsed_mom_pct) VALUES
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

-- ────────────────────────────────────────────────────────────────
-- 11. STORE MONTHLY PERFORMANCE — latest month, 2 rows
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.store_monthly_performance
  (store_display_id, year_month, orders, traffic, conversion_pct,
   avg_basket_thb, sales_per_sqm_thb, revisit_rate_pct, patron_score) VALUES
  ('STN-001', '2026-04', 158, 415, 38.1, 310.0, 4850.0, 62.0, 91),
  ('STN-018', '2026-04', 130, 340, 38.2, 248.0, 2580.0, 54.0, 88)
ON CONFLICT (store_display_id, year_month) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 12. CUSTOMER SEGMENTS — age + spend per store, 16 rows
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.store_customer_segments
  (store_display_id, year_month, segment_type, segment_label, segment_order,
   share_pct, avg_basket_thb, growth_pct) VALUES
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

-- ────────────────────────────────────────────────────────────────
-- 13. HOURLY TRAFFIC HEATMAP — 2 stores × 7 days × 18 hours = 252
--    Pattern: weekday peaks at 12:00 & 19:00; weekend peaks
--    noon-2pm + 6-7pm; quiet 10-11 & 14-17 on weekdays.
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.store_hourly_traffic
  (store_display_id, year_month, day_of_week, hour, intensity, visitors)
SELECT
  store_display_id,
  '2026-04' AS year_month,
  day_of_week,
  hour,
  intensity,
  CASE store_display_id
    WHEN 'STN-001' THEN intensity * 11 + 6   -- 6..50 range
    ELSE              intensity *  9 + 4    -- 4..40 range
  END AS visitors
FROM (
  VALUES
    -- Monday (0) — weekday
    (0,  6, 0), (0,  7, 1), (0,  8, 3), (0,  9, 2), (0, 10, 1), (0, 11, 2),
    (0, 12, 4), (0, 13, 3), (0, 14, 1), (0, 15, 1), (0, 16, 2), (0, 17, 2),
    (0, 18, 3), (0, 19, 4), (0, 20, 3), (0, 21, 2), (0, 22, 1), (0, 23, 0),
    -- Tuesday (1)
    (1,  6, 0), (1,  7, 1), (1,  8, 3), (1,  9, 2), (1, 10, 1), (1, 11, 2),
    (1, 12, 4), (1, 13, 3), (1, 14, 1), (1, 15, 1), (1, 16, 2), (1, 17, 2),
    (1, 18, 3), (1, 19, 4), (1, 20, 3), (1, 21, 2), (1, 22, 1), (1, 23, 0),
    -- Wednesday (2)
    (2,  6, 0), (2,  7, 1), (2,  8, 3), (2,  9, 2), (2, 10, 1), (2, 11, 2),
    (2, 12, 4), (2, 13, 3), (2, 14, 1), (2, 15, 1), (2, 16, 2), (2, 17, 2),
    (2, 18, 3), (2, 19, 4), (2, 20, 3), (2, 21, 2), (2, 22, 1), (2, 23, 0),
    -- Thursday (3)
    (3,  6, 0), (3,  7, 1), (3,  8, 3), (3,  9, 2), (3, 10, 1), (3, 11, 2),
    (3, 12, 4), (3, 13, 3), (3, 14, 1), (3, 15, 1), (3, 16, 2), (3, 17, 2),
    (3, 18, 3), (3, 19, 4), (3, 20, 3), (3, 21, 2), (3, 22, 1), (3, 23, 0),
    -- Friday (4)
    (4,  6, 0), (4,  7, 1), (4,  8, 3), (4,  9, 2), (4, 10, 1), (4, 11, 2),
    (4, 12, 4), (4, 13, 3), (4, 14, 2), (4, 15, 2), (4, 16, 3), (4, 17, 3),
    (4, 18, 4), (4, 19, 4), (4, 20, 3), (4, 21, 3), (4, 22, 2), (4, 23, 1),
    -- Saturday (5) — weekend
    (5,  6, 0), (5,  7, 0), (5,  8, 1), (5,  9, 2), (5, 10, 3), (5, 11, 3),
    (5, 12, 4), (5, 13, 4), (5, 14, 4), (5, 15, 3), (5, 16, 3), (5, 17, 3),
    (5, 18, 4), (5, 19, 4), (5, 20, 3), (5, 21, 3), (5, 22, 2), (5, 23, 1),
    -- Sunday (6)
    (6,  6, 0), (6,  7, 0), (6,  8, 1), (6,  9, 2), (6, 10, 3), (6, 11, 3),
    (6, 12, 4), (6, 13, 4), (6, 14, 4), (6, 15, 3), (6, 16, 3), (6, 17, 2),
    (6, 18, 3), (6, 19, 3), (6, 20, 2), (6, 21, 2), (6, 22, 1), (6, 23, 0)
) AS heatmap(day_of_week, hour, intensity)
CROSS JOIN (VALUES ('STN-001'), ('STN-018')) AS s(store_display_id)
ON CONFLICT (store_display_id, year_month, day_of_week, hour) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 14. PLATFORM BENCHMARKS — cafe category, 2026-04
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.platform_benchmarks
  (metric_key, category, year_month, top_25_value, median_value, bottom_25_value, unit_label) VALUES
  ('sales_per_sqm',  'cafe', '2026-04', 5200, 3100, 1900, '฿/sqm'),
  ('daily_visitors', 'cafe', '2026-04',  420,  285,  175, '/day'),
  ('revisit_rate',   'cafe', '2026-04',   68,   47,   31, '%')
ON CONFLICT (metric_key, category, year_month) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 15. ML SALES FORECASTS — next month forecasts (placeholders)
--     Will be REPLACED on first run of /api/ml/run.
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.ml_sales_forecasts
  (store_id, retailer_id, station_id, forecast_period,
   predicted_revenue_thb, forecast_lower_thb, forecast_upper_thb, pct_change_vs_last,
   predicted_quarterly_thb, quarterly_lower_thb, quarterly_upper_thb,
   predicted_avg_spend_thb, pct_change_spend_vs_last,
   confidence_pct, is_cold_start, model_version, trained_on_period)
VALUES
  ('STR-001','RET-001','STN-001','2026-05',
   325000, 308000, 342000, 0.022,
   985000, 935000, 1035000,
   315, 0.016,
   0.94, false, 'xgb_sales_v2.0_seed', '2025-11 to 2026-04'),

  ('STR-077','RET-001','STN-018','2026-05',
   145000, 137000, 153000, 0.021,
   438000, 414000, 462000,
   252, 0.016,
   0.92, false, 'xgb_sales_v2.0_seed', '2025-11 to 2026-04')
ON CONFLICT (store_id, forecast_period) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 16. ML CHURN SEGMENTS — mix of risk levels across both stores
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.ml_churn_segments
  (store_id, age_group, spend_range, n_monthly_customers, avg_risk_prob_pct,
   revenue_at_risk_annual, risk_level, recommended_action, model_version)
VALUES
  ('STR-001','46+',    '<100',       5.7, 49.9,   2543,'Medium','Monitor revenue trend for the next 2 months.','rf_churn_v3.0_seed'),
  ('STR-001','26-35',  '>400',      95.3, 19.2,  92453,'Low',   'Healthy momentum — no action required.','rf_churn_v3.0_seed'),
  ('STR-001','26-35',  '200-400',  125.3, 28.1, 118274,'Low',   'Healthy momentum — no action required.','rf_churn_v3.0_seed'),
  ('STR-001','18-25',  '200-400',   61.0, 17.4,  35623,'Low',   'Healthy momentum — no action required.','rf_churn_v3.0_seed'),
  ('STR-077','46+',    '<100',       4.2, 58.4,   3120,'High',  'Run a targeted re-engagement campaign for high-risk seniors.','rf_churn_v3.0_seed'),
  ('STR-077','36-45',  '100-200',   18.5, 34.2,  12480,'Medium','Pilot a loyalty bundle for the 36-45 mid-spend segment.','rf_churn_v3.0_seed'),
  ('STR-077','26-35',  '200-400',   42.1, 18.7,  28310,'Low',   'Healthy momentum — no action required.','rf_churn_v3.0_seed'),
  ('STR-077','18-25',  '100-200',   31.4, 16.2,  14275,'Low',   'Healthy momentum — no action required.','rf_churn_v3.0_seed')
ON CONFLICT (store_id, age_group, spend_range) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 17. ML MATCHING SCORES — expansion stations (STN-002/003/004/005)
--     + current stations (STN-001/018, filtered out in API).
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.ml_matching_scores
  (retailer_id, station_id, match_score, match_pct, match_label,
   estimated_earn_low_thb, estimated_earn_high_thb, is_cold_start, model_version)
VALUES
  ('RET-001','STN-002', 0.997, 99.7, 'EXCELLENT', 47565,  88788, false, 'lr_match_v2.0_seed'),
  ('RET-001','STN-005', 0.989, 98.9, 'EXCELLENT', 38420,  72100, false, 'lr_match_v2.0_seed'),
  ('RET-001','STN-003', 0.967, 96.7, 'STRONG',    32115,  60880, false, 'lr_match_v2.0_seed'),
  ('RET-001','STN-004', 0.842, 84.2, 'GOOD',      24380,  46210, false, 'lr_match_v2.0_seed'),
  -- Current stations (filtered out by /api/retailer/ml)
  ('RET-001','STN-001', 0.998, 99.8, 'EXCELLENT', 74561, 139181, false, 'lr_match_v2.0_seed'),
  ('RET-001','STN-018', 0.971, 97.1, 'EXCELLENT', 29615,  55281, false, 'lr_match_v2.0_seed')
ON CONFLICT (retailer_id, station_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 18. ML ANOMALY ALERTS — recent months for both stores
--     severities: good_news / watch / critical mixed.
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.ml_anomaly_alerts
  (store_id, period, is_anomaly, anomaly_score, anomaly_dimension,
   pct_deviation, direction, severity, suggested_action, model_version)
VALUES
  ('STR-001','2026-04', true, -0.512, 'conv_rate',
   0.10, 'above', 'good_news',
   'Conversion rate improved 10.0% — analyse what worked and replicate.',
   'iso_anomaly_v2.0_seed'),
  ('STR-001','2026-03', true, -0.228, 'avg_spend',
   -0.07, 'below', 'watch',
   'Average spend dipped 7.0% — introduce a mid-week upsell or bundle offer.',
   'iso_anomaly_v2.0_seed'),
  ('STR-001','2026-02', true, -0.447, 'revenue',
   -0.15, 'below', 'critical',
   'Revenue was 15.0% below normal — review pricing and promote high-margin items.',
   'iso_anomaly_v2.0_seed'),
  ('STR-077','2026-04', true, -0.489, 'visitors',
   0.12, 'above', 'good_news',
   'Foot traffic was 12.0% higher than usual — prepare extra stock and staff.',
   'iso_anomaly_v2.0_seed'),
  ('STR-077','2026-03', true, -0.193, 'revenue',
   -0.08, 'below', 'watch',
   'Revenue was 8.0% below normal — check if a local promotion or event affected footfall.',
   'iso_anomaly_v2.0_seed'),
  ('STR-077','2026-02', true, -0.421, 'conv_rate',
   -0.11, 'below', 'critical',
   'Conversion rate dropped 11.0% — review product placement or run a targeted promo.',
   'iso_anomaly_v2.0_seed')
ON CONFLICT (store_id, period) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 19. ML CUSTOMER ORIGINS — 6 distance bands × 2 stores = 12 rows
--    Pcts sum to ~100 per store. STR-001 (urban) skews short range;
--    STR-077 (suburban) has a longer tail.
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.ml_customer_origins
  (store_id, distance_band, customer_pct, model_version) VALUES
  ('STR-001', '0-1km',   38.0, 'v2.1_seed'),
  ('STR-001', '1-2km',   24.0, 'v2.1_seed'),
  ('STR-001', '2-5km',   20.0, 'v2.1_seed'),
  ('STR-001', '5-10km',  12.0, 'v2.1_seed'),
  ('STR-001', '10-20km',  4.0, 'v2.1_seed'),
  ('STR-001', '>20km',    2.0, 'v2.1_seed'),
  ('STR-077', '0-1km',   22.0, 'v2.1_seed'),
  ('STR-077', '1-2km',   20.0, 'v2.1_seed'),
  ('STR-077', '2-5km',   28.0, 'v2.1_seed'),
  ('STR-077', '5-10km',  18.0, 'v2.1_seed'),
  ('STR-077', '10-20km',  8.0, 'v2.1_seed'),
  ('STR-077', '>20km',    4.0, 'v2.1_seed');

-- ────────────────────────────────────────────────────────────────
-- 20. ML STORE CATCHMENT — 1 row per store (PK is store_id)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.ml_store_catchment
  (store_id, station_display_id, reach_5km_k, model_version) VALUES
  ('STR-001', 'STN-001', 142, 'v2.1_seed'),
  ('STR-077', 'STN-018',  78, 'v2.1_seed')
ON CONFLICT (store_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 21. ML ANOMALY SEVERITY GUARD (idempotent)
--    Invariant (see ml_demo_data.sql): an upward deviation on a
--    positive metric is favourable, so direction='above' must never
--    be 'critical'. Later ML runs occasionally wrote avg_spend rows
--    as 'above'/'critical' (Sail B re-verification fix 2026-05-29).
--    Normalise any such rows so the demo never shows "CRITICAL: spend up".
-- ────────────────────────────────────────────────────────────────
UPDATE public.ml_anomaly_alerts
   SET severity = 'good_news'
 WHERE direction = 'above'
   AND severity = 'critical';

-- ================================================================
-- END OF SEED 005 — verify counts with:
--   SELECT 'stations' AS t, COUNT(*) FROM public.stations
--   UNION ALL SELECT 'station_units', COUNT(*) FROM public.station_units
--   UNION ALL SELECT 'station_monthly_metrics', COUNT(*) FROM public.station_monthly_metrics
--   ... etc.
-- ================================================================
