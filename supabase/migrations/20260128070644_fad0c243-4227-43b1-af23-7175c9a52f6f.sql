-- Reset the stuck Google Ratings sync status to idle
UPDATE google_ratings_sync_status 
SET 
  status = 'idle', 
  processed_count = 0, 
  last_cursor = NULL, 
  completed_at = NULL, 
  updated_at = now() 
WHERE id = 'default';
