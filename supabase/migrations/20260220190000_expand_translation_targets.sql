-- Expand listing auto-translation targets to include NL/SV/NO/DA
CREATE OR REPLACE FUNCTION public.queue_jobs_only_on_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
declare
  new_hash text;
  old_hash text;
  t text;
  targets text[] := array['pt-pt','fr','de','es','it','nl','sv','no','da'];
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
