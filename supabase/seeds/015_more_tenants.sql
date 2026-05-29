-- 015_more_tenants.sql
-- Fills the landlord tenant registry: 9 additional tenant businesses + their
-- units + approved apps + leases across the 5 portfolio stations, so each
-- station shows ~3 tenants. Idempotent. Re-run after any apps/leases wipe
-- (together with 013). These are OTHER retailers (not the Lumina test account).

-- Contact-person column (safe to re-run).
ALTER TABLE retailer_profiles ADD COLUMN IF NOT EXISTS owner_name text;

DELETE FROM tenant_leases WHERE application_id IN (SELECT id FROM applications WHERE retailer_display_id LIKE 'PTG-APP-2026-92%');
DELETE FROM applications WHERE retailer_display_id LIKE 'PTG-APP-2026-92%';
DELETE FROM station_units WHERE id IN ('22222222-0000-0000-0001-000000000091','22222222-0000-0000-0001-000000000092','22222222-0000-0000-0002-000000000091','22222222-0000-0000-0003-000000000091','22222222-0000-0000-0003-000000000092','22222222-0000-0000-0005-000000000091','22222222-0000-0000-0005-000000000092');
DELETE FROM retailer_profiles WHERE id IN ('33333333-0000-0000-0000-000000000101','33333333-0000-0000-0000-000000000102','33333333-0000-0000-0000-000000000103','33333333-0000-0000-0000-000000000104','33333333-0000-0000-0000-000000000105','33333333-0000-0000-0000-000000000106','33333333-0000-0000-0000-000000000107','33333333-0000-0000-0000-000000000108','33333333-0000-0000-0000-000000000109');

-- owner_name = each business's own contact person (NOT the shared seed user),
-- so the landlord's Tenant Applications page shows a distinct applicant per shop.
INSERT INTO retailer_profiles (id, user_id, business_name, category, experience, num_stores, max_budget, concept, owner_name) VALUES
('33333333-0000-0000-0000-000000000101','57cfd38a-473d-4cd5-9d8e-61fc37f5320d','Sweet Corner Bakery','Bakery & Dessert','6 Years','4','฿35,000','Artisanal bakery and dessert counter for office crowds and students.','Ploy Chaiwat'),
('33333333-0000-0000-0000-000000000102','57cfd38a-473d-4cd5-9d8e-61fc37f5320d','Bubble Lab','Bubble Tea & Drinks','3 Years','8','฿25,000','Trendy bubble-tea and fruit-tea bar popular with students.','Tarn Rattana'),
('33333333-0000-0000-0000-000000000103','57cfd38a-473d-4cd5-9d8e-61fc37f5320d','Tokyo Pantry','Premium Grocery','10 Years','5','฿45,000','Japanese premium grocery and ready-meal market for urban residents.','Yuki Mori'),
('33333333-0000-0000-0000-000000000104','57cfd38a-473d-4cd5-9d8e-61fc37f5320d','Campus Eats','Quick-Service Food','4 Years','6','฿22,000','Fast, affordable rice bowls and street-food favourites for students.','Krit Anan'),
('33333333-0000-0000-0000-000000000105','57cfd38a-473d-4cd5-9d8e-61fc37f5320d','Daily Fresh Mart','Convenience','7 Years','12','฿20,000','Neighbourhood convenience store with fresh daily essentials.','Somsak Phromma'),
('33333333-0000-0000-0000-000000000106','57cfd38a-473d-4cd5-9d8e-61fc37f5320d','FitFuel Kitchen','Health Food','5 Years','3','฿28,000','Healthy meal-prep and protein bowls for active suburban families.','Napat Charoenkul'),
('33333333-0000-0000-0000-000000000107','57cfd38a-473d-4cd5-9d8e-61fc37f5320d','GreenLeaf Pharmacy','Pharmacy & Wellness','9 Years','7','฿30,000','Community pharmacy with wellness and OTC essentials.','Anchana Phothong'),
('33333333-0000-0000-0000-000000000108','57cfd38a-473d-4cd5-9d8e-61fc37f5320d','Bangkok Bites','Quick-Service Food','6 Years','9','฿30,000','Grab-and-go Thai street eats for transit commuters.','Wit Saetang'),
('33333333-0000-0000-0000-000000000109','57cfd38a-473d-4cd5-9d8e-61fc37f5320d','Bloom & Co','Gifts & Florist','4 Years','2','฿22,000','Fresh flowers and gift hampers for commuters and gifting occasions.','Fah Boonmee');

