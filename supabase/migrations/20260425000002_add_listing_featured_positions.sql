-- Context-specific featured positions table
-- Allows different ranking for homepage, categories, cities, etc.
CREATE TABLE IF NOT EXISTS listing_featured_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL CHECK (context_type IN ('homepage', 'category', 'city', 'region')),
  context_value TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(context_type, context_value, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_listing_featured_positions_lookup
  ON listing_featured_positions(context_type, context_value, position);

-- RLS
ALTER TABLE listing_featured_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read listing_featured_positions"
  ON listing_featured_positions FOR SELECT USING (true);

CREATE POLICY "Admin manage listing_featured_positions"
  ON listing_featured_positions FOR ALL USING (
    auth.role() = 'authenticated'
  );