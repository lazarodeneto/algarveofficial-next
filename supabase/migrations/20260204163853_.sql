-- Create listing_claims table to store claim requests
CREATE TABLE public.listing_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_website TEXT,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  request_type TEXT NOT NULL CHECK (request_type IN ('claim-business', 'new-listing')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listing_claims ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own claims
CREATE POLICY "listing_claims_insert"
ON public.listing_claims
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can view their own claims
CREATE POLICY "listing_claims_select_own"
ON public.listing_claims
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admin/Editor can view all claims
CREATE POLICY "listing_claims_select_admin"
ON public.listing_claims
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Policy: Admin/Editor can update claims (approve/reject)
CREATE POLICY "listing_claims_update_admin"
ON public.listing_claims
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Policy: Admin can delete claims
CREATE POLICY "listing_claims_delete_admin"
ON public.listing_claims
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow anon/public users to submit claims (for non-logged-in users)
CREATE POLICY "listing_claims_insert_anon"
ON public.listing_claims
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Create index for faster lookups
CREATE INDEX idx_listing_claims_status ON public.listing_claims(status);
CREATE INDEX idx_listing_claims_created_at ON public.listing_claims(created_at DESC);;
