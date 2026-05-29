-- 010_landlord_fill.sql
-- Spreads tenants across ALL landlord stations so every station filter shows
-- applications + active leases. Lumina Retail Group (the demo retailer account)
-- holds approved leases at its 4 stores; other applicants populate the rest.
-- Also restores the 3 decision-demo apps (9001/9002/9003) to pending_review.
-- Idempotent + additive (does not touch the 9001-9003 rows except status).

UPDATE applications SET status='pending_review'
 WHERE retailer_display_id IN ('PTG-APP-2026-9001','PTG-APP-2026-9002','PTG-APP-2026-9003');

DELETE FROM tenant_leases WHERE application_id IN
  (SELECT id FROM applications WHERE retailer_display_id LIKE 'PTG-APP-2026-91__');
DELETE FROM applications WHERE retailer_display_id LIKE 'PTG-APP-2026-91__';

INSERT INTO applications (retailer_display_id, landlord_display_id, retailer_profile_id, station_unit_id, status, ai_score, est_revenue_thb, applied_date) VALUES
  ('PTG-APP-2026-9101','LAND-APP-2026-9101','55555555-0000-0000-0000-000000000001','22222222-0000-0000-0001-000000000007','approved',94,330000,'2026-02-10'),
  ('PTG-APP-2026-9102','LAND-APP-2026-9102','55555555-0000-0000-0000-000000000001','22222222-0000-0000-0002-000000000008','approved',90,396000,'2026-02-12'),
  ('PTG-APP-2026-9103','LAND-APP-2026-9103','55555555-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000010','approved',82,215000,'2026-03-01'),
  ('PTG-APP-2026-9104','LAND-APP-2026-9104','33333333-0000-0000-0000-000000000002','22222222-0000-0000-0004-000000000002','approved',88,210000,'2026-03-05'),
  ('PTG-APP-2026-9105','LAND-APP-2026-9105','33333333-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000043','pending_review',79,150000,'2026-05-20'),
  ('PTG-APP-2026-9106','LAND-APP-2026-9106','33333333-0000-0000-0000-000000000003','22222222-0000-0000-0005-000000000005','approved',85,180000,'2026-03-18'),
  ('PTG-APP-2026-9107','LAND-APP-2026-9107','33333333-0000-0000-0000-000000000002','22222222-0000-0000-0005-000000000006','pending_review',73,165000,'2026-05-22'),
  ('PTG-APP-2026-9108','LAND-APP-2026-9108','33333333-0000-0000-0000-000000000001','22222222-0000-0000-0002-000000000003','approved',91,290000,'2026-02-20'),
  ('PTG-APP-2026-9109','LAND-APP-2026-9109','33333333-0000-0000-0000-000000000003','22222222-0000-0000-0003-000000000006','pending_review',77,120000,'2026-05-25');

UPDATE station_units SET available=false
 WHERE id IN ('22222222-0000-0000-0001-000000000007','22222222-0000-0000-0000-000000000010','22222222-0000-0000-0005-000000000005');

INSERT INTO tenant_leases (application_id, start_date, end_date, monthly_rent, lease_type, duration, signed_at)
SELECT a.id, '2026-05-01', '2027-04-30', su.price_thb, 'Standard Retail', '12 months', now()
FROM applications a JOIN station_units su ON su.id=a.station_unit_id
WHERE a.retailer_display_id IN ('PTG-APP-2026-9101','PTG-APP-2026-9102','PTG-APP-2026-9103','PTG-APP-2026-9104','PTG-APP-2026-9106','PTG-APP-2026-9108','PTG-APP-2026-8080')
AND NOT EXISTS (SELECT 1 FROM tenant_leases tl WHERE tl.application_id=a.id);
