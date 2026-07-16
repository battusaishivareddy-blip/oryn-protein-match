
-- Drop all existing anon policies
DROP POLICY IF EXISTS "anon can insert sessions" ON public.oryn_sessions;
DROP POLICY IF EXISTS "anon can read sessions" ON public.oryn_sessions;
DROP POLICY IF EXISTS "anon can update own session by key" ON public.oryn_sessions;

DROP POLICY IF EXISTS "anon insert visits" ON public.oryn_visits;
DROP POLICY IF EXISTS "anon read visits" ON public.oryn_visits;

DROP POLICY IF EXISTS "anon insert waitlist" ON public.oryn_waitlist;
DROP POLICY IF EXISTS "anon read waitlist" ON public.oryn_waitlist;

-- Revoke anon privileges; keep service_role for server functions
REVOKE ALL ON public.oryn_sessions FROM anon;
REVOKE ALL ON public.oryn_visits FROM anon;
REVOKE ALL ON public.oryn_waitlist FROM anon;

GRANT ALL ON public.oryn_sessions TO service_role;
GRANT ALL ON public.oryn_visits TO service_role;
GRANT ALL ON public.oryn_waitlist TO service_role;

-- RLS remains enabled with no anon policies => anon has no access. service_role bypasses RLS.
