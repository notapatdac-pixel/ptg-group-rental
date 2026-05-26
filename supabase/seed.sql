-- ================================================================
-- PTG Group Rental — Seed Data
-- Run AFTER 001_schema.sql
--
-- Step 1: Create the two test auth accounts via Supabase Dashboard:
--   Dashboard > Authentication > Users > Add User
--   Email: retailer@ptg.test  Password: retailer123  (role: retailer)
--   Email: landlord@ptg.test  Password: landlord123  (role: landlord)
--   After creating, set raw_user_meta_data via the SQL below.
--
-- Step 2: Run this seed file in the SQL Editor.
-- ================================================================

-- ----------------------------------------------------------------
-- UPDATE USER META (replace UUIDs with actual IDs from auth.users)
-- ----------------------------------------------------------------
-- Run this after creating users in the Dashboard.
-- Find the UUIDs by running: SELECT id, email FROM auth.users;

-- UPDATE auth.users
-- SET raw_user_meta_data = '{"name":"Siriporn K.","role":"retailer","avatar_color":"#2d5a1b"}'::jsonb
-- WHERE email = 'retailer@ptg.test';

-- UPDATE auth.users
-- SET raw_user_meta_data = '{"name":"Wanchai P.","role":"landlord","avatar_color":"#466800"}'::jsonb
-- WHERE email = 'landlord@ptg.test';

-- ----------------------------------------------------------------
-- UPSERT public.users rows (if trigger already ran, this is safe)
-- ----------------------------------------------------------------
INSERT INTO public.users (id, email, name, role, avatar_color, initials)
SELECT id, email,
  CASE WHEN email = 'retailer@ptg.test' THEN 'Siriporn K.' ELSE 'Wanchai P.' END,
  CASE WHEN email = 'retailer@ptg.test' THEN 'retailer'    ELSE 'landlord'   END,
  CASE WHEN email = 'retailer@ptg.test' THEN '#2d5a1b'     ELSE '#466800'    END,
  CASE WHEN email = 'retailer@ptg.test' THEN 'S'           ELSE 'W'          END
FROM auth.users
WHERE email IN ('retailer@ptg.test', 'landlord@ptg.test')
ON CONFLICT (id) DO UPDATE SET
  name         = EXCLUDED.name,
  role         = EXCLUDED.role,
  avatar_color = EXCLUDED.avatar_color,
  initials     = EXCLUDED.initials;

-- ----------------------------------------------------------------
-- STATIONS
-- ----------------------------------------------------------------
INSERT INTO public.stations (id, display_id, filter_key, name, province, traffic_level, location_text, lat, lng, land_area_sqm, fueling_points, peak_hours, nearby_competitors)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'STN-001', 'sukhumvit', 'PTG Sukhumvit 62',    'Bangkok',       'high',   'Sukhumvit Road, Bangkok',  13.7200, 100.5990, 4200, 14, '07:00-09:30, 16:30-19:00', 2),
  ('11111111-0000-0000-0000-000000000002', 'STN-002', 'lat_phrao', 'PTG Lat Phrao 71',    'Bangkok',       'high',   'Lat Phrao Road, Bangkok',  13.8046, 100.5800, 3800,  8, '07:00-09:00, 17:00-19:00', 3),
  ('11111111-0000-0000-0000-000000000003', 'STN-003', 'rama9',     'PTG Rama 9',          'Bangkok',       'medium', 'Rama IX Road, Bangkok',    13.7500, 100.5650, 3100, 16, '07:30-10:00, 17:00-19:30', 2),
  ('11111111-0000-0000-0000-000000000004', 'STN-004', 'bang_na',   'PTG Bang Na Complex', 'Samut Prakan',  'high',   'Bang Na, Samut Prakan',    13.6740, 100.5930, 1900, 10, '06:30-09:00, 16:00-18:30', 4),
  ('11111111-0000-0000-0000-000000000005', 'STN-005', 'main',      'PTG Main Station',    'Bangkok',       'medium', 'Central Bangkok',          13.7563, 100.5018, 2500, 12, '08:00-10:00, 17:00-19:00', 1)
ON CONFLICT (display_id) DO NOTHING;

