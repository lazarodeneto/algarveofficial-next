-- Category System Refactor
-- Adds pillar column and tags table

-- Add pillar column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS pillar TEXT;

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert categories with pillars
INSERT INTO categories (id, name, slug, pillar, created_at) VALUES
-- Stay
(gen_random_uuid(), 'Accommodation', 'accommodation', 'stay', NOW()),
-- Eat
(gen_random_uuid(), 'Restaurants', 'restaurants', 'eat', NOW()),
(gen_random_uuid(), 'Beach Clubs', 'beach-clubs', 'eat', NOW()),
-- Do
(gen_random_uuid(), 'Experiences', 'experiences', 'do', NOW()),
(gen_random_uuid(), 'Golf', 'golf', 'do', NOW()),
(gen_random_uuid(), 'Events', 'events', 'do', NOW()),
(gen_random_uuid(), 'Family Attractions', 'family-attractions', 'do', NOW()),
(gen_random_uuid(), 'Wellness & Spas', 'wellness-spas', 'do', NOW()),
-- Explore
(gen_random_uuid(), 'Beaches', 'beaches', 'explore', NOW()),
(gen_random_uuid(), 'Shopping', 'shopping', 'explore', NOW()),
-- Invest
(gen_random_uuid(), 'Real Estate', 'real-estate', 'invest', NOW()),
-- Algarve Services
(gen_random_uuid(), 'Concierge Services', 'concierge-services', 'algarve-services', NOW()),
(gen_random_uuid(), 'Transportation', 'transportation', 'algarve-services', NOW()),
(gen_random_uuid(), 'Security Services', 'security-services', 'algarve-services', NOW()),
(gen_random_uuid(), 'Architecture & Design', 'architecture-design', 'algarve-services', NOW())
ON CONFLICT (slug) DO UPDATE SET pillar = EXCLUDED.pillar;

-- Insert private dining as a tag
INSERT INTO tags (id, name, slug) VALUES
(gen_random_uuid(), 'Private Dining', 'private-dining')
ON CONFLICT (slug) DO NOTHING;
