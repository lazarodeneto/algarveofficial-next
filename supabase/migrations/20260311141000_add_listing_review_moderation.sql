-- Require admin approval before listing reviews become public.

ALTER TABLE public.listing_reviews
  ADD COLUMN status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN moderated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN moderated_at timestamptz,
  ADD COLUMN approved_at timestamptz,
  ADD COLUMN rejection_reason text;
-- Existing live reviews were already public before moderation existed.
UPDATE public.listing_reviews
SET
  status = 'approved',
  moderated_at = COALESCE(moderated_at, created_at),
  approved_at = COALESCE(approved_at, created_at)
WHERE status = 'pending';
CREATE INDEX listing_reviews_status_idx ON public.listing_reviews (status);
CREATE INDEX listing_reviews_listing_status_idx ON public.listing_reviews (listing_id, status);
CREATE OR REPLACE FUNCTION public.manage_listing_review_moderation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
    NEW.moderated_by := NULL;
    NEW.moderated_at := NULL;
    NEW.approved_at := NULL;
    NEW.rejection_reason := NULL;
    RETURN NEW;
  END IF;

  -- Reviewer edits always send the review back into moderation.
  IF auth.uid() IS NOT NULL
     AND NEW.user_id = auth.uid()
     AND NOT public.is_admin_or_editor(auth.uid())
     AND (
       NEW.rating IS DISTINCT FROM OLD.rating
       OR COALESCE(NEW.comment, '') IS DISTINCT FROM COALESCE(OLD.comment, '')
     ) THEN
    NEW.status := 'pending';
    NEW.moderated_by := NULL;
    NEW.moderated_at := NULL;
    NEW.approved_at := NULL;
    NEW.rejection_reason := NULL;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR COALESCE(NEW.rejection_reason, '') IS DISTINCT FROM COALESCE(OLD.rejection_reason, '') THEN
    IF NEW.status = 'approved' THEN
      NEW.moderated_by := COALESCE(auth.uid(), NEW.moderated_by);
      NEW.moderated_at := now();
      NEW.approved_at := now();
      NEW.rejection_reason := NULL;
    ELSIF NEW.status = 'rejected' THEN
      NEW.moderated_by := COALESCE(auth.uid(), NEW.moderated_by);
      NEW.moderated_at := now();
      NEW.approved_at := NULL;
    ELSIF NEW.status = 'pending' THEN
      NEW.moderated_by := NULL;
      NEW.moderated_at := NULL;
      NEW.approved_at := NULL;
      NEW.rejection_reason := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS listing_reviews_manage_moderation ON public.listing_reviews;
CREATE TRIGGER listing_reviews_manage_moderation
  BEFORE INSERT OR UPDATE ON public.listing_reviews
  FOR EACH ROW EXECUTE FUNCTION public.manage_listing_review_moderation();
DROP POLICY IF EXISTS "listing_reviews_select_public" ON public.listing_reviews;
DROP POLICY IF EXISTS "listing_reviews_insert_own" ON public.listing_reviews;
DROP POLICY IF EXISTS "listing_reviews_update_own" ON public.listing_reviews;
DROP POLICY IF EXISTS "listing_reviews_delete_own_or_admin" ON public.listing_reviews;
CREATE POLICY "listing_reviews_select_visible"
  ON public.listing_reviews FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = user_id
    OR public.is_admin_or_editor(auth.uid())
  );
CREATE POLICY "listing_reviews_insert_own_pending"
  ON public.listing_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND moderated_by IS NULL
    AND moderated_at IS NULL
    AND approved_at IS NULL
    AND rejection_reason IS NULL
  );
CREATE POLICY "listing_reviews_update_own_pending"
  ON public.listing_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND moderated_by IS NULL
    AND moderated_at IS NULL
    AND approved_at IS NULL
    AND rejection_reason IS NULL
  );
CREATE POLICY "listing_reviews_admin_manage"
  ON public.listing_reviews FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "listing_reviews_delete_own"
  ON public.listing_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
