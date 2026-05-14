begin;

insert into public.cities (name, slug, short_description, is_active, is_featured, display_order)
values (
  'Silves',
  'silves',
  'Historic inland Algarve city known for its castle, river setting and family day trips.',
  true,
  false,
  21
)
on conflict (slug) do update
set
  name = excluded.name,
  short_description = excluded.short_description,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.city_region_mapping (city_id, region_id, is_primary)
select c.id, r.id, true
from public.cities c
join public.regions r on r.slug = 'algarve'
where c.slug = 'silves'
on conflict (city_id, region_id) do update
set is_primary = excluded.is_primary;

with family_category as (
  select id
  from public.categories
  where slug in ('family-attractions', 'family-fun')
  order by case when slug = 'family-attractions' then 0 else 1 end
  limit 1
),
seed (
  slug,
  name,
  city_slug,
  short_description,
  description,
  address,
  contact_phone,
  contact_email,
  website_url,
  source_url,
  attraction_type,
  tags
) as (
  values
    (
      'slide-splash-lagoa',
      'Slide & Splash',
      'lagoa',
      'Long-running Lagoa water park with slides, pools, services and family facilities.',
      'Slide & Splash is a major family water park in Lagoa, with water attractions for different ages and visitor services including lockers, cabanas, restaurants, parking and accessibility support.',
      'E.N. 125 Vale de Deus, 8401-901 Estombar, Lagoa',
      '+351 282 340 800',
      'info@slidesplash.com',
      'https://www.slidesplash.com/',
      'https://www.slidesplash.com/',
      'water_park',
      array['family-attractions', 'water-park', 'lagoa', 'kids', 'teens']
    ),
    (
      'aquashow-park-quarteira',
      'Aquashow Park',
      'quarteira',
      'Quarteira water and theme park complex with outdoor and indoor family attractions.',
      'Aquashow Park is a family attraction in Quarteira with water-park rides, leisure areas, hotel facilities and an indoor water park, making it one of the central Algarve’s strongest options for families and teenagers.',
      'Volta do Parque n.º 1, Aquashow Park, 8125-313 Quarteira',
      '+351 289 315 129',
      null,
      'https://aquashowpark.com/',
      'https://aquashowpark.com/en/about-us/',
      'water_park',
      array['family-attractions', 'water-park', 'quarteira', 'loule', 'teens']
    ),
    (
      'aqualand-algarve-alcantarilha',
      'Aqualand Algarve',
      'silves',
      'Family water park in Alcantarilha with slides, pools and online ticketing.',
      'Aqualand Algarve is a family water park in Alcantarilha, useful for families staying around Silves, Lagoa, Carvoeiro, Armação de Pêra, Albufeira and Portimão.',
      'Alcantarilha, Silves, Algarve, Portugal',
      null,
      null,
      'https://www.aqualand.pt/en/',
      'https://www.aqualand.pt/en/',
      'water_park',
      array['family-attractions', 'water-park', 'alcantarilha', 'silves', 'kids']
    ),
    (
      'lagos-zoo',
      'Lagos Zoo',
      'lagos',
      'Western Algarve zoo with animal habitats, family activities and a seasonal Boulders Beach area.',
      'Lagos Zoo is a family-friendly animal park near Barão de São João, with around 150 species, animal feeding sessions, a penguin beach, a bat enclosure and family activities.',
      'Medronhal-Quinta Figueiras, 8600-013 Barão de São João, Lagos',
      '+351 282 680 100',
      null,
      'https://zoolagos.com/',
      'https://zoolagos.com/',
      'zoo',
      array['family-attractions', 'zoo', 'lagos', 'animals', 'kids']
    ),
    (
      'krazy-world-algoz',
      'Krazy World',
      'silves',
      'Algoz family activity park with animals, mini-golf, pools and outdoor activities.',
      'Krazy World is a family activity park near Algoz with interactive animal experiences, mini-golf, pools, pedal karts, pony rides, tree climbing and paintball.',
      'Algoz, Silves, Algarve, Portugal',
      null,
      null,
      'https://krazyworld.com/',
      'https://krazyworld.com/',
      'activity_park',
      array['family-attractions', 'zoo', 'mini-golf', 'algoz', 'silves']
    ),
    (
      'sandcity-lagoa',
      'SandCity',
      'lagoa',
      'Large outdoor sand-sculpture park in Lagoa for families, photography and evening visits.',
      'SandCity is an outdoor sand-sculpture park in Lagoa, combining large-scale themed sculptures with an easy family visit format that works well for creative and visual itineraries.',
      'Lagoa, Algarve, Portugal',
      null,
      null,
      'https://sandcity.pt/',
      'https://sandcity.pt/',
      'sculpture_park',
      array['family-attractions', 'sand-sculptures', 'lagoa', 'creative', 'kids']
    ),
    (
      'parque-aventura-albufeira',
      'Parque Aventura Albufeira',
      'albufeira',
      'Outdoor adventure park with treetop courses, zip lines and paintball in Albufeira.',
      'Parque Aventura Albufeira offers treetop trekking, zip-line style obstacles and paintball in a green outdoor setting, making it useful for active families with older children and teenagers.',
      'Estrada de Santa Eulália 215, 8200-381 Albufeira',
      '+351 913 185 782',
      'albufeira@parqueaventura.net',
      'https://www.parqueaventura.net/',
      'https://albufeira.com/parqueaventura',
      'adventure_park',
      array['family-attractions', 'adventure-park', 'albufeira', 'zip-lines', 'teens']
    ),
    (
      'karting-almancil',
      'Karting Almancil Family Park',
      'almancil',
      'Family karting park in Almancil with adult, junior and two-seater kart options.',
      'Karting Almancil Family Park is a motorsport-focused family attraction near Almancil, with karting options suited to older children, teenagers and adults.',
      'Almancil, Loulé, Algarve, Portugal',
      null,
      null,
      'https://www.kartingalgarve.com/',
      'https://www.kartingalgarve.com/',
      'karting',
      array['family-attractions', 'karting', 'almancil', 'teens', 'motorsport']
    ),
    (
      'centro-ciencia-viva-algarve-faro',
      'Centro Ciência Viva do Algarve',
      'faro',
      'Interactive science centre in Faro with exhibitions linked to the sea, light, senses and Ria Formosa.',
      'Centro Ciência Viva do Algarve is an interactive science centre in Faro, with exhibition areas dedicated to the sea, light, the brain and the senses, plus aquariums and activities for families.',
      'Rua Comandante Francisco Manuel, 8000-250 Faro',
      '+351 289 890 920',
      'info@ccvalg.pt',
      'https://web.ccvalg.pt/',
      'https://www.cienciaviva.pt/centroscv/rede/index.php?id_centro=15',
      'science_centre',
      array['family-attractions', 'science-centre', 'faro', 'rainy-day', 'kids']
    ),
    (
      'centro-ciencia-viva-lagos',
      'Centro Ciência Viva de Lagos',
      'lagos',
      'Interactive Lagos science centre focused on navigation, discovery and family activities.',
      'Centro Ciência Viva de Lagos is an interactive science centre in central Lagos, with family-oriented exhibitions and activities connected to navigation, discovery and science learning.',
      'Rua Dr. Faria e Silva n.º 34, 8600-734 Lagos',
      '+351 282 770 000',
      null,
      'https://lagos.cienciaviva.pt/',
      'https://lagos.cienciaviva.pt/',
      'science_centre',
      array['family-attractions', 'science-centre', 'lagos', 'rainy-day', 'kids']
    )
),
resolved as (
  select
    s.*,
    fc.id as category_id,
    c.id as city_id,
    coalesce(cm.region_id, r.id) as region_id
  from seed s
  cross join family_category fc
  join public.cities c on c.slug = s.city_slug
  left join public.city_region_mapping cm on cm.city_id = c.id and cm.is_primary
  left join public.regions r on r.slug = 'algarve'
)
insert into public.listings (
  id,
  owner_id,
  category_id,
  city_id,
  region_id,
  name,
  slug,
  short_description,
  description,
  address,
  contact_phone,
  contact_email,
  website_url,
  tags,
  tier,
  is_curated,
  status,
  category_data,
  meta_title,
  meta_description,
  published_at,
  updated_at
)
select
  gen_random_uuid(),
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid,
  category_id,
  city_id,
  region_id,
  name,
  slug,
  short_description,
  description,
  address,
  contact_phone,
  contact_email,
  website_url,
  tags,
  'unverified'::public.listing_tier,
  false,
  'published'::public.listing_status,
  jsonb_build_object(
    'vertical', 'family-attractions',
    'attraction_type', attraction_type,
    'source_url', source_url,
    'source_checked_at', '2026-05-14'
  ),
  name || ' | Family Attraction in the Algarve',
  short_description,
  now(),
  now()
