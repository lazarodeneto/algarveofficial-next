begin;

do $$
declare
  v_events_category_id uuid;
  v_concierge_category_id uuid;
begin
  select id into v_events_category_id
  from public.categories
  where slug = 'events'
  limit 1;

  select id into v_concierge_category_id
  from public.categories
  where slug = 'concierge-services'
  limit 1;

  if v_events_category_id is null then
    raise exception 'Missing events category';
  end if;

  if v_concierge_category_id is null then
    raise exception 'Missing concierge-services category';
  end if;

  update public.listings
  set category_id = v_concierge_category_id,
      updated_at = now()
  where category_id = v_events_category_id
    and slug <> 'algarve-smooth-jazz-festival';
end $$;

commit;
