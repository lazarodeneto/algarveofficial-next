-- Restore the text-hash helper used by queue_jobs_only_on_change.
-- Some environments only have the trigger overload hash_en_translation()
-- and are missing this 5-argument scalar overload.
CREATE OR REPLACE FUNCTION public.hash_en_translation(
  p_title text,
  p_short text,
  p_desc text,
  p_seo_title text,
  p_seo_desc text
)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $function$
  SELECT md5(
    coalesce(p_title, '') || '||' ||
    coalesce(p_short, '') || '||' ||
    coalesce(p_desc, '') || '||' ||
    coalesce(p_seo_title, '') || '||' ||
    coalesce(p_seo_desc, '')
  );
$function$;