-- ----------------------------------------------------------------
-- STATION UNITS (units relevant to the 3 demo applications)
-- ----------------------------------------------------------------
INSERT INTO public.station_units (id, station_id, unit_code, unit_label, area_sqm, price_thb, lease_type, available)
VALUES
  -- Sukhumvit 62 units
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'A-01', 'Corner Kiosk',        30, 30000, 'Corner Kiosk · 30 sqm',        FALSE),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'A-02', 'Shopfront Unit',      35, 22000, 'Shopfront · 35 sqm',           TRUE),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'B-01', 'Boutique Flagship',  120,280000, 'Flagship Store · 120 sqm',     FALSE),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'C-01', 'Express Counter',     10, 28000, 'Express Counter · 10 sqm',     FALSE),
  -- Lat Phrao 71 units
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', 'A-01', 'Premium Kiosk',       25, 65000, 'Premium Kiosk · 25 sqm',       FALSE),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000002', 'B-02', 'Premium Shopfront',   38, 28000, 'Premium Shopfront · 38 sqm',   TRUE),
  ('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000002', 'B-03', 'Standard Kiosk',      20, 45000, 'Standard Kiosk · 20 sqm',      FALSE),
  ('22222222-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000002', 'C-01', 'Boutique Unit',       35, 85000, 'Boutique Unit · 35 sqm',       TRUE),
  -- Rama 9 units
  ('22222222-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000003', 'E-01', 'Front Atrium',        40, 55000, 'Front Atrium · 40 sqm',        FALSE),
  ('22222222-0000-0000-0000-000000000010', '11111111-0000-0000-0000-000000000003', 'F-01', 'Courtyard Kiosk',     15, 18000, 'Courtyard Kiosk · 15 sqm',     TRUE),
  ('22222222-0000-0000-0000-000000000011', '11111111-0000-0000-0000-000000000003', 'F-02', 'Pop-up Bay',          20, 12000, 'Pop-up Bay · 20 sqm',          TRUE)
ON CONFLICT (station_id, unit_code) DO NOTHING;

-- ----------------------------------------------------------------
-- STATION MONTHLY METRICS (6-month history for 3 stations)
-- ----------------------------------------------------------------
INSERT INTO public.station_monthly_metrics (station_id, year_month, daily_customers_avg, dwell_min_avg, est_revenue_k_thb, ai_score_pct)
VALUES
  ('11111111-0000-0000-0000-000000000001', '2025-11', 820, 14, 290, 91),
  ('11111111-0000-0000-0000-000000000001', '2025-12', 880, 15, 315, 92),
  ('11111111-0000-0000-0000-000000000001', '2026-01', 910, 14, 330, 93),
  ('11111111-0000-0000-0000-000000000001', '2026-02', 895, 13, 318, 91),
  ('11111111-0000-0000-0000-000000000001', '2026-03', 920, 14, 342, 94),
  ('11111111-0000-0000-0000-000000000001', '2026-04', 940, 15, 358, 94),
  ('11111111-0000-0000-0000-000000000002', '2025-11', 760, 12, 260, 87),
  ('11111111-0000-0000-0000-000000000002', '2025-12', 800, 13, 290, 88),
  ('11111111-0000-0000-0000-000000000002', '2026-01', 820, 12, 298, 87),
  ('11111111-0000-0000-0000-000000000002', '2026-02', 810, 12, 285, 88),
  ('11111111-0000-0000-0000-000000000002', '2026-03', 840, 13, 310, 89),
  ('11111111-0000-0000-0000-000000000002', '2026-04', 860, 12, 320, 89),
  ('11111111-0000-0000-0000-000000000003', '2025-11', 680, 9,  180, 79),
  ('11111111-0000-0000-0000-000000000003', '2025-12', 700, 10, 198, 81),
  ('11111111-0000-0000-0000-000000000003', '2026-01', 720, 9,  204, 81),
  ('11111111-0000-0000-0000-000000000003', '2026-02', 710, 9,  195, 80),
  ('11111111-0000-0000-0000-000000000003', '2026-03', 730, 10, 210, 82),
  ('11111111-0000-0000-0000-000000000003', '2026-04', 745, 10, 218, 82)
ON CONFLICT (station_id, year_month) DO NOTHING;

-- ----------------------------------------------------------------
-- RETAILER PROFILES
-- (linked to retailer@ptg.test — retailer has 3 stores in demo)
-- ----------------------------------------------------------------
INSERT INTO public.retailer_profiles (id, user_id, business_name, category, experience, num_stores, max_budget, concept)
SELECT
  prof.id, u.id, prof.business_name, prof.category, prof.experience, prof.num_stores, prof.max_budget, prof.concept
