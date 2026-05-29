-- 006_store_events.sql
-- Event knowledge: festivals/holidays/promotions that explain traffic & sales
-- movements so the AI can cite a *cause* for spikes (Songkran, CNY, year-end…).
-- Deny-direct RLS: read/written only through the service-role API (matches the
-- project's locked-down analytics tables).

CREATE TABLE IF NOT EXISTS public.store_events (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_display_id     text,                 -- NULL = portfolio-wide (all stores)
  year_month           text NOT NULL,        -- 'YYYY-MM'
  event_name           text NOT NULL,
  event_type           text NOT NULL,        -- festival | holiday | promotion | payday | weather | seasonal
  description          text,
  est_traffic_lift_pct numeric,
  est_sales_lift_pct   numeric,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_events_lookup_idx
  ON public.store_events (year_month, store_display_id);

ALTER TABLE public.store_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS store_events_deny_direct ON public.store_events;
CREATE POLICY store_events_deny_direct ON public.store_events
  FOR ALL USING (false) WITH CHECK (false);
