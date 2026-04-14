
-- Fix hash_en_translation SQL overload with search_path including extensions
CREATE OR REPLACE FUNCTION public.hash_en_translation(p_title text, p_short text, p_desc text, p_seo_title text, p_seo_desc text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public, extensions
AS $function$
  select encode(
    extensions.digest(
      coalesce(p_title,'') || '||' ||
      coalesce(p_short,'') || '||' ||
      coalesce(p_desc,'') || '||' ||
      coalesce(p_seo_title,'') || '||' ||
      coalesce(p_seo_desc,''),
      'sha256'
    ),
    'hex'
  );
$function$;

-- Fix queue_jobs_only_on_change
CREATE OR REPLACE FUNCTION public.queue_jobs_only_on_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
declare
  new_hash text;
  old_hash text;
  t text;
  targets text[] := array['pt-pt','fr','de','es','it'];
begin
  if (new.language_code <> 'en') then
    return new;
  end if;

  new_hash := public.hash_en_translation(new.title, new.short_description, new.description, new.seo_title, new.seo_description);

  if (tg_op = 'UPDATE') then
    old_hash := public.hash_en_translation(old.title, old.short_description, old.description, old.seo_title, old.seo_description);
    if (new_hash = old_hash) then
      new.source_hash := new_hash;
      return new;
    end if;
  end if;

  foreach t in array targets loop
    insert into public.translation_jobs (listing_id, target_lang, status)
    values (new.listing_id, t, 'queued')
    on conflict (listing_id, target_lang)
    do update set status='queued', attempts=0, last_error=null, locked_at=null, updated_at=now();

    insert into public.listing_translations (listing_id, language_code, title, translation_status)
    values (new.listing_id, t, new.title, 'queued')
    on conflict (listing_id, language_code)
    do update set translation_status='queued', updated_at=now();
  end loop;

  new.source_hash := new_hash;
  return new;
end $function$;
;
