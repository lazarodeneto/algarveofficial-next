-- Drop existing policies on whatsapp_accounts to recreate with proper security
DROP POLICY IF EXISTS "whatsapp_accounts_select_own" ON public.whatsapp_accounts;
DROP POLICY IF EXISTS "whatsapp_accounts_insert_own" ON public.whatsapp_accounts;
DROP POLICY IF EXISTS "whatsapp_accounts_update_own" ON public.whatsapp_accounts;
DROP POLICY IF EXISTS "whatsapp_accounts_delete_own" ON public.whatsapp_accounts;
DROP POLICY IF EXISTS "Owners can view own whatsapp" ON public.whatsapp_accounts;
DROP POLICY IF EXISTS "Admins can view all whatsapp" ON public.whatsapp_accounts;
-- Ensure RLS is enabled
ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;
-- 1. Deny anonymous access
CREATE POLICY "Deny anonymous access to whatsapp_accounts"
ON public.whatsapp_accounts FOR ALL
TO anon
USING (false);
-- 2. Owners can view their own WhatsApp accounts only
CREATE POLICY "Owners can view own whatsapp accounts"
ON public.whatsapp_accounts FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() 
  OR public.is_admin_or_editor(auth.uid())
);
-- 3. Owners can insert their own WhatsApp accounts
CREATE POLICY "Owners can insert own whatsapp accounts"
ON public.whatsapp_accounts FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid() OR public.is_admin_or_editor(auth.uid()));
-- 4. Owners can update their own WhatsApp accounts
CREATE POLICY "Owners can update own whatsapp accounts"
ON public.whatsapp_accounts FOR UPDATE
TO authenticated
USING (owner_id = auth.uid() OR public.is_admin_or_editor(auth.uid()))
WITH CHECK (owner_id = auth.uid() OR public.is_admin_or_editor(auth.uid()));
-- 5. Owners can delete their own WhatsApp accounts, admins can delete any
CREATE POLICY "Owners can delete own whatsapp accounts"
ON public.whatsapp_accounts FOR DELETE
TO authenticated
USING (owner_id = auth.uid() OR public.is_admin_or_editor(auth.uid()));
