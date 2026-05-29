-- ================================================================
-- PTG Group Rental — Reset & Re-seed (single authoritative script)
-- Run in Supabase SQL Editor after 001_schema.sql, 002_ai_summaries.sql,
-- 003_ml_tables.sql have been applied.
--
-- Prerequisites: two auth accounts must already exist:
--   retailer@ptg.test  (role: retailer)
--   landlord@ptg.test  (role: landlord)
--
-- What this script does:
--   1. TRUNCATE all seeded tables (not public.users / auth.users)
--   2. Re-seed public.users rows for the two demo accounts
--   3. Insert 6 stations with CORRECT filter_keys (no UPDATE tricks)
--   4. Insert all station units (occupancy matches frontend static fallback)
--   5. Insert station monthly metrics (6 months × 6 stations)
--   6. Insert retailer profiles (Lumina + 3 landlord-view demo tenants)
--   7. Insert 5 applications (Lumina×2 approved, Artisan Brew approved,
--      Tanaka pending, PharmaPlus not_approved)
--   8. Insert 3 tenant leases for approved applications
--   9. Insert bookings and notifications
--  10. Insert all ML data (forecasts, churn, matching, anomalies)
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- 1. TRUNCATE — clean slate for all demo tables
--    CASCADE handles FK dependencies automatically.
--    public.users is intentionally excluded (FK → auth.users).
-- ────────────────────────────────────────────────────────────────
TRUNCATE TABLE
  public.ml_anomaly_alerts,
  public.ml_churn_segments,
  public.ml_matching_scores,
  public.ml_sales_forecasts,
  public.ai_summaries,
  public.ai_messages,
  public.ai_conversations,
  public.notifications,
  public.bookings,
  public.tenant_leases,
  public.applications,
  public.retailer_profiles,
  public.station_monthly_metrics,
  public.station_units,
  public.stations
CASCADE;

-- ────────────────────────────────────────────────────────────────
-- 2. public.users — upsert demo account rows
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.users (id, email, name, role, avatar_color, initials)
SELECT
  id, email,
  CASE email
    WHEN 'retailer@ptg.test' THEN 'Siriporn K.'
    ELSE 'Wanchai P.'
  END,
  CASE email
    WHEN 'retailer@ptg.test' THEN 'retailer'
    ELSE 'landlord'
  END,
  CASE email
    WHEN 'retailer@ptg.test' THEN '#2d5a1b'
    ELSE '#466800'
  END,
  CASE email
    WHEN 'retailer@ptg.test' THEN 'S'
    ELSE 'W'
  END
FROM auth.users
WHERE email IN ('retailer@ptg.test', 'landlord@ptg.test')
ON CONFLICT (id) DO UPDATE SET
  name         = EXCLUDED.name,
  role         = EXCLUDED.role,
  avatar_color = EXCLUDED.avatar_color,
  initials     = EXCLUDED.initials;

-- ────────────────────────────────────────────────────────────────
-- 3. STATIONS — 6 stations with correct filter_keys
--
--  UUID suffix  display_id  filter_key   Frontend name
--  ...000001    STN-001     lat_phrao    PTG Lat Phrao 71
--  ...000002    STN-002     sukhumvit    PTG Sukhumvit 62
--  ...000003    STN-003     rama9        PTG Rama 9
--  ...000004    STN-004     bang_na      PTG Bang Na Complex
--  ...000005    STN-005     main         PTG Main Station
--  ...000018    STN-018     nonthaburi   PTG Nonthaburi
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.stations
  (id, display_id, filter_key, name, province, traffic_level,
   location_text, lat, lng, land_area_sqm, fueling_points, peak_hours, nearby_competitors)
