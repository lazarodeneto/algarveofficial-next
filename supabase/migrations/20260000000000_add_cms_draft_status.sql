-- Add draft/published status to cms_documents table
ALTER TABLE public.cms_documents
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cms_documents_status_check'
  ) THEN
    ALTER TABLE public.cms_documents
    ADD CONSTRAINT cms_documents_status_check CHECK (status IN ('draft', 'published', 'archived'));
  END IF;
END $$;

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_cms_documents_status_lookup
ON public.cms_documents (page_id, locale, status, doc_type);

-- Add status to document versions for audit trail
ALTER TABLE public.cms_document_versions
ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.cms_documents.status IS 'draft=unpublished, published=live, archived=hidden';
COMMENT ON COLUMN public.cms_document_versions.is_published IS 'Whether this version was published at the time of creation';