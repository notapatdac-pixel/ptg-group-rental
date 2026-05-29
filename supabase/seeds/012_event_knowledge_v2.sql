-- 012_event_knowledge_v2.sql
-- Replaces all Event Knowledge with store-TYPE-appropriate, recent-month rows.
-- Coffee shops (STN-001 Artisan Cafe, STN-018 Grab & Go) get coffee-relevant
-- events — NOT retail "School-Term Restock"/"Mid-Year Sale". Only Apr/May (past/
-- current) months so a summary never explains the past with a future event.
-- Supersedes seeds 006/007/011 event rows.

DELETE FROM store_events;

INSERT INTO store_events (store_display_id, year_month, event_name, event_type, description, est_traffic_lift_pct, est_sales_lift_pct) VALUES
  (NULL,      '2026-05', 'Coronation Day & Visakha Bucha', 'holiday',  'Public holidays bring a small, broad lift across all PTG stores.', 1.5, 1.5),
  ('STN-001', '2026-04', 'Songkran — Office Crowd Away',   'festival', 'Office workers travel upcountry for Songkran, so this in-city cafe sees fewer weekday regulars.', -2.5, -2.0),
  ('STN-001', '2026-05', 'Rainy-Season Hot-Drink Uplift',  'seasonal', 'Wet weather pushes customers toward hot coffee and longer sit-in visits.', 1.0, 2.0),
  ('STN-002', '2026-04', 'Songkran Pre-Travel Stock-Up',   'festival', 'Shoppers stock snacks and essentials before holiday travel.', 3.0, 3.5),
  ('STN-002', '2026-05', 'Month-End Payday Restock',       'payday',   'Salary disbursement lifts grocery and premium-item baskets.', 2.5, 3.5),
  ('STN-003', '2026-04', 'Songkran Quiet Period',          'festival', 'Fewer walk-ins as residents leave town for the holiday.', -2.0, -1.5),
  ('STN-003', '2026-05', 'Rainy-Season Health Demand',     'seasonal', 'Cold, flu and vitamin demand rises with the wet season.', 3.5, 4.5),
  ('STN-018', '2026-04', 'Songkran Travel Corridor',       'festival', 'Nonthaburi sits on an upcountry travel route — grab-and-go coffee spikes.', 4.0, 3.0),
  ('STN-018', '2026-05', 'Month-End Payday Treats',        'payday',   'Payday nudges commuters toward a daily coffee treat.', 2.0, 2.0),
  ('STN-004', '2026-04', 'Songkran Outbound Corridor',     'festival', 'Highway-side traffic surges with Songkran travel.', 4.5, 4.0),
  ('STN-004', '2026-05', 'Month-End Payday Surge',         'payday',   'Late-month salary boosts mid-week purchases.', 2.0, 2.5),
  ('STN-005', '2026-04', 'Songkran Travel Peak',           'festival', 'Major travel hub peaks during Songkran.', 5.5, 5.0),
  ('STN-005', '2026-05', 'Early Rainy-Season Slowdown',    'seasonal', 'Onset of the rainy season softens footfall.', -2.0, -1.5);