from resolved
on conflict (slug) do update
set
  category_id = excluded.category_id,
  city_id = excluded.city_id,
  region_id = excluded.region_id,
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  address = excluded.address,
  contact_phone = coalesce(excluded.contact_phone, public.listings.contact_phone),
  contact_email = coalesce(excluded.contact_email, public.listings.contact_email),
  website_url = excluded.website_url,
  tags = excluded.tags,
  tier = public.listings.tier,
  is_curated = public.listings.is_curated,
  status = excluded.status,
  category_data = coalesce(public.listings.category_data, '{}'::jsonb) || excluded.category_data,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  published_at = coalesce(public.listings.published_at, excluded.published_at),
  updated_at = now();

with related_slugs(slug, sort_order) as (
  values
    ('zoomarine-algarve', 10),
    ('slide-splash-lagoa', 20),
    ('aquashow-park-quarteira', 30),
    ('aqualand-algarve-alcantarilha', 40),
    ('lagos-zoo', 50),
    ('krazy-world-algoz', 60),
    ('sandcity-lagoa', 70),
    ('parque-aventura-albufeira', 80),
    ('karting-almancil', 90),
    ('centro-ciencia-viva-algarve-faro', 100),
    ('centro-ciencia-viva-lagos', 110),
    ('praia-do-barril-tavira', 200),
    ('praia-da-ilha-de-tavira', 210),
    ('praia-da-ilha-deserta-barreta-faro', 220),
    ('praia-da-culatra-faro', 230),
    ('praia-da-armona-olhao', 240),
    ('praia-da-rocha-portimao', 250),
    ('praia-da-falesia-albufeira', 260),
    ('meia-praia-lagos', 270),
    ('praia-do-vau-portimao', 280),
    ('praia-da-marinha-lagoa', 290),
    ('praia-de-benagil-lagoa', 300),
    ('praia-de-vale-centeanes-lagoa', 310)
),
related as (
  select coalesce(array_agg(l.id order by rs.sort_order), '{}'::uuid[]) as ids
  from related_slugs rs
  join public.listings l on l.slug = rs.slug and l.status = 'published'
)
update public.blog_posts bp
set
  related_listing_ids = related.ids,
  updated_at = now()
from related
where bp.slug = 'family-attractions-algarve-kids-guide';

commit;
