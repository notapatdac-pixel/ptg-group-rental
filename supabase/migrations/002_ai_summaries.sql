-- AI summary cache: one row per (cache_key, cache_date)
-- cache_key = "role::userId::pageContext::stationFilter::storeFilter"
-- cache_date = YYYY-MM-DD in Bangkok timezone
CREATE TABLE IF NOT EXISTS public.ai_summaries (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key  TEXT        NOT NULL,
  cache_date DATE        NOT NULL,
  summary    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cache_key, cache_date)
);

ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;

-- Block all direct client access; only service role key may read/write
CREATE POLICY "ai_summaries_deny_direct" ON public.ai_summaries
  USING (false);
