-- Allow trusted server-side admin listing routes to update protected fields.
--
-- Admin listing mutations use the service-role client after the API route has
-- authenticated the requester and checked RBAC. The previous trigger only
-- trusted auth.uid(), which is null for service-role writes, so legitimate
-- admin tier/status updates were rejected.

CREATE OR REPLACE FUNCTION public.enforce_listing_protected_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Browser/user-token writes must come from admins/editors. Server admin
  -- routes use service_role after explicit API-level authorization.
  IF auth.role() = 'service_role' OR public.is_admin_or_editor(auth.uid()) THEN
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
