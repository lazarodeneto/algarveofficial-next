-- Item 2: Activate all regions
UPDATE regions SET is_active = true WHERE is_active = false;

-- Item 3: Fix profiles RLS policy - users should only see their own profile
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can only view their own profile" ON profiles;

-- Create a properly restrictive policy
CREATE POLICY "Users can only view their own profile"
ON profiles
FOR SELECT
USING (id = auth.uid());

-- Admins have their own policy already, but let's ensure it exists for viewing all
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));;
