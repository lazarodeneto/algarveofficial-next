-- Disable maintenance mode
UPDATE site_settings 
SET maintenance_mode = false, updated_at = now()
WHERE id = 'default';
