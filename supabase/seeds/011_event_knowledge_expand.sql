-- 011_event_knowledge_expand.sql
-- Closes the Event Knowledge gap: STN-002 & STN-003 (retailer stores) and
-- STN-004 & STN-005 (landlord-only stations) had ZERO store_events rows, so the
-- chatbot could not explain WHY their numbers moved. This adds >=2 events each,
-- with lifts directionally matched to each store TYPE and LOCATION so the same
-- festival reads differently per branch:
--   * Deep in-city stores (Sukhumvit Premium Market) LOSE traffic at Songkran —
--     regulars leave town — but GAIN at month-end payday (grocery restock).
--   * A Wellness Pharmacy (Rama 9) is counter-cyclical: rainy season LIFTS it
--     (cold/flu, vitamins) while it dips at Songkran like other city stores.
--   * Highway / suburban destination stations (Main Station, Bang Na) GAIN at
--     Songkran as travel corridors, mirroring the portfolio-wide Songkran lift.
-- Events are anchored to months with visible performance data (2026-04 / 2026-05)
-- so the AI can tie a cause to a number it can see.
--
-- Idempotent + non-destructive: deletes ONLY the four store ids this file owns,
-- never the portfolio-wide (NULL) rows or STN-001 / STN-018 owned by 006/007.

BEGIN;

DELETE FROM public.store_events
WHERE store_display_id IN ('STN-002', 'STN-003', 'STN-004', 'STN-005');

INSERT INTO public.store_events
  (store_display_id, year_month, event_name, event_type, description, est_traffic_lift_pct, est_sales_lift_pct)
VALUES
  -- ── STN-002 · Sukhumvit 62 · Premium Market (deep in-city) ────────────────
  ('STN-002', '2026-04', 'Songkran City Exodus',        'festival', 'Songkran (Apr 13-15) pulls Sukhumvit''s in-city regulars upcountry to their hometowns, so this deep-city market loses its core weekday shoppers and footfall dips.', -4.5, -4.0),
  ('STN-002', '2026-05', 'Month-End Payday Restock',    'payday',   'Late-May salary disbursement drives the monthly grocery and fresh-produce restock at Sukhumvit, lifting basket sizes more than headcount.', 2.5, 3.5),
  ('STN-002', '2026-05', 'Early Rainy-Season Dip',      'seasonal', 'Early monsoon downpours cut walk-in trips to the fresh market on wet evenings and shorten dwell time.', -1.5, -1.0),

  -- ── STN-003 · Rama 9 · Wellness Pharmacy (counter-cyclical) ───────────────
  ('STN-003', '2026-04', 'Songkran Quiet Period',       'festival', 'With Rama 9 office workers travelling home for Songkran, routine pharmacy and wellness visits drop during the long holiday.', -3.0, -2.5),
  ('STN-003', '2026-05', 'Rainy-Season Health Demand',  'seasonal', 'Monsoon onset raises cold, flu, allergy and vitamin demand — a pharmacy runs counter-cyclical to cafes and markets and gains traffic when the rains start.', 3.5, 4.5),
  ('STN-003', '2026-06', 'Mid-Year Wellness Push',      'promotion','Mid-year health-and-wellness promotions (supplements, preventive care) lift average basket at the Rama 9 pharmacy.', 2.0, 3.0),

  -- ── STN-004 · Bang Na Complex · suburban destination (landlord-only) ──────
  ('STN-004', '2026-04', 'Songkran Outbound Corridor',  'festival', 'Bang Na sits on the eastern outbound route — Songkran travellers heading to Pattaya and the East stop to refuel and stock up, lifting traffic and spend.', 4.5, 4.0),
  ('STN-004', '2026-05', 'Month-End Payday Surge',      'payday',   'End-of-May payday lifts mid-week convenience and grocery purchases across the Bang Na complex tenants.', 2.0, 2.5),

  -- ── STN-005 · Main Station · highway hub (landlord-only) ──────────────────
  ('STN-005', '2026-04', 'Songkran Travel Peak',        'festival', 'As the portfolio''s busiest highway hub, Main Station sees the strongest Songkran travel surge — peak refuelling, food and convenience demand over the holiday.', 5.5, 5.0),
  ('STN-005', '2026-05', 'Early Rainy-Season Slowdown', 'seasonal', 'Early monsoon rain reduces long-distance leisure trips on the highway, softening through-traffic at Main Station mid-month.', -2.0, -1.5);

COMMIT;
