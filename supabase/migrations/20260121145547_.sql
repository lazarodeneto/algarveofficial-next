-- Fix: Remove direct access to raw analytics events for listing owners
-- This prevents exposure of visitor IP addresses, user agents, session IDs, and referrers
-- Owners should use the analytics_daily table for aggregated, privacy-safe analytics

DROP POLICY IF EXISTS "Owners can view their listing analytics" ON public.analytics_events;;
