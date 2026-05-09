begin;

create extension if not exists pgcrypto;

alter table public.listings
  add column if not exists twitter_url text,
  add column if not exists linkedin_url text,
  add column if not exists youtube_url text,
  add column if not exists tiktok_url text;

create table if not exists public.golf_courses (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  name text not null default 'Main Course',
  holes_count integer not null default 18,
  is_default boolean not null default false,
  holes integer,
  par integer,
  slope jsonb,
  course_rating jsonb,
  length_meters jsonb,
  designer text,
  year_opened integer,
  last_renovation integer,
  layout_type text,
  difficulty text,
  is_tournament_course boolean not null default false,
  is_signature boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.golf_courses
  add column if not exists listing_id uuid references public.listings(id) on delete cascade,
  add column if not exists name text not null default 'Main Course',
  add column if not exists holes_count integer not null default 18,
  add column if not exists is_default boolean not null default false,
  add column if not exists holes integer,
  add column if not exists par integer,
  add column if not exists slope jsonb,
  add column if not exists course_rating jsonb,
  add column if not exists length_meters jsonb,
  add column if not exists designer text,
  add column if not exists year_opened integer,
  add column if not exists last_renovation integer,
  add column if not exists layout_type text,
  add column if not exists difficulty text,
  add column if not exists is_tournament_course boolean not null default false,
  add column if not exists is_signature boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.golf_courses
  drop constraint if exists golf_courses_holes_count_check;

update public.golf_courses
set
  holes_count = case when holes_count between 1 and 54 then holes_count else 18 end,
  is_default = coalesce(is_default, false),
  is_tournament_course = coalesce(is_tournament_course, false),
  is_signature = coalesce(is_signature, false);

alter table public.golf_courses
  add constraint golf_courses_holes_count_check
  check (holes_count between 1 and 54) not valid;

alter table public.golf_courses
  validate constraint golf_courses_holes_count_check;

create index if not exists idx_golf_courses_listing_id
  on public.golf_courses(listing_id);

create unique index if not exists uq_golf_courses_default_per_listing
  on public.golf_courses(listing_id)
  where is_default = true;

create table if not exists public.golf_holes (
  listing_id uuid not null references public.listings(id) on delete cascade,
  course_id uuid references public.golf_courses(id) on delete cascade,
  hole_number smallint not null,
  par smallint not null,
  stroke_index smallint,
  hcp smallint,
  distance_white integer,
  distance_yellow integer,
  distance_red integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (listing_id, hole_number)
);

alter table public.golf_holes
  add column if not exists course_id uuid references public.golf_courses(id) on delete cascade,
  add column if not exists stroke_index smallint,
  add column if not exists hcp smallint,
  add column if not exists distance_white integer,
  add column if not exists distance_yellow integer,
  add column if not exists distance_red integer,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.golf_holes
  drop constraint if exists golf_holes_hole_number_check,
  drop constraint if exists golf_holes_stroke_index_check;

alter table public.golf_holes
  add constraint golf_holes_hole_number_check
  check (hole_number between 1 and 54) not valid,
  add constraint golf_holes_stroke_index_check
  check (stroke_index is null or stroke_index between 1 and 54) not valid;

alter table public.golf_holes
  validate constraint golf_holes_hole_number_check,
  validate constraint golf_holes_stroke_index_check;

create index if not exists idx_golf_holes_course_id
  on public.golf_holes(course_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'golf_holes_course_id_hole_number_key'
      and conrelid = 'public.golf_holes'::regclass
  ) then
    alter table public.golf_holes
      add constraint golf_holes_course_id_hole_number_key unique (course_id, hole_number);
  end if;
end
$$;

commit;
