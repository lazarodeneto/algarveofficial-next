begin;

insert into public.categories (name, slug, icon, display_order, is_active, is_featured)
values ('Beaches', 'beaches', 'Umbrella', 30, true, true)
on conflict (slug) do update set
  name = excluded.name,
  icon = coalesce(public.categories.icon, excluded.icon),
  is_active = true,
  updated_at = now();

insert into public.cities (name, slug, short_description, is_active, is_featured)
values (
  'Caramujeira',
  'caramujeira',
  'Small Lagoa coastal locality close to Praia da Marinha and the central Algarve cliffs.',
  true,
  false
)
on conflict (slug) do update set
  name = excluded.name,
  short_description = coalesce(public.cities.short_description, excluded.short_description),
  is_active = true,
  updated_at = now();

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_listing_id uuid;
  v_old_slug text;
  v_category_id uuid;
  v_city_id uuid;
  v_region_id uuid := null;
  v_slug text := 'praia-da-marinha-lagoa';
  v_name text := 'Praia da Marinha';
  v_short_description text := 'Praia da Marinha is a cliff-framed beach in Lagoa, near Caramujeira, known for its limestone formations, clear coastal scenery, and dramatic viewpoints above the Atlantic.';
  v_description text := 'Praia da Marinha sits on the central Algarve coast in the municipality of Lagoa, close to Caramujeira and Carvoeiro. It is one of the region''s most recognisable cliff beaches, with a compact sandy cove enclosed by high limestone cliffs shaped by coastal erosion. The setting is especially valued for its elevated viewpoints, sea stacks, arches, and the contrast between golden rock and clear Atlantic water.' || E'\n\n' ||
    'Visitors normally experience Praia da Marinha in two ways: from the cliff-top viewpoints above the beach, and from the sand below after descending the long stairway. The beach is maritime in character and relatively enclosed, but sea conditions can vary and visitors should always follow local signage before entering the water. The surrounding cliff landscape makes it particularly appealing for photography, coastal walks, and exploring the Lagoa coastline at a slower pace.' || E'\n\n' ||
    'Praia da Marinha is also a key point on the Seven Hanging Valleys Trail, an official walking route linking Praia da Marinha with Praia de Vale Centeanes. This makes it a strong choice for visitors who want to combine beach time with one of the Algarve''s most scenic coastal walks. In high season, the beach and cliff viewpoints can become busy, so early morning or later afternoon visits are often more comfortable. Access involves stairs and cliff terrain, so it may not suit visitors with reduced mobility.';
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Marinha",
  "slug": "praia-da-marinha-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Caramujeira",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Marinha is a cliff-framed beach in Lagoa, near Caramujeira, known for its limestone formations, clear coastal scenery, and dramatic viewpoints above the Atlantic.",
  "full_description": "Praia da Marinha sits on the central Algarve coast in the municipality of Lagoa, close to Caramujeira and Carvoeiro. It is one of the region's most recognisable cliff beaches, with a compact sandy cove enclosed by high limestone cliffs shaped by coastal erosion. The setting is especially valued for its elevated viewpoints, sea stacks, arches, and the contrast between golden rock and clear Atlantic water.\n\nVisitors normally experience Praia da Marinha in two ways: from the cliff-top viewpoints above the beach, and from the sand below after descending the long stairway. The beach is maritime in character and relatively enclosed, but sea conditions can vary and visitors should always follow local signage before entering the water. The surrounding cliff landscape makes it particularly appealing for photography, coastal walks, and exploring the Lagoa coastline at a slower pace.\n\nPraia da Marinha is also a key point on the Seven Hanging Valleys Trail, an official walking route linking Praia da Marinha with Praia de Vale Centeanes. This makes it a strong choice for visitors who want to combine beach time with one of the Algarve's most scenic coastal walks. In high season, the beach and cliff viewpoints can become busy, so early morning or later afternoon visits are often more comfortable. Access involves stairs and cliff terrain, so it may not suit visitors with reduced mobility.",
  "coordinates": {
    "latitude": 37.0899083,
    "longitude": -8.41168888888889
  },
  "beach_type": "Maritime cliff beach",
  "landscape": "Compact sandy cove enclosed by high limestone cliffs, with sea stacks, eroded rock formations, and elevated coastal viewpoints.",
  "access": "Road access is available via tarmacked routes from Lagoa or the EN125 according to Visit Algarve. Access from the cliff-top area down to the beach involves a long stairway verified by VisitPortugal.",
  "highlights": [
    "High limestone cliffs shaped by erosion",
    "Cliff-top viewpoints above the beach",
    "Natural sea stacks and coastal rock formations",
    "Eastern starting or finishing point for the Seven Hanging Valleys Trail",
    "Strong photography appeal from both the sand and the cliffs"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Couples",
    "Coastal walks",
    "Nature lovers",
    "Swimming when conditions are suitable"
  ],
  "suitable_for": [
    "Photographers",
    "Couples",
    "Nature-focused visitors",
    "Coastal walkers",
    "Visitors comfortable with stairs"
  ],
  "not_suitable_for": [
    "Visitors who cannot manage stairs",
    "Visitors seeking fully verified accessible beach access",
    "Visitors looking for a large, open sandy beach"
  ],
  "facilities": [
    { "name": "Parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified" },
    { "name": "Restaurant", "status": "Verified" },
    { "name": "Showers", "status": "Verified" },
    { "name": "Sunshade / beach umbrella rental", "status": "Verified" },
    { "name": "Light boat rental", "status": "Verified" },
    { "name": "Lifeguard / supervision", "status": "Verified by VisitPortugal, season not independently confirmed" }
  ],
  "includes": [
    "Parking",
    "Bar",
    "Restaurant",
    "Showers",
    "Sunshade / beach umbrella rental",
    "Light boat rental",
    "Lifeguard / supervision"
  ],
  "important_information": {
    "best_time_to_visit": "Spring, early summer, and early autumn are generally preferable for coastal walks and photography. In July and August, early morning or later afternoon visits are more comfortable due to seasonal demand.",
    "know_before_you_go": "Access to the sand involves a long stairway from the cliff-top area.\nThe cliff-top viewpoints offer strong coastal views, but visitors should keep to safe areas and avoid cliff edges.\nSea conditions can vary; visitors should check local signage before swimming.\nFacilities and services may operate seasonally and should be confirmed before visiting.\nPraia da Marinha does not appear on the official 2026 Blue Flag awarded list for Lagoa, although several other Lagoa beaches are listed.",
    "notes": [
      "Access to the sand involves a long stairway from the cliff-top area.",
      "The cliff-top viewpoints offer strong coastal views, but visitors should keep to safe areas and avoid cliff edges.",
      "Sea conditions can vary; visitors should check local signage before swimming.",
      "Facilities and services may operate seasonally and should be confirmed before visiting.",
      "Praia da Marinha does not appear on the official 2026 Blue Flag awarded list for Lagoa, although several other Lagoa beaches are listed."
    ]
  },
  "important_notes": "Access to the sand involves a long stairway from the cliff-top area.\nThe cliff-top viewpoints offer strong coastal views, but visitors should keep to safe areas and avoid cliff edges.\nSea conditions can vary; visitors should check local signage before swimming.\nFacilities and services may operate seasonally and should be confirmed before visiting.\nPraia da Marinha does not appear on the official 2026 Blue Flag awarded list for Lagoa, although several other Lagoa beaches are listed.",
  "best_time_to_visit": "Spring, early summer, and early autumn are generally preferable for coastal walks and photography. In July and August, early morning or later afternoon visits are more comfortable due to seasonal demand.",
  "nearby_attractions": [
    {
      "name": "Seven Hanging Valleys Trail",
      "type": "Walking trail",
      "description": "An official coastal trail of around 5.7 km connecting Praia da Marinha with Praia de Vale Centeanes, passing cliff scenery and hanging valleys.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Vale Centeanes",
      "type": "Beach",
      "description": "A Lagoa beach at the western end of the Seven Hanging Valleys Trail.",
      "verification_status": "Verified"
    },
    {
      "name": "Carvoeiro",
      "type": "Town",
      "description": "A nearby coastal town in Lagoa, useful as a base for exploring the central Algarve coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Senhora da Rocha",
      "type": "Beach / coastal landmark",
      "description": "A nearby Lagoa coastal area listed among the municipality's 2026 Blue Flag beaches.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Caramujeira",
    "Carvoeiro",
    "Lagoa",
    "Armação de Pêra"
  ],
  "walking_trails_nearby": [
    {
      "name": "Seven Hanging Valleys Trail",
      "description": "Official Lagoa coastal walking route linking Praia da Marinha and Praia de Vale Centeanes, with cliff scenery, ravines, and sea views.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in the warmer months for a quieter experience at the viewpoints and beach access.",
    "Wear suitable footwear if combining the beach with the Seven Hanging Valleys Trail.",
    "Allow time to enjoy the cliff-top views before descending to the sand.",
    "Check sea and beach signage locally, especially before swimming or approaching rock formations."
  ],
  "photography_notes": "Praia da Marinha is especially strong for elevated cliff photography, limestone textures, sea stacks, and late-afternoon coastal light. Visitors should stay back from cliff edges and use marked viewpoints where available.",
  "family_notes": "The beach may appeal to families who are comfortable with stairs and cliff-top terrain. Parents should supervise children closely near cliffs, steps, rocks, and the waterline.",
  "safety_notes": "Access involves stairs and the surrounding cliffs require caution. Sea conditions can vary, and visitors should follow local signage and any instructions from beach supervision when present.",
  "accessibility_notes": "Accessibility information is not fully verified. Because access to the beach involves a long stairway, visitors with reduced mobility should confirm current access conditions before visiting.",
  "blue_flag": {
    "year": 2026,
    "awarded": false,
    "notes": "Praia da Marinha does not appear on the official 2026 Blue Flag awarded list for Lagoa, although several other Lagoa beaches are listed."
  },
  "seo": {
    "meta_title": "Praia da Marinha, Lagoa | Algarve Beach Guide",
    "meta_description": "Guide to Praia da Marinha in Lagoa, Algarve: limestone cliffs, viewpoints, beach access, facilities, nearby trails, visitor tips and safety notes.",
    "keywords": [
      "Praia da Marinha",
      "Praia da Marinha Lagoa",
      "Lagoa Algarve beaches",
      "Algarve Portugal",
      "Caramujeira beach",
      "Seven Hanging Valleys Trail",
      "Algarve cliff beaches",
      "Portugal beach guide"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Nearby attractions",
      "links": [
        { "label": "Seven Hanging Valleys Trail" },
        { "label": "Praia de Vale Centeanes" },
        { "label": "Carvoeiro" },
        { "label": "Praia da Senhora da Rocha" }
      ]
    },
    {
      "title": "Nearby towns",
      "links": [
        { "label": "Caramujeira" },
        { "label": "Carvoeiro" },
        { "label": "Lagoa" },
        { "label": "Armação de Pêra" }
      ]
    },
    {
      "title": "Best for",
      "links": [
        { "label": "Scenic views" },
        { "label": "Photography" },
        { "label": "Coastal walks" },
        { "label": "Nature lovers" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Marinha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-marinha",
      "facts_verified": [
        "Confirms Praia da Marinha as a maritime beach in Lagoa / Caramujeira.",
        "Verifies the high cliff landscape shaped by erosion.",
        "Verifies long stairway access from the cliff-top area.",
        "Lists parking, bar, restaurant, showers, sunshade rental, light boat rental, and security/supervision as beach characteristics/services."
      ]
    },
    {
      "source_name": "Visit Algarve - Praia da Marinha",
      "source_url": "https://visitalgarve.pt/equipamento/8745/Praia%20da%20Marinha",
      "facts_verified": [
        "Verifies tarmacked road access from Lagoa or from the EN125.",
        "Verifies official Algarve tourism listing for Praia da Marinha."
      ]
    },
    {
      "source_name": "Visit Algarve - Praia da Marinha Spanish listing",
      "source_url": "https://visitalgarve.pt/es/equipamento/8745/praia-da-marinha",
      "facts_verified": [
        "Verifies coordinates as 37.0899083, -8.41168888888889.",
        "Verifies address area as Vale de Engenhos, Carvoeiro, Lagoa."
      ]
    },
    {
      "source_name": "Welcome to Lagoa - Seven Hanging Valleys Trail",
      "source_url": "https://welcometolagoa.pt/en/288/seven-hanging-valleys-trail",
      "facts_verified": [
        "Verifies the Seven Hanging Valleys Trail distance as 5.7 km.",
        "Verifies the route connects Praia de Vale Centeanes with Praia da Marinha."
      ]
    },
    {
      "source_name": "Visit Algarve - Seven Hanging Valleys Trail",
      "source_url": "https://visitalgarve.pt/en/3593/percurso-dos-sete-vales-suspensos.aspx",
      "facts_verified": [
        "Verifies the trail as an official Algarve tourism route and describes its hanging valley coastal landscape."
      ]
    },
    {
      "source_name": "Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Verifies the 2026 Blue Flag awarded beaches listed for Lagoa. Praia da Marinha is not listed among the six Lagoa beaches shown."
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, region, cliff landscape, access by stairway, and several facilities were verified from VisitPortugal and Visit Algarve.",
    "Coordinates were taken from the official Visit Algarve listing.",
    "The Seven Hanging Valleys Trail connection was verified from official Lagoa / Algarve tourism sources.",
    "Current Blue Flag status was not added as a positive claim. The official 2026 Blue Flag list for Lagoa does not include Praia da Marinha.",
    "Exact operating dates for facilities, lifeguard/supervision periods, beach concession details, dog rules, and accessibility status should be manually checked before publication.",
    "Some information could not be verified from authoritative sources. I have left those fields blank or marked them as Not verified."
  ]
}
$json$::jsonb;
begin
  select id into v_category_id
  from public.categories
  where slug = 'beaches'
  limit 1;

  select id into v_city_id
  from public.cities
  where slug = 'caramujeira'
  limit 1;

  if v_category_id is null then
    raise exception 'Required category beaches was not found';
  end if;

  if v_city_id is null then
    raise exception 'Required city caramujeira was not found';
  end if;

  select id, slug
    into v_listing_id, v_old_slug
  from public.listings
  where slug = v_slug
     or lower(name) = lower(v_name)
  order by case when slug = v_slug then 0 else 1 end, updated_at desc
  limit 1;

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
      v_description,
      v_short_description,
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'verified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://www.visitportugal.com/pt-pt/content/praia-da-marinha',
      'Praia da Marinha, Caramujeira, Lagoa, Algarve, Portugal',
      37.0899083,
      -8.41168888888889,
      array[
        'Praia da Marinha',
        'Lagoa Algarve beaches',
        'Caramujeira beach',
        'Seven Hanging Valleys Trail',
        'Algarve cliff beaches',
        'coastal walks',
        'photography',
        'nature'
      ],
      v_category_data,
      'Praia da Marinha, Lagoa | Algarve Beach Guide',
      'Guide to Praia da Marinha in Lagoa, Algarve: limestone cliffs, viewpoints, beach access, facilities, nearby trails, visitor tips and safety notes.',
      now()
    )
    returning id into v_listing_id;
  else
    update public.listings
    set
      name = v_name,
      slug = v_slug,
      description = v_description,
      short_description = v_short_description,
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'verified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = 'https://www.visitportugal.com/pt-pt/content/praia-da-marinha',
      contact_phone = null,
      contact_email = null,
      whatsapp_number = null,
      instagram_url = null,
      facebook_url = null,
      linkedin_url = null,
      twitter_url = null,
      youtube_url = null,
      tiktok_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      address = 'Praia da Marinha, Caramujeira, Lagoa, Algarve, Portugal',
      latitude = 37.0899083,
      longitude = -8.41168888888889,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia da Marinha',
        'Lagoa Algarve beaches',
        'Caramujeira beach',
        'Seven Hanging Valleys Trail',
        'Algarve cliff beaches',
        'coastal walks',
        'photography',
        'nature'
      ],
      category_data = v_category_data,
      meta_title = 'Praia da Marinha, Lagoa | Algarve Beach Guide',
      meta_description = 'Guide to Praia da Marinha in Lagoa, Algarve: limestone cliffs, viewpoints, beach access, facilities, nearby trails, visitor tips and safety notes.',
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
