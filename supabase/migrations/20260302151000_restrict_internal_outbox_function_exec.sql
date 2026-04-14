-- Restrict internal outbox/alert functions to service role only.
-- Prevents direct invocation from regular authenticated/anon API clients.

REVOKE ALL ON FUNCTION public.claim_external_outbox_jobs(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_external_outbox_jobs(INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.claim_external_outbox_jobs(INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_external_outbox_jobs(INTEGER) TO service_role;
REVOKE ALL ON FUNCTION public.trigger_process_outbox() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.trigger_process_outbox() FROM anon;
REVOKE ALL ON FUNCTION public.trigger_process_outbox() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_process_outbox() TO service_role;
REVOKE ALL ON FUNCTION public.raise_system_alert(TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.raise_system_alert(TEXT, TEXT, TEXT, TEXT, JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.raise_system_alert(TEXT, TEXT, TEXT, TEXT, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.raise_system_alert(TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
REVOKE ALL ON FUNCTION public.resolve_system_alert(TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_system_alert(TEXT, TEXT, JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.resolve_system_alert(TEXT, TEXT, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_system_alert(TEXT, TEXT, JSONB) TO service_role;
REVOKE ALL ON FUNCTION public.check_external_outbox_health() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_external_outbox_health() FROM anon;
REVOKE ALL ON FUNCTION public.check_external_outbox_health() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_external_outbox_health() TO service_role;
