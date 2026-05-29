-- 006_store_events_seed.sql
-- Events anchored to the real monthly revenue/traffic movements in
-- store_monthly_pnl / store_monthly_performance (Apr Songkran traffic+spend,
-- Feb CNY/Valentine's revenue, Dec/Jan year-end & New Year).
-- Idempotent: clears the table before reseeding.

DELETE FROM public.store_events;

INSERT INTO public.store_events
  (store_display_id, year_month, event_name, event_type, description, est_traffic_lift_pct, est_sales_lift_pct)
VALUES
  (NULL,      '2025-12', 'Year-End & New Year Shopping',    'holiday',  'Festive season drives gifting, travel and convenience purchases across PTG stations.', 4.0, 3.5),
  (NULL,      '2026-01', 'New Year Holiday Travel',         'holiday',  'Post-New-Year travel and returns lift highway petrol-station footfall.', 2.5, 4.0),
  ('STN-001', '2026-02', 'Chinese New Year & Valentine''s', 'festival', 'CNY (Feb 17) and Valentine''s Day lift premium F&B and gifting at Lat Phrao 71.', 3.0, 6.0),
  ('STN-018', '2026-03', 'Month-End Payday Surge',          'payday',   'Late-month salary disbursement raises mid-week purchases at Nonthaburi.', 2.0, 2.0),
  (NULL,      '2026-04', 'Songkran Festival',               'festival', 'Songkran (Apr 13-15) travel surge sharply raises highway petrol-station traffic and spend.', 5.0, 4.0),
  ('STN-018', '2026-04', 'Songkran Travel Corridor',        'festival', 'Nonthaburi sits on a Songkran upcountry travel route — visitor numbers spike.', 4.0, 3.0);
