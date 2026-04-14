-- Clear existing rate limit entries for import_listings to allow continued testing
DELETE FROM public.admin_rate_limits 
WHERE operation_type = 'import_listings';
-- Optional: You can also increase the limit by modifying how the edge function calls check_admin_rate_limit
-- The current limit is 3 per hour - this just clears existing entries;
