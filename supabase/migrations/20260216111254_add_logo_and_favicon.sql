-- Add logo_url and favicon_url to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT;
-- Create branding bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding', 
  'branding', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
-- Set up storage policies for the branding bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding');
CREATE POLICY "Admin Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'branding' AND 
    auth.role() = 'authenticated'
  );
CREATE POLICY "Admin Update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'branding' AND 
    auth.role() = 'authenticated'
  );
CREATE POLICY "Admin Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'branding' AND 
    auth.role() = 'authenticated'
  );
