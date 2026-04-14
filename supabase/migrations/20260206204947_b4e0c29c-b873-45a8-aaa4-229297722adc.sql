-- Allow owners to resubmit rejected listings for review
CREATE OR REPLACE FUNCTION public.enforce_listing_protected_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow admins and editors to modify any field
  IF public.is_admin_or_editor(auth.uid()) THEN
    RETURN NEW;
  END IF;
  
  -- Prevent tier changes (monetization protection)
  IF NEW.tier IS DISTINCT FROM OLD.tier THEN
    RAISE EXCEPTION 'Only administrators can modify listing tier';
  END IF;
  
  -- Prevent is_curated changes (editorial protection)
  IF NEW.is_curated IS DISTINCT FROM OLD.is_curated THEN
    RAISE EXCEPTION 'Only administrators can modify curation status';
  END IF;
  
  -- Prevent direct publishing (require review process)
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    RAISE EXCEPTION 'Only administrators can publish listings';
  END IF;
  
  -- Allow owners to resubmit rejected listings for review
  IF OLD.status = 'rejected' AND NEW.status = 'pending_review' THEN
    RETURN NEW;
  END IF;
  
  -- Prevent other rejected status changes
  IF OLD.status = 'rejected' AND NEW.status NOT IN ('rejected', 'draft') THEN
    RAISE EXCEPTION 'Only administrators can change rejected listing status';
  END IF;
  
  RETURN NEW;
END;
$function$;
