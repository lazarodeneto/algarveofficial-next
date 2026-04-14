-- Seed all 14 categories from the template system
INSERT INTO categories (name, slug, icon, short_description, description, display_order, is_active, is_featured) VALUES
('Luxury Accommodation', 'luxury-accommodation', 'Building2', 'Premium villas, hotels & resorts', 'Experience the finest luxury accommodations across the Algarve region', 1, true, true),
('Fine Dining & Michelin', 'fine-dining', 'UtensilsCrossed', 'World-class restaurants & gastronomy', 'Discover Michelin-starred restaurants and exceptional culinary experiences', 2, true, true),
('Golf & Tournaments', 'golf', 'Flag', 'Championship courses & events', 'Play on world-renowned golf courses in stunning Algarve settings', 3, true, true),
('Beaches & Beach Clubs', 'beaches-clubs', 'Waves', 'Pristine beaches & exclusive clubs', 'Explore stunning beaches and exclusive beach club experiences', 4, true, true),
('Wellness & Spas', 'wellness-spas', 'Sparkles', 'Luxury spas & wellness retreats', 'Rejuvenate at world-class spas and wellness centers', 5, true, true),
('Private Dining', 'private-chefs', 'ChefHat', 'Personal chefs & bespoke dining', 'Enjoy personalized culinary experiences with private chefs', 6, true, false),
('Concierge Services', 'vip-concierge', 'Concierge', 'VIP assistance & lifestyle management', 'Access exclusive concierge services for seamless luxury experiences', 7, true, true),
('Luxury Experiences', 'luxury-experiences', 'Gem', 'Unique adventures & activities', 'Discover extraordinary experiences and bespoke adventures', 8, true, true),
('Family Attractions', 'family-fun', 'Users', 'Family-friendly activities & venues', 'Find the best family-friendly attractions and activities', 9, true, false),
('VIP Transportation', 'vip-transportation', 'Plane', 'Private jets, yachts & transfers', 'Travel in style with luxury transportation services', 10, true, true),
('Prime Real Estate', 'real-estate', 'Home', 'Luxury properties & investments', 'Explore premium real estate opportunities in the Algarve', 11, true, true),
('Premier Events', 'premier-events', 'Calendar', 'Exclusive events & celebrations', 'Discover and attend exclusive events and celebrations', 12, true, false),
('Architecture & Decoration', 'architecture-decoration', 'Paintbrush', 'Interior design & architecture', 'Connect with top architects and interior designers', 13, true, false),
('Protection Services', 'protection-services', 'Shield', 'Security & personal protection', 'Access professional security and protection services', 14, true, false),
('Shopping & Boutiques', 'shopping-boutiques', 'ShoppingBag', 'Luxury shopping & designer boutiques', 'Discover exclusive boutiques and luxury shopping destinations', 15, true, false)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;
