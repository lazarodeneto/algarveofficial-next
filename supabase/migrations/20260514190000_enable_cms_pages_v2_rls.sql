-- Re-assert RLS for cms_pages_v2 after Supabase advisor detected policies
-- on the table while row level security was disabled in the live database.
--
-- Existing policies are intentionally preserved:
-- - cms_pages_v2_public_read limits public reads to published pages.
-- - cms_pages_v2_admin_all limits authenticated writes to admins/editors.

ALTER TABLE public.cms_pages_v2 ENABLE ROW LEVEL SECURITY;
