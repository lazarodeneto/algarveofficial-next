-- Restrict admin outbox observability views from anon/public roles.

REVOKE ALL ON TABLE public.admin_external_outbox_by_operation FROM PUBLIC;
REVOKE ALL ON TABLE public.admin_external_outbox_by_operation FROM anon;
REVOKE ALL ON TABLE public.admin_external_outbox_health FROM PUBLIC;
REVOKE ALL ON TABLE public.admin_external_outbox_health FROM anon;
GRANT SELECT ON TABLE public.admin_external_outbox_by_operation TO authenticated;
GRANT SELECT ON TABLE public.admin_external_outbox_health TO authenticated;