VALUES
  ('11111111-0000-0000-0000-000000000001',
   'STN-001', 'lat_phrao', 'PTG Lat Phrao 71', 'Bangkok', 'high',
   'Lat Phrao Road, Bangkok', 13.8046, 100.5800, 3800, 8, '07:00-09:00, 17:00-19:00', 3),

  ('11111111-0000-0000-0000-000000000002',
   'STN-002', 'sukhumvit', 'PTG Sukhumvit 62', 'Bangkok', 'high',
   'Sukhumvit Road, Bangkok', 13.7200, 100.5990, 4200, 14, '07:00-09:30, 16:30-19:00', 2),

  ('11111111-0000-0000-0000-000000000003',
   'STN-003', 'rama9', 'PTG Rama 9', 'Bangkok', 'medium',
   'Rama IX Road, Bangkok', 13.7500, 100.5650, 3100, 16, '07:30-10:00, 17:00-19:30', 2),

  ('11111111-0000-0000-0000-000000000004',
   'STN-004', 'bang_na', 'PTG Bang Na Complex', 'Samut Prakan', 'medium',
   'Bang Na, Samut Prakan', 13.6740, 100.5930, 1900, 10, '06:30-09:00, 16:00-18:30', 4),

  ('11111111-0000-0000-0000-000000000005',
   'STN-005', 'main', 'PTG Main Station', 'Bangkok', 'medium',
   'Din Daeng, Bangkok', 13.7563, 100.5018, 2500, 12, '08:00-10:00, 17:00-19:00', 1),

  ('11111111-0000-0000-0000-000000000018',
   'STN-018', 'nonthaburi', 'PTG Nonthaburi', 'Nonthaburi', 'medium',
   'Nonthaburi City District', 13.8624, 100.5185, 2800, 10, '07:00-09:00, 17:00-19:30', 2);

-- ────────────────────────────────────────────────────────────────
-- 4. STATION UNITS
--
--  Occupancy targets (matches landlordOverviewPage static fallback):
--   STN-001 lat_phrao  : 6/8  Partial
--   STN-002 sukhumvit  : 8/8  Full
--   STN-003 rama9      : 4/6  Partial
--   STN-004 bang_na    : 2/6  Low
--   STN-005 main       : 4/6  Partial
--   STN-018 nonthaburi : 2/4  (Lumina branch)
--
--  Units referenced by demo applications use preserved UUIDs:
--   22222222-0000-0000-0000-000000000023  D-03 @ STN-001  (Lumina)
--   22222222-0000-0000-0000-000000000181  A-01 @ STN-018  (Lumina)
--   22222222-0000-0000-0002-000000000001  A-01 @ STN-002  (Artisan Brew)
--   22222222-0000-0000-0000-000000000010  G-01 @ STN-003  (Tanaka, pending)
--   22222222-0000-0000-0000-000000000043  B-01 @ STN-004  (PharmaPlus, rejected)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.station_units
  (id, station_id, unit_code, unit_label, area_sqm, price_thb, lease_type, available)
