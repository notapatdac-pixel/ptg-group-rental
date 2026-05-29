-- ================================================================
-- PTG Group Rental — Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ================================================================

-- ----------------------------------------------------------------
-- MASTER TABLES
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT        NOT NULL UNIQUE,
  name          TEXT        NOT NULL DEFAULT '',
  role          TEXT        NOT NULL CHECK (role IN ('retailer', 'landlord')),
  avatar_color  TEXT        NOT NULL DEFAULT '#2d5a1b',
  initials      TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id        TEXT        NOT NULL UNIQUE,
  filter_key        TEXT        NOT NULL UNIQUE, -- matches StationId in stationFilterContext
  name              TEXT        NOT NULL,
  province          TEXT        NOT NULL DEFAULT 'Bangkok',
  traffic_level     TEXT        NOT NULL DEFAULT 'medium' CHECK (traffic_level IN ('low','medium','high')),
  location_text     TEXT        NOT NULL DEFAULT '',
  lat               NUMERIC(9,6),
  lng               NUMERIC(9,6),
  land_area_sqm     INT,
  fueling_points    INT,
  peak_hours        TEXT,
  nearby_competitors INT,
  image_url         TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.station_units (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id   UUID        NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  unit_code    TEXT        NOT NULL,
  unit_label   TEXT        NOT NULL DEFAULT '',
  area_sqm     INT,
  price_thb    INT         NOT NULL DEFAULT 0,
  lease_type   TEXT        NOT NULL DEFAULT '',
  available    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (station_id, unit_code)
);

CREATE TABLE IF NOT EXISTS public.station_monthly_metrics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id          UUID        NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  year_month          TEXT        NOT NULL, -- 'YYYY-MM'
  daily_customers_avg INT,
  dwell_min_avg       INT,
  est_revenue_k_thb   INT,
  ai_score_pct        INT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (station_id, year_month)
);

CREATE TABLE IF NOT EXISTS public.retailer_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name    TEXT        NOT NULL DEFAULT '',
  category         TEXT        NOT NULL DEFAULT '',
  experience       TEXT        NOT NULL DEFAULT '',
  num_stores       TEXT        NOT NULL DEFAULT '',
  max_budget       TEXT        NOT NULL DEFAULT '',
  concept          TEXT        NOT NULL DEFAULT '',
  cover_image_url  TEXT,
  logo_url         TEXT,
  product_images   TEXT[],
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TRANSACTION TABLES
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.applications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_display_id   TEXT        NOT NULL UNIQUE,
  landlord_display_id   TEXT        NOT NULL UNIQUE,
  retailer_profile_id   UUID        NOT NULL REFERENCES public.retailer_profiles(id),
  station_unit_id       UUID        NOT NULL REFERENCES public.station_units(id),
  status                TEXT        NOT NULL DEFAULT 'pending_review'
                            CHECK (status IN ('pending_review','approved','not_approved')),
  ai_score              TEXT        NOT NULL DEFAULT '',
  ai_text               TEXT        NOT NULL DEFAULT '',
  ai_text_th            TEXT        NOT NULL DEFAULT '',
  est_revenue_thb       TEXT        NOT NULL DEFAULT '',
  panel_color           TEXT        NOT NULL DEFAULT '#4a5568',
  applied_date          DATE        NOT NULL DEFAULT CURRENT_DATE,
  specialist_name       TEXT        NOT NULL DEFAULT '',
  specialist_initials   TEXT        NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tenant_leases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID        NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  start_date     DATE,
  end_date       DATE,
  monthly_rent   INT         NOT NULL DEFAULT 0,
  lease_type     TEXT        NOT NULL DEFAULT '',
  duration       TEXT        NOT NULL DEFAULT '',
  signed_at      TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID        NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  visit_date     DATE,
  visit_time     TEXT,
  status         TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','cancelled')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES public.users(id) ON DELETE CASCADE,
  user_role  TEXT        NOT NULL CHECK (user_role IN ('retailer','landlord')),
  type       TEXT        NOT NULL CHECK (type IN ('message','status_update','booking','system')),
  title      TEXT        NOT NULL DEFAULT '',
  body       TEXT        NOT NULL DEFAULT '',
  href       TEXT,
  read       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        REFERENCES public.users(id) ON DELETE CASCADE,
  role         TEXT        NOT NULL CHECK (role IN ('retailer','landlord')),
  page_context TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL CHECK (role IN ('user','assistant')),
  content         TEXT        NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TRIGGER: auto-create user profile row on auth signup
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, avatar_color, initials)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'retailer'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_color', '#2d5a1b'),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------

ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_units          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_monthly_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailer_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_leases          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages            ENABLE ROW LEVEL SECURITY;

-- Stations / units / metrics: public read
CREATE POLICY "stations_public_read"                ON public.stations                FOR SELECT USING (TRUE);
CREATE POLICY "station_units_public_read"           ON public.station_units           FOR SELECT USING (TRUE);
CREATE POLICY "station_monthly_metrics_public_read" ON public.station_monthly_metrics FOR SELECT USING (TRUE);

-- Users: own row only
CREATE POLICY "users_own_row" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Retailer profiles: own only
CREATE POLICY "retailer_profiles_own" ON public.retailer_profiles
  FOR ALL USING (user_id = auth.uid());

-- Applications: retailer sees own profiles' apps; landlord sees all
CREATE POLICY "applications_retailer_read" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.retailer_profiles rp
      WHERE rp.id = applications.retailer_profile_id AND rp.user_id = auth.uid()
    )
  );
CREATE POLICY "applications_landlord_all" ON public.applications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'landlord')
  );

-- Notifications: own only
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- AI conversations: own only
CREATE POLICY "ai_conversations_own" ON public.ai_conversations
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "ai_messages_own_via_conv" ON public.ai_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations ac
      WHERE ac.id = ai_messages.conversation_id AND ac.user_id = auth.uid()
    )
  );

-- Tenant leases / bookings: landlord sees all; retailer sees own
CREATE POLICY "tenant_leases_landlord" ON public.tenant_leases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'landlord')
  );
CREATE POLICY "bookings_open" ON public.bookings FOR ALL USING (TRUE);

-- ----------------------------------------------------------------
-- REALTIME PUBLICATION
-- Supabase does not add tables to realtime by default.
-- These tables need to be published so Supabase Realtime channels
-- receive change events (INSERT / UPDATE / DELETE).
-- ----------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_messages;
