-- Set translation key for Events menu item
UPDATE header_menu_items 
SET translation_key = 'nav.events' 
WHERE href = 'events' OR name = 'Events';;
