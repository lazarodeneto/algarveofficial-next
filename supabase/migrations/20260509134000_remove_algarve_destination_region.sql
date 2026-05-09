begin;

do $$
declare
  v_region_id uuid;
begin
  select id into v_region_id
  from public.regions
  where slug = 'algarve'
  limit 1;

  if v_region_id is not null then
    update public.listings
    set region_id = null,
        updated_at = now()
    where region_id = v_region_id;

    delete from public.regions
    where id = v_region_id;
  end if;
end $$;

commit;
