begin;

do $$
declare
  v_listing_id uuid;
  v_course_id uuid;
  v_category_data jsonb;
  v_scorecard_holes jsonb;
  v_scorecard jsonb := $scorecard$
[
  {"hole": 1, "white": 151, "yellow": 140, "red": 128, "par": 3, "hcp": 16},
  {"hole": 2, "white": 347, "yellow": 340, "red": 225, "par": 4, "hcp": 12},
  {"hole": 3, "white": 393, "yellow": 430, "red": 327, "par": 4, "hcp": 2},
  {"hole": 4, "white": 378, "yellow": 341, "red": 298, "par": 4, "hcp": 6},
  {"hole": 5, "white": 419, "yellow": 409, "red": 349, "par": 5, "hcp": 18},
  {"hole": 6, "white": 378, "yellow": 366, "red": 335, "par": 4, "hcp": 4},
  {"hole": 7, "white": 187, "yellow": 180, "red": 166, "par": 3, "hcp": 8},
  {"hole": 8, "white": 304, "yellow": 293, "red": 268, "par": 4, "hcp": 14},
  {"hole": 9, "white": 352, "yellow": 336, "red": 325, "par": 4, "hcp": 10},
  {"hole": 10, "white": 390, "yellow": 341, "red": 314, "par": 4, "hcp": 5},
  {"hole": 11, "white": 130, "yellow": 117, "red": 104, "par": 3, "hcp": 17},
  {"hole": 12, "white": 123, "yellow": 112, "red": 91, "par": 3, "hcp": 15},
  {"hole": 13, "white": 413, "yellow": 382, "red": 354, "par": 4, "hcp": 3},
  {"hole": 14, "white": 242, "yellow": 230, "red": 208, "par": 4, "hcp": 13},
  {"hole": 15, "white": 347, "yellow": 340, "red": 320, "par": 4, "hcp": 9},
  {"hole": 16, "white": 604, "yellow": 591, "red": 523, "par": 5, "hcp": 1},
  {"hole": 17, "white": 147, "yellow": 129, "red": 112, "par": 3, "hcp": 11},
  {"hole": 18, "white": 507, "yellow": 504, "red": 402, "par": 5, "hcp": 7}
]
$scorecard$::jsonb;
begin
  select id
  into v_listing_id
  from public.listings
  where slug in (
      'pestana-alto-golf',
      'pestana-alto',
      'pestana-alto-golf-course',
      'alto-golf-course',
      'alto-golf'
    )
    or lower(name) in (
      lower('Pestana Alto Golf'),
      lower('Pestana Alto Golf Course'),
      lower('Alto Golf Course'),
      lower('Alto Golf')
    )
  order by case slug
    when 'pestana-alto-golf' then 1
    when 'pestana-alto' then 2
    when 'pestana-alto-golf-course' then 3
    when 'alto-golf-course' then 4
    when 'alto-golf' then 5
    else 6
  end, updated_at desc nulls last
  limit 1;

  if v_listing_id is null then
    raise notice 'Pestana Alto Golf listing not found; scorecard update skipped.';
    return;
  end if;

  select coalesce(category_data, '{}'::jsonb)
  into v_category_data
  from public.listings
  where id = v_listing_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'hole_number', hole,
        'par', par,
        'stroke_index', hcp,
        'distance_white', white,
        'distance_yellow', yellow,
        'distance_red', red
      )
      order by hole
    ),
    '[]'::jsonb
  )
  into v_scorecard_holes
  from jsonb_to_recordset(v_scorecard) as rows(
    hole int,
    white int,
    yellow int,
    red int,
    par int,
    hcp int
  );

  v_category_data := jsonb_set(v_category_data, '{scorecard}', v_scorecard, true);
  v_category_data := jsonb_set(v_category_data, '{scorecard_holes}', v_scorecard_holes, true);
  v_category_data := jsonb_set(
    v_category_data,
    '{golf}',
    (case
      when jsonb_typeof(v_category_data->'golf') = 'object' then v_category_data->'golf'
      else '{}'::jsonb
    end) || jsonb_build_object(
      'holes', 18,
      'par', 70,
      'length_meters', 5812
    ),
    true
  );

  update public.listings
  set category_data = v_category_data,
      updated_at = now()
  where id = v_listing_id;

  alter table public.golf_holes
    add column if not exists course_id uuid references public.golf_courses(id) on delete cascade;

  select id
  into v_course_id
  from public.golf_courses
  where listing_id = v_listing_id
    and is_default = true
  order by created_at, id
  limit 1;

  if v_course_id is null then
    insert into public.golf_courses (
      listing_id,
      name,
      holes_count,
      is_default,
      holes,
      par,
      length_meters
    ) values (
      v_listing_id,
      'Alto Golf Course',
      18,
      true,
      18,
      70,
      to_jsonb(5812)
    )
    returning id into v_course_id;
  else
    update public.golf_courses
    set
      name = 'Alto Golf Course',
      holes_count = 18,
      is_default = true,
      holes = 18,
      par = 70,
      length_meters = to_jsonb(5812),
      updated_at = now()
    where id = v_course_id;
  end if;

  update public.golf_courses
  set is_default = false,
      updated_at = now()
  where listing_id = v_listing_id
    and id <> v_course_id
    and is_default = true;

  delete from public.golf_holes
  where listing_id = v_listing_id;

  insert into public.golf_holes (
    listing_id,
    course_id,
    hole_number,
    par,
    stroke_index,
    distance_white,
    distance_yellow,
    distance_red
  )
  select
    v_listing_id,
    v_course_id,
    hole,
    par,
    hcp,
    white,
    yellow,
    red
  from jsonb_to_recordset(v_scorecard) as rows(
    hole int,
    white int,
    yellow int,
    red int,
    par int,
    hcp int
  )
  order by hole;
end;
$$;

commit;