VALUES

  -- ── STN-001 Lat Phrao 71 · 8 units · 6 occupied · 2 available ──
  ('22222222-0000-0000-0001-000000000001','11111111-0000-0000-0000-000000000001',
   'A-01','Corner Kiosk',       25,25000,'Corner Kiosk · 25 sqm',      FALSE),
  ('22222222-0000-0000-0001-000000000002','11111111-0000-0000-0000-000000000001',
   'A-02','Boutique Shop',      40,38000,'Boutique Shop · 40 sqm',      FALSE),
  ('22222222-0000-0000-0001-000000000003','11111111-0000-0000-0000-000000000001',
   'B-01','Express Counter',    12,16000,'Express Counter · 12 sqm',    FALSE),
  ('22222222-0000-0000-0001-000000000004','11111111-0000-0000-0000-000000000001',
   'B-02','Inner Kiosk',        18,20000,'Inner Kiosk · 18 sqm',        FALSE),
  ('22222222-0000-0000-0001-000000000005','11111111-0000-0000-0000-000000000001',
   'C-01','Standard Shopfront', 30,32000,'Standard Shopfront · 30 sqm', FALSE),
  ('22222222-0000-0000-0000-000000000023','11111111-0000-0000-0000-000000000001',
   'D-03','Premium Shopfront',  42,55000,'Premium Shopfront · 42 sqm',  FALSE), -- Lumina's unit
  ('22222222-0000-0000-0001-000000000007','11111111-0000-0000-0000-000000000001',
   'D-01','Open-bay Kiosk',     15,18000,'Open-bay Kiosk · 15 sqm',     TRUE),
  ('22222222-0000-0000-0001-000000000008','11111111-0000-0000-0000-000000000001',
   'D-02','Corridor Unit',      20,22000,'Corridor Unit · 20 sqm',      TRUE),

  -- ── STN-002 Sukhumvit 62 · 8 units · all occupied (Full) ──
  ('22222222-0000-0000-0002-000000000001','11111111-0000-0000-0000-000000000002',
   'A-01','Corner Kiosk',       30,30000,'Corner Kiosk · 30 sqm',       FALSE), -- Artisan Brew
  ('22222222-0000-0000-0002-000000000002','11111111-0000-0000-0000-000000000002',
   'A-02','Boutique Flagship',  55,72000,'Boutique Flagship · 55 sqm',  FALSE),
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
   'A-01','Flagship Corner',    65,72000,'Flagship Corner · 65 sqm',    FALSE),
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
   'A-01','Corner Kiosk',       25,22000,'Corner Kiosk · 25 sqm',       FALSE), -- Lumina's unit
  ('22222222-0000-0000-0018-000000000002','11111111-0000-0000-0000-000000000018',
   'A-02','Shopfront',          32,28000,'Shopfront · 32 sqm',          FALSE),
  ('22222222-0000-0000-0018-000000000003','11111111-0000-0000-0000-000000000018',
   'B-01','Inner Unit',         20,18000,'Inner Unit · 20 sqm',         TRUE),
  ('22222222-0000-0000-0018-000000000004','11111111-0000-0000-0000-000000000018',
   'B-02','Express Counter',    10,12000,'Express Counter · 10 sqm',    TRUE);

-- ────────────────────────────────────────────────────────────────
-- 5. STATION MONTHLY METRICS — 6 months (2025-11 → 2026-04)
--    Apr 2026 values match landlordOverviewPage static KPIs
-- ────────────────────────────────────────────────────────────────

-- STN-001 Lat Phrao 71 — 2026-04: 12715 customers / ฿498K
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000001','2025-11',11800,18,452,90),
  ('11111111-0000-0000-0000-000000000001','2025-12',12100,19,478,92),
  ('11111111-0000-0000-0000-000000000001','2026-01',12300,18,481,92),
  ('11111111-0000-0000-0000-000000000001','2026-02',11950,17,465,91),
  ('11111111-0000-0000-0000-000000000001','2026-03',12600,19,492,93),
  ('11111111-0000-0000-0000-000000000001','2026-04',12715,19,498,94);

-- STN-002 Sukhumvit 62 — 2026-04: 10398 / ฿318K
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000002','2025-11', 9800,15,290,87),
  ('11111111-0000-0000-0000-000000000002','2025-12',10100,15,302,88),
  ('11111111-0000-0000-0000-000000000002','2026-01',10200,16,308,88),
  ('11111111-0000-0000-0000-000000000002','2026-02', 9950,15,295,87),
  ('11111111-0000-0000-0000-000000000002','2026-03',10300,16,314,89),
  ('11111111-0000-0000-0000-000000000002','2026-04',10398,16,318,89);

-- STN-003 Rama 9 — 2026-04: 8326 / ฿287K
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000003','2025-11',8100,13,270,78),
  ('11111111-0000-0000-0000-000000000003','2025-12',8300,14,278,79),
  ('11111111-0000-0000-0000-000000000003','2026-01',8400,13,282,80),
  ('11111111-0000-0000-0000-000000000003','2026-02',8200,13,275,79),
  ('11111111-0000-0000-0000-000000000003','2026-03',8350,14,284,81),
  ('11111111-0000-0000-0000-000000000003','2026-04',8326,14,287,81);

