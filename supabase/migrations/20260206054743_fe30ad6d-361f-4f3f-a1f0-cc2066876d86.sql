-- Fix security_audit_log RLS policies
-- Audit logs should be append-only for users, with admin-only modifications

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Users can update own audit logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Users can delete own audit logs" ON public.security_audit_log;
-- Ensure RLS is enabled
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
-- Users can VIEW their own audit logs (read-only)
CREATE POLICY "Users can view own audit logs"
ON public.security_audit_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
-- Users can INSERT (append) their own logs only
CREATE POLICY "Users can insert own audit logs"
ON public.security_audit_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
-- Only admins can UPDATE any audit log
CREATE POLICY "Admins can update audit logs"
ON public.security_audit_log FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
-- Only admins can DELETE any audit log
CREATE POLICY "Admins can delete audit logs"
ON public.security_audit_log FOR DELETE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
-- Admins can view ALL audit logs (for monitoring)
CREATE POLICY "Admins can view all audit logs"
ON public.security_audit_log FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
