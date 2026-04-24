-- Additive migration for multi-course golf setups.
-- Keeps legacy listing_id flow on golf_holes for backward compatibility.

create extension if not exists pgcrypto;

create table if not exists golf_courses (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  name text not null,
  holes_count int not null default 18 check (holes_count between 1 and 18),
  is_default boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists idx_golf_courses_listing_id
  on golf_courses(listing_id);

create unique index if not exists uq_golf_courses_default_per_listing
  on golf_courses(listing_id)
  where is_default = true;

alter table golf_holes
  add column if not exists course_id uuid references golf_courses(id) on delete cascade;

create index if not exists idx_golf_holes_course_id
  on golf_holes(course_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'golf_holes_course_id_hole_number_key'
  ) THEN
    ALTER TABLE golf_holes
      ADD CONSTRAINT golf_holes_course_id_hole_number_key unique (course_id, hole_number);
  END IF;
END
$$;

-- Backfill default course for listings that already have legacy golf_holes rows.
insert into golf_courses (listing_id, name, holes_count, is_default)
select
  gh.listing_id,
  'Main Course',
  LEAST(18, GREATEST(1, COUNT(*)::int)) as holes_count,
  true
from golf_holes gh
where gh.listing_id is not null
  and not exists (
    select 1
    from golf_courses gc
    where gc.listing_id = gh.listing_id
  )
group by gh.listing_id;

-- Attach legacy hole rows to their listing's default course.
update golf_holes gh
set course_id = gc.id
from golf_courses gc
where gh.listing_id = gc.listing_id
  and gh.course_id is null;

-- Ensure exactly one default course per listing.
with ranked as (
  select
    id,
    listing_id,
    row_number() over (
      partition by listing_id
      order by is_default desc, created_at asc, id asc
    ) as rn
  from golf_courses
)
update golf_courses gc
set is_default = (ranked.rn = 1),
    updated_at = now()
from ranked
where gc.id = ranked.id
  and gc.is_default is distinct from (ranked.rn = 1);

-- Keep holes_count synced to saved hole rows where possible.
with hole_counts as (
  select course_id, count(*)::int as hole_count
  from golf_holes
  where course_id is not null
  group by course_id
)
update golf_courses gc
set holes_count = LEAST(18, GREATEST(1, hc.hole_count)),
    updated_at = now()
from hole_counts hc
where gc.id = hc.course_id
  and gc.holes_count is distinct from LEAST(18, GREATEST(1, hc.hole_count));
