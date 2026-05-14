begin;

insert into public.categories (name, slug, icon, display_order, is_active, is_featured)
values ('Beaches', 'beaches', 'Umbrella', 30, true, true)
on conflict (slug) do update set
  name = excluded.name,
  icon = coalesce(public.categories.icon, excluded.icon),
  is_active = true,
  updated_at = now();

insert into public.cities (name, slug, short_description, latitude, longitude, is_active, is_featured)
values (
  'Portimão',
  'portimao',
  'Western Algarve city known for Praia da Rocha, the Arade riverfront, beaches, restaurants and coastal access.',
  37.1394,
  -8.5369,
  true,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  short_description = coalesce(public.cities.short_description, excluded.short_description),
  latitude = coalesce(public.cities.latitude, excluded.latitude),
  longitude = coalesce(public.cities.longitude, excluded.longitude),
  is_active = true,
  updated_at = now();

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_listing_id uuid;
  v_old_slug text;
  v_existing_tier public.listing_tier;
  v_existing_category_id uuid;
  v_category_id uuid;
  v_city_id uuid;
  v_region_id uuid := null;
  v_slug text := 'praia-do-alemao-portimao';
  v_name text := 'Praia do Alemão';
  v_address text := 'Praia do Alemão / Barranco das Canas, Portimão, Algarve, Portugal';
  v_website_url text := 'https://visitportimao.com/praias/praia-do-alemao/';
  v_latitude numeric := null;
  v_longitude numeric := null;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Alemão",
  "slug": "praia-do-alemao-portimao",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Portimão",
  "concelho": "Portimão",
  "municipality": "Portimão",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Alemão is a well-known Portimão beach beside Praia do Vau, also identified locally and officially as Barranco das Canas. It offers a more natural cliff-backed setting, with golden sand, pine-covered clifftops and access to scenic coastal walks.",
  "full_description": "Praia do Alemão, also known as Praia do Barranco das Canas, sits on the Portimão coast between Praia do Vau and the rock formation of Ponta de João d’Arens. Although it is close to one of the Algarve’s most visited urban coastal areas, the beach has a noticeably more natural setting, with cliffs, pine trees and coastal scrub creating a softer, less built-up atmosphere.\n\nVisit Portimão describes the beach as bordered to the west by Ponta de João d’Arens and to the east by Praia do Vau, with a pine grove above the cliff that helps shelter the area on windier days. The same official source highlights the nearby Varandas Sobre o Mar walking route, which follows the clifftops towards Prainha through coastal vegetation and pine woodland.\n\nPraia do Alemão is suitable for visitors looking for scenic beach time within easy reach of Portimão, Vau and Praia da Rocha, while still feeling close to the Algarve’s natural cliff landscape. The parish source lists only limited infrastructure, with a bar and concession area, while Visit Portimão lists beach support, lifeguard, first-aid post, WC and sunshade area. These services should be treated as seasonal and checked before visiting.\n\nThe beach is popular in summer, but its main appeal remains the combination of sand, cliffs, rock formations and nearby walking trails. Visitors should take particular care around cliffs, rocks and tide-dependent passages, and should always follow local signage and beach flags.",
  "coordinates": {
    "latitude": null,
    "longitude": null,
    "label": "Praia do Alemão / Barranco das Canas",
    "notes": "Coordinates were not included because no direct official coordinate source was verified during this check.",
    "verification_status": "Not verified",
    "bathing_areas": []
  },
  "beach_type": "Maritime sandy beach",
  "landscape": "Golden sand backed by Algarve cliffs, pine woodland, coastal scrub and nearby limestone rock formations towards Ponta de João d’Arens.",
  "access": "Access is from the Vau / Portimão coastal area. The beach connects with clifftop walking routes, but current access conditions, parking and any restrictions should be checked locally before visiting.",
  "highlights": [
    "Cliff-backed sandy beach beside Praia do Vau",
    "Also known as Praia do Barranco das Canas",
    "Natural setting with pine trees and coastal scrub above the beach",
    "Views towards Ponta de João d’Arens",
    "Access to the Varandas Sobre o Mar coastal walking route",
    "Good base for exploring the Vau, Alemão and Prainha cliff coastline"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Couples",
    "Coastal walks",
    "Nature lovers",
    "Beach days near Portimão",
    "Swimming when conditions allow"
  ],
  "facilities": [
    { "name": "Beach support", "status": "Seasonal" },
    { "name": "Lifeguard", "status": "Seasonal" },
    { "name": "First-aid post", "status": "Seasonal" },
    { "name": "WC", "status": "Seasonal" },
    { "name": "Sunshade area", "status": "Seasonal" },
    { "name": "Bar", "status": "Seasonal" },
    { "name": "Concession area", "status": "Seasonal" },
    { "name": "Blue Flag", "status": "Not verified" },
    { "name": "Parking", "status": "Not verified" }
  ],
  "includes": [
    "Seasonal beach support",
    "Seasonal lifeguard",
    "Seasonal first-aid post",
    "Seasonal WC",
    "Seasonal sunshade area",
    "Seasonal bar and concession area",
    "Cliff-backed beach setting",
    "Pine grove and coastal scrub scenery",
    "Nearby walking routes"
  ],
  "important_information": {
    "best_time_to_visit": "Late spring and early autumn are good for a quieter visit, warm light and coastal walks. Summer offers the fullest seasonal beach atmosphere, but facilities and lifeguard presence should be verified locally.",
    "know_before_you_go": "Praia do Alemão is also identified as Praia do Barranco das Canas in official and local sources.\nFacilities are limited compared with larger neighbouring beaches and may operate seasonally.\nThe beach is close to Praia do Vau and can be popular in summer, especially during the main bathing season.\nVisitors should keep a safe distance from cliffs and avoid standing or sitting below unstable rock faces.\nSea conditions can vary; always check beach flags, local signage and lifeguard instructions before entering the water.\nThe municipal water-quality table lists Alemão - Barranco Canas as Excellent for the 2023 classification, but visitors should still follow current local bathing-water notices.\nBlue Flag status for Praia do Alemão itself was not verified from the official Blue Flag database; do not publish a Blue Flag claim unless manually confirmed.",
    "notes": [
      "Praia do Alemão is also identified as Praia do Barranco das Canas in official and local sources.",
      "Facilities are limited compared with larger neighbouring beaches and may operate seasonally.",
      "The beach is close to Praia do Vau and can be popular in summer, especially during the main bathing season.",
      "Visitors should keep a safe distance from cliffs and avoid standing or sitting below unstable rock faces.",
      "Sea conditions can vary; always check beach flags, local signage and lifeguard instructions before entering the water.",
      "The municipal water-quality table lists Alemão - Barranco Canas as Excellent for the 2023 classification, but visitors should still follow current local bathing-water notices.",
      "Blue Flag status for Praia do Alemão itself was not verified from the official Blue Flag database; do not publish a Blue Flag claim unless manually confirmed."
    ]
  },
  "important_notes": "Praia do Alemão is also identified as Praia do Barranco das Canas in official and local sources.\nFacilities are limited compared with larger neighbouring beaches and may operate seasonally.\nThe beach is close to Praia do Vau and can be popular in summer, especially during the main bathing season.\nVisitors should keep a safe distance from cliffs and avoid standing or sitting below unstable rock faces.\nSea conditions can vary; always check beach flags, local signage and lifeguard instructions before entering the water.\nThe municipal water-quality table lists Alemão - Barranco Canas as Excellent for the 2023 classification, but visitors should still follow current local bathing-water notices.\nBlue Flag status for Praia do Alemão itself was not verified from the official Blue Flag database; do not publish a Blue Flag claim unless manually confirmed.",
  "best_time_to_visit": "Late spring and early autumn are good for a quieter visit, warm light and coastal walks. Summer offers the fullest seasonal beach atmosphere, but facilities and lifeguard presence should be verified locally.",
  "suitable_for": [
    "Visitors staying in Portimão or Praia do Vau",
    "Couples",
    "Photographers",
    "Walkers",
    "Nature-focused beachgoers",
    "Families comfortable with cliff-backed beaches and seasonal crowds"
  ],
  "not_suitable_for": [
    "Visitors needing fully verified accessible beach infrastructure",
    "Travellers seeking extensive year-round facilities",
    "Visitors looking for a remote wild beach",
    "Anyone uncomfortable with cliffs, rocks or tide-dependent coastal passages"
  ],
  "nearby_attractions": [
    {
      "name": "Praia do Vau",
      "type": "Beach",
      "description": "Neighbouring beach immediately to the east of Praia do Alemão, forming part of the same scenic Portimão coastal stretch.",
      "verification_status": "Verified"
    },
    {
      "name": "Ponta de João d’Arens",
      "type": "Rock formation / coastal headland",
      "description": "The rocky formation west of Praia do Alemão, noted by Visit Portimão as one of the beach’s natural boundaries.",
      "verification_status": "Verified"
    },
    {
      "name": "Prainha",
      "type": "Beach",
      "description": "A nearby cliff-framed beach towards the west, reached along the broader coastal area explored by the Varandas Sobre o Mar route.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Rocha",
      "type": "Beach",
      "description": "One of Portimão’s best-known beaches, connected to Praia do Alemão by the official Rocha-Alemão walking itinerary.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia dos Três Castelos",
      "type": "Beach",
      "description": "A cliff-backed beach east of the Vau and Alemão coastline, useful as part of a wider Portimão beach route.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Portimão",
    "Praia do Vau",
    "Praia da Rocha",
    "Alvor"
  ],
  "walking_trails_nearby": [
    {
      "name": "Varandas Sobre o Mar",
      "description": "An official Visit Portimão clifftop route from the Praia do Alemão area towards Prainha, passing through coastal scrub and pine woodland above the cliffs.",
      "verification_status": "Verified"
    },
    {
      "name": "Rocha-Alemão Walk",
      "description": "An official Visit Portimão walk between Praia da Rocha and Praia do Alemão, following the cliff landscape and, at low tide, with possible sandy sections where conditions allow.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Visit earlier in the day in summer for a calmer beach experience.",
    "Use the clifftop areas for views and photography, but stay well away from cliff edges.",
    "Check tide and sea conditions before attempting any coastal walk along the sand.",
    "Bring water and sun protection, especially outside the main summer service period.",
    "Combine the visit with Praia do Vau, Ponta de João d’Arens or the Rocha-Alemão walking route."
  ],
  "photography_notes": "The strongest photography angles are from the clifftops, with views across the sand, pine-covered slopes, rock formations and the Portimão coastline. Early morning and late afternoon light are especially useful for softer cliff colours.",
  "family_notes": "Families may enjoy the beach during calm conditions, especially when seasonal services are operating. Adults should supervise children closely near cliffs, rocks, waves and any tide-sensitive sections.",
  "safety_notes": "Do not stand or sit directly beneath cliffs or unstable rock faces. Sea conditions can change, and visitors should follow local signs, beach flags and lifeguard guidance. Low-tide walking routes should only be attempted when conditions are safe.",
  "accessibility_notes": "Accessibility information is not fully verified. Visitors with reduced mobility should confirm current access conditions, parking, beach approach and seasonal assistance before visiting.",
  "seo": {
    "meta_title": "Praia do Alemão, Portimão | Algarve Beach",
    "meta_description": "Visit Praia do Alemão in Portimão, a popular cliff-backed Algarve beach beside Vau with pine views, coastal walks and natural scenery.",
    "keywords": [
      "Praia do Alemão",
      "Praia do Alemão Portimão",
      "Praia do Barranco das Canas",
      "Portimão beach",
      "Algarve beach",
      "Portugal beaches",
      "Praia do Vau",
      "Ponta de João d’Arens",
      "Varandas Sobre o Mar",
      "Rocha-Alemão walk"
    ]
  },
  "sources_used": [
    {
      "source_name": "Visit Portimão – Praia do Alemão",
      "source_url": "https://visitportimao.com/praias/praia-do-alemao/",
      "facts_verified": [
        "Beach name and Portimão tourism listing",
        "Praia do Alemão is bounded by Ponta de João d’Arens to the west and Praia do Vau to the east",
        "Pine grove above the cliff",
        "Natural setting and beach character",
        "Facilities listed: beach support, lifeguard, first-aid post, WC and sunshade area",
        "Connection to the Varandas Sobre o Mar route"
      ]
    },
    {
      "source_name": "Visit Portimão – Praia do Alemão English page",
      "source_url": "https://visitportimao.com/en/beaches/praia-do-alemao/",
      "facts_verified": [
        "English confirmation of landscape, pine grove, natural surroundings and neighbouring features",
        "Beach facilities list",
        "Varandas Sobre o Mar route context"
      ]
    },
    {
      "source_name": "Junta de Freguesia de Portimão – Praia Barranco das Canas (Alemão)",
      "source_url": "https://www.jf-portimao.pt/praia-barranco-das-canas-alemao/",
      "facts_verified": [
        "Alternative / official local name: Praia Barranco das Canas (Alemão)",
        "Location beside Praia do Vau",
        "Limited infrastructure",
        "Bar and concession area",
        "Beach surveillance noted"
      ]
    },
    {
      "source_name": "Visit Portimão – Passeio Rocha-Alemão",
      "source_url": "https://visitportimao.com/o-que-fazer/natureza/passeio-rocha-alemao/",
      "facts_verified": [
        "Official walking route between Praia da Rocha and Praia do Alemão",
        "Miocene limestone cliffs",
        "Arches, caves and fossil-bearing rock formations",
        "Birdlife around the cliffs",
        "Low-tide sandy walking possibility between Praia da Rocha and Praia do Alemão"
      ]
    },
    {
      "source_name": "Câmara Municipal de Portimão – Qualidade da Água Balnear das Praias de Portimão",
      "source_url": "https://www.cm-portimao.pt/menus/servicos/ambiente/praias-do-concelho/qualidade-da-agua-balnear-das-praias-de-portimao",
      "facts_verified": [
        "Alemão - Barranco Canas bathing-water identification",
        "Bathing-water code Barranco das Canas PTCX2T",
        "2023 water-quality classification listed as Excelente",
        "Page updated on 04 November 2025"
      ]
    },
    {
      "source_name": "Autoridade Marítima Nacional – Capitania do Porto de Portimão",
      "source_url": "https://www.amn.pt/DGAM/Capitanias/Portimao/Paginas/Capitania-do-porto-de-Portimao.aspx",
      "facts_verified": [
        "Official maritime-authority reference to Praia do Barranco das Canas in Portimão",
        "Official reference to beach-support procedures for Praia do Barranco das Canas"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Portimão location, alternative name Barranco das Canas, neighbouring Praia do Vau, Ponta de João d’Arens and the natural cliff setting were verified from official tourism and local authority sources.",
    "Facilities are listed by official and local sources, but they should be treated as seasonal and checked locally before visiting.",
    "Blue Flag status for Praia do Alemão itself was not verified. The listing intentionally avoids claiming Blue Flag status.",
    "Coordinates were not included because no direct official coordinate source was verified during this check.",
    "Accessibility information was not fully verified. No accessible-beach claim has been added.",
    "The beach is described as popular in a cautious visitor-expectation sense due to its known Portimão location and summer beach use, not as a formal ranking or award.",
    "No third-party review, booking, map or social media platform names were used in the public listing text."
  ]
}
$json$;
begin
  v_tags := array(
    select jsonb_array_elements_text(v_category_data #> '{seo,keywords}')
  );

  select id into v_category_id
  from public.categories
  where slug = 'beaches';

  if v_category_id is null then
    raise exception 'Beaches category was not found';
  end if;

  select id into v_city_id
  from public.cities
  where slug = 'portimao';

  if v_city_id is null then
    raise exception 'Portimão city was not found';
  end if;

  select id, slug, tier, category_id
    into v_listing_id, v_old_slug, v_existing_tier, v_existing_category_id
  from public.listings
  where slug = v_slug
     or lower(name) = lower(v_name)
  order by case when slug = v_slug then 0 else 1 end, updated_at desc
  limit 1;

  if v_listing_id is not null and (
    v_existing_tier is distinct from 'verified'::public.listing_tier
    or v_existing_category_id is distinct from v_category_id
  ) then
    update public.listings
    set
      slug = v_slug || '-legacy-' || left(v_listing_id::text, 8),
      status = 'archived'::public.listing_status,
      updated_at = now()
    where id = v_listing_id;

    if to_regclass('public.listing_slugs') is not null then
      delete from public.listing_slugs
      where slug = v_slug;
    end if;

    v_listing_id := null;
    v_old_slug := null;
  end if;

  if v_listing_id is null then
    insert into public.listings (
      name,
      slug,
      description,
      short_description,
      owner_id,
      category_id,
      city_id,
      region_id,
      tier,
      status,
      is_curated,
      website_url,
      address,
      latitude,
      longitude,
      tags,
      category_data,
      meta_title,
      meta_description,
      published_at
    ) values (
      v_name,
      v_slug,
      btrim(v_category_data->>'full_description'),
      btrim(v_category_data->>'short_description'),
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'verified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      v_website_url,
      v_address,
      v_latitude,
      v_longitude,
      v_tags,
      v_category_data,
      v_category_data #>> '{seo,meta_title}',
      v_category_data #>> '{seo,meta_description}',
      now()
    )
    returning id into v_listing_id;
  else
    update public.listings
    set
      name = v_name,
      slug = v_slug,
      description = btrim(v_category_data->>'full_description'),
      short_description = btrim(v_category_data->>'short_description'),
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'verified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = v_website_url,
      contact_phone = null,
      contact_email = null,
      whatsapp_number = null,
      instagram_url = null,
      facebook_url = null,
      linkedin_url = null,
      twitter_url = null,
      youtube_url = null,
      tiktok_url = null,
      telegram_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      address = v_address,
      latitude = v_latitude,
      longitude = v_longitude,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = v_tags,
      category_data = v_category_data,
      meta_title = v_category_data #>> '{seo,meta_title}',
      meta_description = v_category_data #>> '{seo,meta_description}',
      published_at = coalesce(published_at, now()),
      updated_at = now()
    where id = v_listing_id;
  end if;

  if to_regclass('public.listing_slugs') is not null then
    update public.listing_slugs
    set is_current = false
    where listing_id = v_listing_id
      and slug <> v_slug;

    if v_old_slug is not null and v_old_slug <> v_slug then
      insert into public.listing_slugs (listing_id, slug, is_current)
      values (v_listing_id, v_old_slug, false)
      on conflict (slug) do update set
        listing_id = excluded.listing_id,
        is_current = false
      where public.listing_slugs.listing_id = excluded.listing_id;
    end if;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, v_slug, true)
    on conflict (slug) do update set
      listing_id = excluded.listing_id,
      is_current = true
    where public.listing_slugs.listing_id = excluded.listing_id;
  end if;
end $$;

commit;
