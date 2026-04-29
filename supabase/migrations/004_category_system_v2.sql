-- Category System Refactor - v2
-- Creates new category structure with pillars

-- Add pillar column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS pillar TEXT;

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delete old categories that will be replaced
DELETE FROM categories WHERE slug IN (
  'premium-accommodation', 'premium-hotels', 'premium-hotels-resorts',
  'fine-dining', 'fine-dining-algarve', 'private-chefs', 'restaurants-algarve',
  'premium-experiences', 'experiences-algarve', 'family-fun', 'things-do-do',
  'algarve-experience', 'premier-events', 'events-in-algarve', 'algarve-events',
  'golf-tournaments', 'wellness-spas', 'shopping-boutiques',
  'vip-concierge', 'algarve-concierge-services', 'prime-real-estate',
  'algarve-real-estate', 'vip-transportation', 'architecture-decoration',
  'protection-services', 'algarve-services', 'places-to-stay', 'things-to-do',
  'beaches-clubs', 'whats-on'
);

-- Insert new categories with pillars
INSERT INTO categories (name, slug, pillar, is_active, is_featured, display_order, created_at, updated_at) VALUES
-- Stay
('Accommodation', 'accommodation', 'stay', true, true, 1, NOW(), NOW()),
-- Eat
('Restaurants', 'restaurants', 'eat', true, true, 10, NOW(), NOW()),
('Beach Clubs', 'beach-clubs', 'eat', true, true, 11, NOW(), NOW()),
-- Do
('Experiences', 'experiences', 'do', true, true, 20, NOW(), NOW()),
('Golf', 'golf', 'do', true, true, 21, NOW(), NOW()),
('Events', 'events', 'do', true, true, 22, NOW(), NOW()),
('Family Attractions', 'family-attractions', 'do', true, true, 23, NOW(), NOW()),
('Wellness & Spas', 'wellness-spas', 'do', true, true, 24, NOW(), NOW()),
-- Explore
('Beaches', 'beaches', 'explore', true, true, 30, NOW(), NOW()),
('Shopping', 'shopping', 'explore', true, true, 31, NOW(), NOW()),
-- Invest
('Real Estate', 'real-estate', 'invest', true, true, 40, NOW(), NOW()),
-- Algarve Services
('Concierge Services', 'concierge-services', 'algarve-services', true, true, 50, NOW(), NOW()),
('Transportation', 'transportation', 'algarve-services', true, true, 51, NOW(), NOW()),
('Security Services', 'security-services', 'algarve-services', true, true, 52, NOW(), NOW()),
('Architecture & Design', 'architecture-design', 'algarve-services', true, true, 53, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  pillar = EXCLUDED.pillar,
  is_active = true,
  updated_at = NOW();

-- Insert private dining as a tag
INSERT INTO tags (name, slug) VALUES
('Private Dining', 'private-dining')
ON CONFLICT (slug) DO NOTHING;
