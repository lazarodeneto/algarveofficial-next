-- =============================================
-- FIX CRITICAL RLS SECURITY ISSUES
-- =============================================

-- 1. EMAIL_SUBSCRIBERS: Add admin-only SELECT policy
-- Currently missing SELECT policy exposes all subscriber emails
CREATE POLICY "Admins can view subscribers"
ON public.email_subscribers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. ANALYTICS_EVENTS: Fix INSERT policies to prevent user_id spoofing
-- Drop the vulnerable policies
DROP POLICY IF EXISTS "Authenticated users can log events" ON public.analytics_events;
DROP POLICY IF EXISTS "Unauthenticated users can log limited events" ON public.analytics_events;

-- Create secure INSERT policy: user_id must be null OR match the authenticated user
CREATE POLICY "Users can log their own events"
ON public.analytics_events
FOR INSERT
WITH CHECK (
  user_id IS NULL 
  OR user_id = auth.uid()
);

-- 3. BLOG_COMMENTS: Users should see their own unapproved comments
-- This allows users to see comments they submitted that are pending approval
CREATE POLICY "Users can view their own pending comments"
ON public.blog_comments
FOR SELECT
USING (
  (is_approved = false) 
  AND (user_id = auth.uid())
);;
