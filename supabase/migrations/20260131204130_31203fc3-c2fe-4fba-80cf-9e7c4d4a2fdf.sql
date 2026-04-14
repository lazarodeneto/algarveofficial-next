-- Deactivate the Destinations menu item
UPDATE header_menu_items
SET is_active = false
WHERE id = '729a0985-4a0d-4eac-9376-5d80ac76c8a5';
