
-- Sessions: one row per visitor quiz session
CREATE TABLE public.oryn_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_key TEXT NOT NULL UNIQUE,
  completed BOOLEAN NOT NULL DEFAULT false,
  last_completed_step INTEGER NOT NULL DEFAULT 0,
  user_name TEXT,
  bmi NUMERIC,
  protein_need NUMERIC,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  matched_ideal_brand TEXT,
  matched_budget_brand TEXT,
  survey_current_brand TEXT,
  survey_frustration TEXT,
  survey_sachet_interest TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.oryn_sessions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.oryn_sessions TO authenticated;
GRANT ALL ON public.oryn_sessions TO service_role;
ALTER TABLE public.oryn_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon can insert sessions" ON public.oryn_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon can update own session by key" ON public.oryn_sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon can read sessions" ON public.oryn_sessions FOR SELECT TO anon USING (true);

-- Waitlist
CREATE TABLE public.oryn_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.oryn_sessions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  matched_ideal_brand TEXT,
  matched_budget_brand TEXT,
  bmi NUMERIC,
  protein_need NUMERIC,
  survey_current_brand TEXT,
  survey_frustration TEXT,
  survey_sachet_interest TEXT,
  responses JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.oryn_waitlist TO anon;
GRANT SELECT, INSERT ON public.oryn_waitlist TO authenticated;
GRANT ALL ON public.oryn_waitlist TO service_role;
ALTER TABLE public.oryn_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon insert waitlist" ON public.oryn_waitlist FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon read waitlist" ON public.oryn_waitlist FOR SELECT TO anon USING (true);

-- Visits (page views) for funnel
CREATE TABLE public.oryn_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_key TEXT NOT NULL UNIQUE,
  path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.oryn_visits TO anon;
GRANT SELECT, INSERT ON public.oryn_visits TO authenticated;
GRANT ALL ON public.oryn_visits TO service_role;
ALTER TABLE public.oryn_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon insert visits" ON public.oryn_visits FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon read visits" ON public.oryn_visits FOR SELECT TO anon USING (true);