FROM auth.users u
JOIN (VALUES
  ('33333333-0000-0000-0000-000000000001'::uuid, 'The Artisan Brew',       'Artisan Cafe',    '12 Years', '3', '฿20,000',
   'Specialty coffee kiosk serving the EV charging community with premium single-origin brews and artisan pastry.'),
  ('33333333-0000-0000-0000-000000000002'::uuid, 'Tanaka Premium Market',  'Premium Retail',  '25 Years', '12', '฿90,000',
   'Premium Japanese convenience market with curated snacks, ready meals, and lifestyle products for urban commuters.'),
  ('33333333-0000-0000-0000-000000000003'::uuid, 'PharmaPlus Express',     'Pharmacy',        '8 Years',  '5', '฿35,000',
   'Express pharmacy and health essentials kiosk offering OTC medication, vitamins, and wellness products for daily commuters.')
) AS prof(id, business_name, category, experience, num_stores, max_budget, concept)
ON (TRUE)
WHERE u.email = 'retailer@ptg.test'
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- APPLICATIONS
-- ----------------------------------------------------------------
INSERT INTO public.applications (
  id, retailer_display_id, landlord_display_id, retailer_profile_id, station_unit_id,
  status, ai_score, ai_text, ai_text_th, est_revenue_thb, panel_color,
  applied_date, specialist_name, specialist_initials
)
VALUES
  (
    '44444444-0000-0000-0000-000000000001',
    'PTG-APP-2025-8821', 'LAND-APP-2025-001',
    '33333333-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000002',
    'approved',
    '89%',
    'High potential for morning commuter synergy. Proximity to EV chargers aligns with customer dwell times of 20–30 minutes. Budget fits the available units at this station.',
    'มีศักยภาพสูงในการดึงดูดลูกค้าช่วงเช้า ใกล้จุดชาร์จ EV เหมาะกับเวลาจอดรอ 20–30 นาที งบค่าเช่าสอดคล้องกับยูนิตที่มีอยู่ในสถานี',
    '14,200', '#4a5568',
    '2026-01-12', 'Kanya Srisuk', 'KS'
  ),
  (
    '44444444-0000-0000-0000-000000000002',
    'PTG-APP-2025-6174', 'LAND-APP-2025-002',
    '33333333-0000-0000-0000-000000000002',
    '22222222-0000-0000-0000-000000000006',
    'pending_review',
    '94%',
    'Enterprise-grade tenant with stable long-term outlook. Strong brand fit for the Lat Phrao residential catchment — ideal anchor for the vacant boutique unit.',
    'ผู้เช่าระดับองค์กรที่มีความมั่นคงระยะยาว แบรนด์เข้ากับกลุ่มลูกค้าที่พักอาศัยในลาดพร้าว เหมาะเป็นผู้เช่าหลักสำหรับยูนิตบูทีคที่ว่างอยู่',
    '32,800', '#744210',
    '2026-03-04', 'Kanya Srisuk', 'KS'
  ),
  (
    '44444444-0000-0000-0000-000000000003',
    'PTG-APP-2025-3302', 'LAND-APP-2025-003',
    '33333333-0000-0000-0000-000000000003',
    '22222222-0000-0000-0000-000000000011',
    'not_approved',
    '76%',
    'Service-oriented anchor with consistent repeat-visit draw. May require specialized ventilation and security upgrades — factor into lease terms. Good fit for underperforming Rama 9 unit.',
    'ผู้เช่าที่เน้นบริการและดึงดูดลูกค้าซ้ำได้สม่ำเสมอ อาจต้องปรับปรุงระบบระบายอากาศและความปลอดภัยเพิ่มเติม เหมาะสำหรับยูนิต Rama 9 ที่มีผลประกอบการต่ำ',
    '21,500', '#1a4a5e',
    '2025-11-18', 'Kanya Srisuk', 'KS'
  )
ON CONFLICT (retailer_display_id) DO NOTHING;

-- ----------------------------------------------------------------
-- SEED NOTIFICATIONS
-- ----------------------------------------------------------------
INSERT INTO public.notifications (user_role, type, title, body, href, read, created_at)
SELECT
  n.user_role, n.type, n.title, n.body, n.href, n.read,
  NOW() - (n.minutes_ago || ' minutes')::interval
FROM (VALUES
  ('retailer'::text, 'status_update'::text, 'Application Approved',
   'Your application PTG-APP-2025-8821 for PTG Sukhumvit 62 — Unit A-02 has been approved.',
   '/retailer_backoffice/myApplicationsPage', FALSE, 25),
  ('retailer', 'message', 'New message from Kanya S.',
   'Hi! Your application looks great. I''ve confirmed a walkthrough slot for you this Thursday at 14:00.',
   '/retailer_backoffice/scheduleBookingPage?appId=PTG-APP-2025-8821', FALSE, 120),
  ('retailer', 'status_update', 'Application Under Review',
   'PTG-APP-2025-6174 for PTG Lat Phrao 71 is now being reviewed by the landlord team.',
   '/retailer_backoffice/myApplicationsPage', TRUE, 1440),
  ('landlord', 'status_update', 'New Application Received',
   'Tanaka Premium Market has applied for Unit B-02 at PTG Lat Phrao 71. Review required.',
   '/landlord_backoffice/landlordApplicationsPage', FALSE, 30),
  ('landlord', 'message', 'New message from retailer',
   'The Artisan Brew is asking about lease flexibility for Unit A-02 at PTG Sukhumvit 62.',
   '/landlord_backoffice/landlordApplicationsPage', FALSE, 60),
  ('landlord', 'booking', 'Booking Request',
   'The Artisan Brew has requested to schedule a site walkthrough for Unit A-02 at PTG Sukhumvit 62.',
   '/landlord_backoffice/landlordApplicationsPage', FALSE, 180)
) AS n(user_role, type, title, body, href, read, minutes_ago);
