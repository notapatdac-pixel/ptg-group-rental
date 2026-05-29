-- 008_decision_demo_applications.sql
-- Three PENDING applications crafted so the Symbolic AI decision engine
-- (agent/rules) produces three DIFFERENT, traceable outcomes for the demo:
--   9001 Artisan Brew  → Lat Phrao D-02 (available, score 92, rent in-band) → APPROVE
--   9002 Tanaka        → Nonthaburi B-02 (available, score 76 moderate, rent +35% over band) → REVIEW
--   9003 PharmaPlus    → Lat Phrao A-01 (UNAVAILABLE, score 90 high) → DECLINE
--       (rules override a strong predictive score — the decision-quality case)
-- ai_score is the Predictive-AI input consumed by /api/landlord/evaluate-application.

DELETE FROM applications
 WHERE retailer_display_id IN ('PTG-APP-2026-9001','PTG-APP-2026-9002','PTG-APP-2026-9003');

INSERT INTO applications
  (retailer_display_id, landlord_display_id, retailer_profile_id, station_unit_id, status, ai_score, est_revenue_thb, applied_date)
VALUES
  ('PTG-APP-2026-9001','LAND-APP-2026-9001','33333333-0000-0000-0000-000000000001','22222222-0000-0000-0001-000000000008','pending_review',92,330000,'2026-05-28'),
  ('PTG-APP-2026-9002','LAND-APP-2026-9002','33333333-0000-0000-0000-000000000002','22222222-0000-0000-0018-000000000004','pending_review',76,150000,'2026-05-28'),
  ('PTG-APP-2026-9003','LAND-APP-2026-9003','33333333-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000101','pending_review',90,300000,'2026-05-28');