-- STN-004 Bang Na — 2026-04: 6512 / ฿244K
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000004','2025-11',5800,11,228,72),
  ('11111111-0000-0000-0000-000000000004','2025-12',6000,12,234,73),
  ('11111111-0000-0000-0000-000000000004','2026-01',6100,11,237,74),
  ('11111111-0000-0000-0000-000000000004','2026-02',5950,11,231,73),
  ('11111111-0000-0000-0000-000000000004','2026-03',6200,12,240,74),
  ('11111111-0000-0000-0000-000000000004','2026-04',6512,12,244,75);

-- STN-005 Main Station — 2026-04: 9100 / ฿337K
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000005','2025-11',8700,14,316,83),
  ('11111111-0000-0000-0000-000000000005','2025-12',8900,14,325,84),
  ('11111111-0000-0000-0000-000000000005','2026-01',9000,15,330,85),
  ('11111111-0000-0000-0000-000000000005','2026-02',8800,14,322,84),
  ('11111111-0000-0000-0000-000000000005','2026-03',9050,15,334,85),
  ('11111111-0000-0000-0000-000000000005','2026-04',9100,15,337,86);

-- STN-018 Nonthaburi — 2026-04: 340 / ฿142K
INSERT INTO public.station_monthly_metrics
  (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000018','2025-11', 290,14,118,84),
  ('11111111-0000-0000-0000-000000000018','2025-12', 310,15,126,85),
  ('11111111-0000-0000-0000-000000000018','2026-01', 318,14,130,86),
  ('11111111-0000-0000-0000-000000000018','2026-02', 305,14,124,85),
  ('11111111-0000-0000-0000-000000000018','2026-03', 328,15,136,87),
  ('11111111-0000-0000-0000-000000000018','2026-04', 340,15,142,88);

-- ────────────────────────────────────────────────────────────────
-- 6. RETAILER PROFILES
--    55555555-...-001  Lumina Artisan Roastery  → retailer@ptg.test
--    33333333-...-001  The Artisan Brew         → landlord@ptg.test (demo data only)
--    33333333-...-002  Tanaka Premium Market    → landlord@ptg.test (demo data only)
--    33333333-...-003  PharmaPlus Express       → landlord@ptg.test (demo data only)
--
--  Artisan Brew / Tanaka / PharmaPlus are linked to landlord@ptg.test so they
--  do not pollute the retailer dropdown (/api/retailer/branches is filtered
--  to Lumina's profile only for the demo).
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.retailer_profiles
  (id, user_id, business_name, category, experience, num_stores, max_budget, concept)
SELECT
  prof.id::uuid, u.id,
  prof.business_name, prof.category, prof.experience,
  prof.num_stores, prof.max_budget, prof.concept
FROM auth.users u
JOIN (VALUES
  ('55555555-0000-0000-0000-000000000001',
   'retailer@ptg.test',
   'Lumina Artisan Roastery', 'Artisan Café', '8 Years', '2', '฿55,000',
   'Specialty coffee roastery and café serving ethically sourced single-origin brews with artisan pastries, targeting urban professionals and coffee enthusiasts at EV-charging stations.'),
  ('33333333-0000-0000-0000-000000000001',
   'landlord@ptg.test',
   'The Artisan Brew', 'Artisan Cafe', '12 Years', '3', '฿30,000',
   'Specialty coffee kiosk serving the EV charging community with premium single-origin brews and artisan pastry.'),
  ('33333333-0000-0000-0000-000000000002',
   'landlord@ptg.test',
   'Tanaka Premium Market', 'Premium Retail', '25 Years', '12', '฿90,000',
   'Premium Japanese convenience market with curated snacks, ready meals, and lifestyle products for urban commuters.'),
  ('33333333-0000-0000-0000-000000000003',
   'landlord@ptg.test',
   'PharmaPlus Express', 'Pharmacy', '8 Years', '5', '฿35,000',
   'Express pharmacy and health essentials kiosk offering OTC medication, vitamins, and wellness products for daily commuters.')
) AS prof(id, user_email, business_name, category, experience, num_stores, max_budget, concept)
  ON u.email = prof.user_email;

-- ────────────────────────────────────────────────────────────────
-- 7. APPLICATIONS
--
--  44444444-...-011  Lumina @ STN-001 Lat Phrao 71  (approved)
--  44444444-...-012  Lumina @ STN-018 Nonthaburi    (approved)
--  44444444-...-013  Artisan Brew @ STN-002 Sukhumvit 62 (approved)
--  44444444-...-014  Tanaka @ STN-003 Rama 9        (pending_review)
--  44444444-...-015  PharmaPlus @ STN-004 Bang Na   (not_approved)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.applications
  (id, retailer_display_id, landlord_display_id,
   retailer_profile_id, station_unit_id,
   status, ai_score, ai_text, ai_text_th,
   est_revenue_thb, panel_color,
   applied_date, specialist_name, specialist_initials)
VALUES

  ('44444444-0000-0000-0000-000000000011',
   'PTG-APP-2024-1001', 'LAND-APP-2024-001',
   '55555555-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000023',
   'approved', '91%',
   'Lumina Artisan Roastery is a top-tier specialty coffee brand with strong customer loyalty. Dwell-time alignment with EV charging (20–35 min) makes this a premium fit for Lat Phrao 71. Projected revenue supports a healthy lease ratio.',
   'Lumina Artisan Roastery เป็นแบรนด์กาแฟพิเศษระดับสูงที่มีฐานลูกค้าภักดี ระยะเวลาจอดรถชาร์จ EV (20–35 นาที) เหมาะกับแบรนด์นี้มาก รายได้ที่คาดการณ์ไว้รองรับอัตราส่วนค่าเช่าได้ดี',
   '318000', '#2d5a1b',
   '2024-01-15', 'Kanya Srisuk', 'KS'),

  ('44444444-0000-0000-0000-000000000012',
   'PTG-APP-2024-1002', 'LAND-APP-2024-002',
   '55555555-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000181',
   'approved', '88%',
   'Strong brand extension for Lumina into the Nonthaburi corridor. Compact kiosk format is well-suited to the station layout. Slightly lower traffic than Lat Phrao 71 but strong growth trend.',
   'การขยายแบรนด์ Lumina เข้าสู่เส้นทาง Nonthaburi ที่แข็งแกร่ง รูปแบบ kiosk ขนาดกะทัดรัดเหมาะกับสถานีนี้ การจราจรต่ำกว่า Lat Phrao 71 เล็กน้อย แต่มีแนวโน้มเติบโต',
   '142000', '#2d5a1b',
   '2024-03-10', 'Kanya Srisuk', 'KS'),

  ('44444444-0000-0000-0000-000000000013',
   'PTG-APP-2024-1003', 'LAND-APP-2024-003',
   '33333333-0000-0000-0000-000000000001',
   '22222222-0000-0000-0002-000000000001',
   'approved', '89%',
   'The Artisan Brew brings strong morning commuter traffic. Corner kiosk placement at Sukhumvit 62 maximises visibility during peak hours.',
   'The Artisan Brew ดึงดูดลูกค้าช่วงเช้าได้ดี การวาง kiosk มุมที่ Sukhumvit 62 เพิ่มการมองเห็นในช่วงพีค',
   '185000', '#4a5568',
   '2024-02-20', 'Kanya Srisuk', 'KS'),

  ('44444444-0000-0000-0000-000000000014',
   'PTG-APP-2024-1004', 'LAND-APP-2024-004',
   '33333333-0000-0000-0000-000000000002',
   '22222222-0000-0000-0000-000000000010',
   'pending_review', '94%',
   'Tanaka Premium Market would be an excellent anchor tenant for Rama 9. Strong brand recognition and proven EV-station format in Japan and Southeast Asia.',
   'Tanaka Premium Market จะเป็นผู้เช่าหลักที่ยอดเยี่ยมสำหรับ Rama 9 มีชื่อเสียงแบรนด์และรูปแบบสถานี EV ที่พิสูจน์แล้วในญี่ปุ่นและเอเชียตะวันออกเฉียงใต้',
   '210000', '#744210',
   '2024-04-05', 'Kanya Srisuk', 'KS'),

  ('44444444-0000-0000-0000-000000000015',
   'PTG-APP-2024-1005', 'LAND-APP-2024-005',
   '33333333-0000-0000-0000-000000000003',
   '22222222-0000-0000-0000-000000000043',
   'not_approved', '71%',
   'PharmaPlus Express does not meet minimum traffic threshold requirements for Bang Na at this time. Reapplication recommended after Q3 2024 when new traffic projections are available.',
   'PharmaPlus Express ไม่ผ่านเกณฑ์การจราจรขั้นต่ำสำหรับ Bang Na ในขณะนี้ แนะนำให้สมัครใหม่หลัง Q3 2024 เมื่อมีข้อมูลการจราจรใหม่',
   '95000', '#1a4a5e',
   '2024-03-28', 'Kanya Srisuk', 'KS');

-- ────────────────────────────────────────────────────────────────
-- 8. TENANT LEASES — one per approved application
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.tenant_leases
  (id, application_id, start_date, end_date, monthly_rent, lease_type, duration, signed_at)
VALUES
  ('66666666-0000-0000-0000-000000000001',
   '44444444-0000-0000-0000-000000000011',
   '2024-02-01','2026-01-31',
   49000,'Fixed-term','24 months','2024-01-28 10:00:00+07'),

  ('66666666-0000-0000-0000-000000000002',
   '44444444-0000-0000-0000-000000000012',
   '2024-04-01','2025-03-31',
   22000,'Fixed-term','12 months','2024-03-25 10:00:00+07'),

  ('66666666-0000-0000-0000-000000000003',
   '44444444-0000-0000-0000-000000000013',
   '2024-03-01','2025-02-28',
   30000,'Fixed-term','12 months','2024-02-26 10:00:00+07');

-- ────────────────────────────────────────────────────────────────
-- 9. BOOKINGS
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.bookings
  (id, application_id, visit_date, visit_time, status, notes)
VALUES
  ('77777777-0000-0000-0000-000000000001',
   '44444444-0000-0000-0000-000000000014',
   '2024-05-08','14:00','confirmed',
   'Site walkthrough at PTG Rama 9. Meet Kanya at the main entrance.'),

  ('77777777-0000-0000-0000-000000000002',
   '44444444-0000-0000-0000-000000000013',
   '2024-02-22','10:30','confirmed',
   'Lease signing walkthrough at PTG Sukhumvit 62.');

-- ────────────────────────────────────────────────────────────────
-- 10. NOTIFICATIONS — linked to demo user accounts
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.notifications
  (user_id, user_role, type, title, body, href, read, created_at)
SELECT
  CASE n.user_role
    WHEN 'retailer' THEN (SELECT id FROM auth.users WHERE email = 'retailer@ptg.test' LIMIT 1)
    WHEN 'landlord' THEN (SELECT id FROM auth.users WHERE email = 'landlord@ptg.test' LIMIT 1)
  END,
  n.user_role::text,
  n.type::text,
  n.title, n.body, n.href, n.read::boolean,
  NOW() - (n.days_ago || ' days')::interval
FROM (VALUES
  ('retailer','status_update',
   'Lease Active — Lat Phrao 71',
   'Your lease for PTG Lat Phrao 71 (Unit D-03) is now active. Rental starts 1 Feb 2024.',
   '/retailer_backoffice/myApplicationsPage', TRUE, 90),
  ('retailer','status_update',
   'Lease Active — Nonthaburi',
   'Your lease for PTG Nonthaburi (Unit A-01) is now active. Rental starts 1 Apr 2024.',
   '/retailer_backoffice/myApplicationsPage', FALSE, 30),
  ('retailer','message',
   'Monthly Revenue Report Ready',
   'Your April 2026 performance report is available. Lat Phrao 71 is up +1.2% MoM.',
   '/retailer_backoffice/performancePage', FALSE, 2),
  ('retailer','system',
   'Lease Renewal Reminder',
   'Your Nonthaburi lease expires in 60 days (31 Mar 2025). Contact your specialist to discuss renewal.',
   '/retailer_backoffice/myApplicationsPage', FALSE, 1),
  ('landlord','status_update',
   'New Application — PTG Rama 9',
   'Tanaka Premium Market has submitted an application for Unit G-01 at PTG Rama 9. Score: 94%.',
   '/landlord_backoffice/landlordApplicationsPage', FALSE, 5),
  ('landlord','booking',
   'Site Visit Confirmed — Rama 9',
   'Tanaka Premium Market has confirmed a site visit for 8 May 2024 at 14:00.',
   '/landlord_backoffice/landlordApplicationsPage', FALSE, 3),
  ('landlord','message',
   'Message from Lumina — Lat Phrao 71',
   'Lumina Artisan Roastery is asking about early renewal terms for their Lat Phrao 71 lease.',
   '/landlord_backoffice/landlordApplicationsPage', FALSE, 1),
  ('landlord','system',
   'Monthly Portfolio Report',
   'April 2026: Portfolio revenue up 1.4% MoM. PTG Lat Phrao 71 leads with ฿498K.',
   '/landlord_backoffice/landlordOverviewPage', TRUE, 2)
) AS n(user_role, type, title, body, href, read, days_ago);

-- ────────────────────────────────────────────────────────────────
-- 11. ML DATA — Sales Forecasts
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.ml_sales_forecasts
  (store_id, retailer_id, station_id, forecast_period,
   predicted_revenue_thb, forecast_lower_thb, forecast_upper_thb, pct_change_vs_last,
   predicted_quarterly_thb, quarterly_lower_thb, quarterly_upper_thb,
   predicted_avg_spend_thb, pct_change_spend_vs_last,
   confidence_pct, is_cold_start, model_version, trained_on_period)
VALUES
  ('STR-001','RET-001','STN-001','2024-07',
   433347,406424,460270,-0.0838,
   1235040,1158311,1311770,
   9564,0.0919,
   0.99,false,'xgb_sales_v2.0','2024-01 to 2024-04'),

  ('STR-077','RET-001','STN-018','2024-07',
   184820,157897,211742,-0.0076,
   526738,450008,603467,
   8392,0.2168,
   0.99,false,'xgb_sales_v2.0','2024-01 to 2024-04');

-- ────────────────────────────────────────────────────────────────
-- 12. ML DATA — Churn Segments (STR-001 only)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.ml_churn_segments
  (store_id, age_group, spend_range, n_monthly_customers, avg_risk_prob_pct,
   revenue_at_risk_annual, risk_level, recommended_action, model_version)
VALUES
  ('STR-001','46+',    '<100',       5.67, 49.9,  2543,'Medium','Monitor revenue trend for next 2 months.','rf_churn_v3.0'),
  ('STR-001','26-35',  '>400',      95.33, 19.2, 92453,'Low',   'Healthy momentum — no action required.','rf_churn_v3.0'),
  ('STR-001','26-35',  '200-400',  125.33, 28.1,118274,'Low',   'Healthy momentum — no action required.','rf_churn_v3.0'),
  ('STR-001','18-25',  '200-400',   61.0,  17.4, 35623,'Low',   'Healthy momentum — no action required.','rf_churn_v3.0'),
  ('STR-001','36-45',  '200-400',   61.0,  22.3, 45796,'Low',   'Healthy momentum — no action required.','rf_churn_v3.0'),
  ('STR-001','46+',    '200-400',   30.33, 17.2, 17527,'Low',   'Healthy momentum — no action required.','rf_churn_v3.0'),
  ('STR-001','18-25',  '>400',      46.67, 13.7, 32249,'Low',   'Healthy momentum — no action required.','rf_churn_v3.0'),
  ('STR-001','36-45',  '>400',      46.67, 16.4, 38456,'Low',   'Healthy momentum — no action required.','rf_churn_v3.0');

-- ────────────────────────────────────────────────────────────────
-- 13. ML DATA — Matching Scores (top 5 expansion + 2 current)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.ml_matching_scores
  (retailer_id, station_id, match_score, match_pct, match_label,
   estimated_earn_low_thb, estimated_earn_high_thb, is_cold_start, model_version)
VALUES
  ('RET-001','STN-026',0.9977,99.8,'EXCELLENT',57767,107831,false,'lr_match_v2.0'),
  ('RET-001','STN-021',0.9973,99.7,'EXCELLENT',46672, 87121,false,'lr_match_v2.0'),
  ('RET-001','STN-002',0.9972,99.7,'EXCELLENT',47565, 88788,false,'lr_match_v2.0'),
  ('RET-001','STN-027',0.9961,99.6,'EXCELLENT',39445, 73630,false,'lr_match_v2.0'),
  ('RET-001','STN-006',0.9968,99.7,'EXCELLENT',42911, 80100,false,'lr_match_v2.0'),
  -- current stations (filtered out in /api/retailer/ml)
  ('RET-001','STN-001',0.9981,99.8,'EXCELLENT',74561,139181,false,'lr_match_v2.0'),
  ('RET-001','STN-018',0.9971,99.7,'EXCELLENT',29615, 55281,false,'lr_match_v2.0');

-- ────────────────────────────────────────────────────────────────
-- 14. ML DATA — Anomaly Alerts (3 per store × 2 stores = 6 + 1 extra)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.ml_anomaly_alerts
  (store_id, period, is_anomaly, anomaly_score, anomaly_dimension,
   pct_deviation, direction, severity, suggested_action, model_version)
VALUES
  ('STR-001','2024-06',true,-0.512,'conv_rate',  0.10,'above','good_news',
   'Conversion rate improved 10.0% — analyse what worked and replicate.','iso_anomaly_v2.0'),
  ('STR-001','2024-05',true,-0.556,'conv_rate',  0.10,'above','good_news',
   'Conversion rate improved 10.0% — analyse what worked and replicate.','iso_anomaly_v2.0'),
  ('STR-001','2024-04',true,-0.228,'avg_spend', -0.07,'below','watch',
   'Average spend dipped 7.0% — introduce a mid-week upsell or bundle offer.','iso_anomaly_v2.0'),
  ('STR-001','2024-03',true,-0.447,'revenue',   -0.15,'below','critical',
   'Revenue was 15.0% below normal — review pricing and promote high-margin items.','iso_anomaly_v2.0'),
  ('STR-077','2024-06',true,-0.489,'visitors',   0.12,'above','good_news',
   'Foot traffic was 12.0% higher than usual — prepare extra stock and staff.','iso_anomaly_v2.0'),
  ('STR-077','2024-05',true,-0.193,'revenue',   -0.08,'below','watch',
   'Revenue was 8.0% below normal — check if a local promotion or event affected footfall.','iso_anomaly_v2.0'),
  ('STR-077','2024-04',true,-0.421,'conv_rate', -0.11,'below','critical',
   'Conversion rate dropped 11.0% — review product placement or run a targeted promo.','iso_anomaly_v2.0');
