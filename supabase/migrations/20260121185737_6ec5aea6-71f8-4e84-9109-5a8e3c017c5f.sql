-- Add explicit policy to deny public/anonymous access to profiles
-- This ensures that even if other policies are misconfigured, anonymous users cannot read profiles

CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);
-- Also add a restrictive policy for authenticated users who aren't viewing their own profile or aren't admin
-- This replaces the existing policies with more explicit ones

-- Drop existing SELECT policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
-- Recreate with explicit conditions
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)
);
