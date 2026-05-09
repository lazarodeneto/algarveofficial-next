begin;

drop trigger if exists sync_event_listing_trigger on public.events;

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

  if v_concierge_category_id is null then
    raise exception 'Missing concierge-services category';
  end if;

  update public.events
  set category = 'music',
      listing_id = null,
      updated_at = now()
  where slug = 'algarve-smooth-jazz-festival';

  update public.listings
  set category_id = v_concierge_category_id,
      status = 'archived',
      updated_at = now()
  where slug = 'algarve-smooth-jazz-festival';

  if v_events_category_id is not null then
    update public.listings
    set category_id = v_concierge_category_id,
        updated_at = now()
    where category_id = v_events_category_id;

    delete from public.categories
    where id = v_events_category_id;
  end if;
end $$;

commit;