INSERT INTO station_units (id, station_id, unit_code, unit_label, area_sqm, price_thb, lease_type, available) VALUES
('22222222-0000-0000-0001-000000000091','11111111-0000-0000-0000-000000000001','R-01','Corner Retail',30,33000,'Standard',false),
('22222222-0000-0000-0001-000000000092','11111111-0000-0000-0000-000000000001','R-02','Inline Retail',22,24000,'Standard',false),
('22222222-0000-0000-0002-000000000091','11111111-0000-0000-0000-000000000002','R-01','Flagship Retail',35,40000,'Standard',false),
('22222222-0000-0000-0003-000000000091','11111111-0000-0000-0000-000000000003','R-01','Inline Retail',22,20000,'Standard',false),
('22222222-0000-0000-0003-000000000092','11111111-0000-0000-0000-000000000003','R-02','Kiosk',16,15000,'Kiosk',false),
('22222222-0000-0000-0005-000000000091','11111111-0000-0000-0000-000000000005','R-01','Corner Retail',28,30000,'Standard',false),
('22222222-0000-0000-0005-000000000092','11111111-0000-0000-0000-000000000005','R-02','Inline Retail',20,22000,'Standard',false);

INSERT INTO applications (retailer_display_id, landlord_display_id, retailer_profile_id, station_unit_id, status, ai_score, est_revenue_thb, applied_date) VALUES
('PTG-APP-2026-9201','LAND-APP-2026-9201','33333333-0000-0000-0000-000000000101','22222222-0000-0000-0001-000000000091','approved','88',260000,'2026-01-15'),
('PTG-APP-2026-9202','LAND-APP-2026-9202','33333333-0000-0000-0000-000000000102','22222222-0000-0000-0001-000000000092','approved','84',180000,'2026-02-02'),
('PTG-APP-2026-9203','LAND-APP-2026-9203','33333333-0000-0000-0000-000000000103','22222222-0000-0000-0002-000000000091','approved','90',420000,'2026-01-20'),
('PTG-APP-2026-9204','LAND-APP-2026-9204','33333333-0000-0000-0000-000000000104','22222222-0000-0000-0003-000000000091','approved','82',150000,'2026-02-10'),
('PTG-APP-2026-9205','LAND-APP-2026-9205','33333333-0000-0000-0000-000000000105','22222222-0000-0000-0003-000000000092','approved','80',120000,'2026-03-08'),
('PTG-APP-2026-9206','LAND-APP-2026-9206','33333333-0000-0000-0000-000000000106','22222222-0000-0000-0004-000000000004','approved','83',140000,'2026-02-18'),
('PTG-APP-2026-9207','LAND-APP-2026-9207','33333333-0000-0000-0000-000000000107','22222222-0000-0000-0004-000000000005','approved','86',230000,'2026-01-28'),
('PTG-APP-2026-9208','LAND-APP-2026-9208','33333333-0000-0000-0000-000000000108','22222222-0000-0000-0005-000000000091','approved','85',200000,'2026-02-22'),
('PTG-APP-2026-9209','LAND-APP-2026-9209','33333333-0000-0000-0000-000000000109','22222222-0000-0000-0005-000000000092','approved','79',130000,'2026-03-12');

UPDATE station_units SET available=false WHERE id IN ('22222222-0000-0000-0004-000000000004','22222222-0000-0000-0004-000000000005');

INSERT INTO tenant_leases (application_id, start_date, end_date, monthly_rent, lease_type, duration, signed_at)
SELECT a.id, '2026-04-01'::date, '2027-03-31'::date, su.price_thb, 'Standard Retail', '12 months', now()
FROM applications a JOIN station_units su ON su.id=a.station_unit_id WHERE a.retailer_display_id LIKE 'PTG-APP-2026-92%';
