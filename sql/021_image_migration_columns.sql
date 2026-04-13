-- =====================================================
-- Image Migration Schema
-- Run this migration first
-- =====================================================

-- Add migration tracking columns to listing_images
ALTER TABLE listing_images 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMPTZ;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_listing_images_storage_path 
ON listing_images(storage_path) 
WHERE storage_path IS NULL;

CREATE INDEX IF NOT EXISTS idx_listing_images_migrated 
ON listing_images(migrated_at) 
WHERE migrated_at IS NULL;

-- Enable RLS if not already enabled
-- ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- Grant permissions (adjust as needed for your setup)
-- GRANT UPDATE ON listing_images TO service_role;

COMMENT ON COLUMN listing_images.storage_path IS 'Supabase Storage path (e.g., listing_id/hash.webp)';
COMMENT ON COLUMN listing_images.source_url IS 'Original external URL before migration';
COMMENT ON COLUMN listing_images.migrated_at IS 'Timestamp when image was migrated to Supabase Storage';