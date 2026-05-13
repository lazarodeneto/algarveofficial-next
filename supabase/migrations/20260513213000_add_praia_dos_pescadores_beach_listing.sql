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
  'Albufeira',
  'albufeira',
  'Central Algarve resort city with an old town, marina, urban beaches and lively visitor services.',
  37.088991,
  -8.252283,
  true,
  false
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
  v_slug text := 'praia-dos-pescadores-albufeira';
  v_name text := 'Praia dos Pescadores';
  v_short_description text := $short$
Praia dos Pescadores is a central urban beach in Albufeira, set directly in front of the historic town centre. Known for its fishing-boat heritage, easy access and lively seafront, it is one of the city's highest-footfall beach areas.
$short$;
  v_description text := $description$
Praia dos Pescadores is one of Albufeira's most recognisable city beaches, positioned on the central stretch of sand directly in front of the historic town centre. Official tourism sources describe it as part of the broad sandy beach facing Albufeira, with a picturesque character shaped by the colourful artisanal fishing boats traditionally found towards its eastern side.

This is a beach for visitors who want convenience, atmosphere and immediate access to the old town rather than a remote coastal escape. The surrounding area includes restaurants, cafes, bars, event spaces and tourist services, while official local tourism information confirms access by panoramic lift, stairways, ramps and the tunnel linking the old town to the beach.

Because of its central position, Praia dos Pescadores can experience very high tourist footfall, particularly in summer, during events and around the easiest access points. The beach works well for families, short beach visits, city-based stays and visitors who want to combine beach time with Albufeira's historic centre, viewpoints and seafront dining.

Although facilities are strong, visitors should treat services as seasonal where relevant and check current beach information before travelling. Sea conditions can vary, and local flags, signage and safety guidance should always be followed. The 2026 Blue Flag list checked during research did not include Praia dos Pescadores, so current Blue Flag status should not be claimed without fresh official confirmation.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia dos Pescadores",
  "slug": "praia-dos-pescadores-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia dos Pescadores is a central urban beach in Albufeira, set directly in front of the historic town centre. Known for its fishing-boat heritage, easy access and lively seafront, it is one of the city's highest-footfall beach areas.",
  "full_description": "Praia dos Pescadores is one of Albufeira's most recognisable city beaches, positioned on the central stretch of sand directly in front of the historic town centre. Official tourism sources describe it as part of the broad sandy beach facing Albufeira, with a picturesque character shaped by the colourful artisanal fishing boats traditionally found towards its eastern side.\n\nThis is a beach for visitors who want convenience, atmosphere and immediate access to the old town rather than a remote coastal escape. The surrounding area includes restaurants, cafes, bars, event spaces and tourist services, while official local tourism information confirms access by panoramic lift, stairways, ramps and the tunnel linking the old town to the beach.\n\nBecause of its central position, Praia dos Pescadores can experience very high tourist footfall, particularly in summer, during events and around the easiest access points. The beach works well for families, short beach visits, city-based stays and visitors who want to combine beach time with Albufeira's historic centre, viewpoints and seafront dining.\n\nAlthough facilities are strong, visitors should treat services as seasonal where relevant and check current beach information before travelling. Sea conditions can vary, and local flags, signage and safety guidance should always be followed. The 2026 Blue Flag list checked during research did not include Praia dos Pescadores, so current Blue Flag status should not be claimed without fresh official confirmation.",
  "coordinates": {
    "latitude": 37.088991,
    "longitude": -8.252283,
    "notes": "Coordinates were taken from the ABAAE Pescadores page checked during research."
  },
  "beach_type": "Central sandy urban maritime beach",
  "landscape": "A wide sandy beach backed by Albufeira's whitewashed historic centre, warm coastal cliffs, promenade areas and traditional fishing boats.",
  "access": "Access is verified from the city centre, with official local tourism information listing a panoramic lift, stairways, ramps and the tunnel connecting the old town to the beach. Visitors should confirm the most suitable access point before travelling, especially if mobility support is required.",
  "highlights": [
    "Central Albufeira beach directly in front of the historic town centre",
    "Traditional fishing-boat heritage at the eastern side of the beach",
    "Very easy access from the old town, including lift, stairways, ramps and tunnel access",
    "Lively seafront with restaurants, cafes, bars and frequent events nearby",
    "Good for visitors who want a city beach with strong tourist infrastructure",
    "Part of Albufeira's Urban Front Beaches route"
  ],
  "best_for": [
    "Central beach days",
    "Families",
    "First-time Albufeira visitors",
    "Short beach stops",
    "Restaurants nearby",
    "City beach atmosphere",
    "Accessible beach support",
    "Photography",
    "Events nearby"
  ],
  "facilities": [
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach designation", "status": "Verified / Seasonal" },
    { "name": "Panoramic lift, stairways, ramps and tunnel access", "status": "Verified" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Water sports / nautical activities", "status": "Seasonal" },
    { "name": "Playground areas", "status": "Verified" },
    { "name": "Blue Flag 2026 status", "status": "Not verified" }
  ],
  "includes": [
    "Seasonal surveillance",
    "Accessible beach designation",
    "Panoramic lift, ramps, stairways and tunnel access",
    "Car parking",
    "Bars and restaurants",
    "Seasonal water sports"
  ],
  "important_information": {
    "best_time_to_visit": "May to October for the main beach season and lively city atmosphere. For a calmer experience, visit early in the morning, later in the afternoon or outside peak July and August periods.",
    "know_before_you_go": "This is a central Albufeira beach and can become very busy, especially in summer and during seafront events.\nOfficial tourism sources describe direct access from the city centre and strong support infrastructure.\nFacilities and beach surveillance may be seasonal and should be checked before visiting outside the main bathing season.\nABAAE's 2026 Algarve list checked during research did not include Praia dos Pescadores among Albufeira's listed Blue Flag locations.\nThe ABAAE Pescadores page checked shows 2025 bathing-season and Blue Flag-season information, so it should not be used as proof of current 2026 Blue Flag status.\nVisitors should follow local beach flags, signage and official safety guidance before entering the water.\nThe busiest areas are likely to be around the old town access points, promenade and central services.",
    "notes": [
      "This is a central Albufeira beach and can become very busy, especially in summer and during seafront events.",
      "Official tourism sources describe direct access from the city centre and strong support infrastructure.",
      "Facilities and beach surveillance may be seasonal and should be checked before visiting outside the main bathing season.",
      "ABAAE's 2026 Algarve list checked during research did not include Praia dos Pescadores among Albufeira's listed Blue Flag locations.",
      "The ABAAE Pescadores page checked shows 2025 bathing-season and Blue Flag-season information, so it should not be used as proof of current 2026 Blue Flag status.",
      "Visitors should follow local beach flags, signage and official safety guidance before entering the water.",
      "The busiest areas are likely to be around the old town access points, promenade and central services."
    ]
  },
  "important_notes": "This is a central Albufeira beach and can become very busy, especially in summer and during seafront events.\nOfficial tourism sources describe direct access from the city centre and strong support infrastructure.\nFacilities and beach surveillance may be seasonal and should be checked before visiting outside the main bathing season.\nABAAE's 2026 Algarve list checked during research did not include Praia dos Pescadores among Albufeira's listed Blue Flag locations.\nThe ABAAE Pescadores page checked shows 2025 bathing-season and Blue Flag-season information, so it should not be used as proof of current 2026 Blue Flag status.\nVisitors should follow local beach flags, signage and official safety guidance before entering the water.\nThe busiest areas are likely to be around the old town access points, promenade and central services.",
  "best_time_to_visit": "May to October for the main beach season and lively city atmosphere. For a calmer experience, visit early in the morning, later in the afternoon or outside peak July and August periods.",
  "suitable_for": [
    "Visitors staying in central Albufeira",
    "Families wanting services close by",
    "Visitors seeking a lively urban beach",
    "People combining beach time with the old town",
    "Short-stay visitors",
    "Visitors who value easy access and nearby dining"
  ],
  "not_suitable_for": [
    "Visitors seeking a quiet or remote beach",
    "Visitors who want an undeveloped natural setting",
    "Those trying to avoid high-season crowds",
    "Visitors who require guaranteed current Blue Flag status"
  ],
  "nearby_attractions": [
    {
      "name": "Albufeira Historic Centre",
      "type": "Historic town centre",
      "description": "The old town sits directly behind Praia dos Pescadores, with streets, restaurants, cafes, viewpoints and cultural points close to the beach.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Tunel / Peneco",
      "type": "Nearby beach",
      "description": "A neighbouring central Albufeira beach linked with the old town and the historic tunnel access.",
      "verification_status": "Verified"
    },
    {
      "name": "Pau da Bandeira Viewpoint",
      "type": "Viewpoint",
      "description": "A nearby elevated viewpoint overlooking the central Albufeira beach area and urban coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Rua 5 de Outubro Tunnel",
      "type": "Historic access route",
      "description": "A well-known old-town tunnel route connecting the centre with the beach area.",
      "verification_status": "Verified"
    },
    {
      "name": "Marina de Albufeira",
      "type": "Marina",
      "description": "A modern marina west of the old town, useful for walks, dining and nautical departures.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Albufeira",
    "Olhos de Agua",
    "Guia",
    "Ferreiras",
    "Armacao de Pera"
  ],
  "walking_trails_nearby": [
    {
      "name": "Albufeira Urban Front Beaches",
      "description": "A city-coast walking route linking central beach areas such as Praia dos Pescadores, Peneco and Inatel, with easy access to restaurants, shops and tourist services.",
      "verification_status": "Verified"
    },
    {
      "name": "Old Town to Praia dos Pescadores seafront walk",
      "description": "A short urban walk between Albufeira's historic centre, beach access points, promenade areas and nearby viewpoints.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in peak summer if you want easier access to the most convenient beach areas.",
    "Expect a lively city-beach environment rather than a secluded beach day.",
    "Use the lift, ramps, stairways or tunnel depending on your starting point and mobility needs.",
    "Check current beach flags and local signage before swimming.",
    "For quieter photographs, visit in the morning before the main tourist flow builds.",
    "Combine the beach with Albufeira old town, Peneco, the viewpoints or the marina."
  ],
  "photography_notes": "Praia dos Pescadores photographs well from the sand, promenade and elevated old-town viewpoints, with fishing boats, whitewashed buildings and golden beach scenery giving a strong Albufeira identity.",
  "family_notes": "The beach can suit families who want services, dining and easy city access close by. Families should still plan around summer crowds, active beach areas and changing sea conditions.",
  "safety_notes": "Praia dos Pescadores has official sources listing surveillance and support services, but these may be seasonal. Follow local flags, signage and safety instructions, and take care during crowded periods and events.",
  "accessibility_notes": "Official tourism sources list accessible-beach status and local access by lift, ramps, stairways and tunnel. Visitors with reduced mobility should confirm current access conditions and seasonal support before visiting.",
  "seo": {
    "meta_title": "Praia dos Pescadores, Albufeira | Beach Guide",
    "meta_description": "Praia dos Pescadores in Albufeira is a central urban beach with fishing heritage, easy old-town access, facilities and high summer footfall.",
    "keywords": [
      "Praia dos Pescadores",
      "Praia dos Pescadores Albufeira",
      "Fishermen's Beach Albufeira",
      "Albufeira beaches",
      "central Albufeira beach",
      "Algarve beaches",
      "Portugal beaches",
      "urban beach Algarve",
      "Albufeira old town beach",
      "Praia do Peneco nearby"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia dos Pescadores trip ideas",
      "links": [
        { "label": "Praia dos Pescadores" },
        { "label": "Fishermen's Beach Albufeira" },
        { "label": "Albufeira beaches" },
        { "label": "central Albufeira beach" },
        { "label": "Albufeira old town beach" },
        { "label": "urban beach Algarve" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Albufeira Historic Centre" },
        { "label": "Praia do Tunel / Peneco" },
        { "label": "Pau da Bandeira Viewpoint" },
        { "label": "Rua 5 de Outubro Tunnel" },
        { "label": "Marina de Albufeira" },
        { "label": "Albufeira Urban Front Beaches" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia dos Pescadores",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-dos-pescadores",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Albufeira",
        "Central position on the sandy beach in front of Albufeira",
        "Fishing boats at the eastern end",
        "Direct city-centre access",
        "Busy beach character",
        "Support infrastructure",
        "Restaurants and bars nearby",
        "Facilities listed including surveillance, sunshade rental, parking, bar, restaurant, windsurf and accessible beach"
      ]
    },
    {
      "source_name": "Visit Albufeira - Fishermen's Beach",
      "source_url": "https://visitalbufeira.pt/praia/praia-dos-pescadores",
      "facts_verified": [
        "Direct location in front of the historic town centre",
        "Historic fishing harbour character",
        "Traditional boats on the sand",
        "Lively atmosphere with restaurants, cafes and cultural events along the promenade",
        "Access by panoramic lift, stairways, ramps and tunnel",
        "Facilities including lifeguards, water sports, playgrounds, showers and dining options"
      ]
    },
    {
      "source_name": "Visit Albufeira - Urban Front Beaches",
      "source_url": "https://visitalbufeira.pt/experiencias/praias-da-frente-urbana/",
      "facts_verified": [
        "Praia dos Pescadores as one of Albufeira's Urban Front Beaches",
        "Central location near the historic centre and lively areas",
        "Easy access to shops, restaurants and tourist services",
        "Urban beach route context with Peneco and Inatel"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Pescadores",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/pescadores/",
      "facts_verified": [
        "Official Pescadores beach entry",
        "Municipality of Albufeira",
        "Coordinates",
        "Coastal beach classification",
        "2025 bathing-season information",
        "2025 Blue Flag-season information",
        "Blue Flag shown as not hoisted on the checked page"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "2026 Algarve Blue Flag listings checked",
        "Albufeira 2026 listed locations checked",
        "Praia dos Pescadores not found among the Albufeira 2026 Blue Flag locations during verification"
      ]
    },
    {
      "source_name": "Camara Municipal de Albufeira - 2025 Praia Acessivel table",
      "source_url": "https://www.cm-albufeira.pt/sites/default/files/inline-files/Tabela%20Praias%20Acess%C3%ADveis_2025.pdf",
      "facts_verified": [
        "Pescadores listed in the 2025 accessible beach table",
        "Accessible-beach recognition counted for Praia dos Pescadores up to 2025"
      ]
    },
    {
      "source_name": "VisitPortugal - Albufeira e as praias",
      "source_url": "https://www.visitportugal.com/pt-pt/destinos/algarve/73802",
      "facts_verified": [
        "Albufeira beach context",
        "Pescadores, Tunel, Alemaes and Inatel as city beaches accessible on foot",
        "Escalator access from upper town towards Praia dos Pescadores",
        "Albufeira old-town, restaurants, marina and nightlife context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Albufeira municipality, central location, fishing-boat heritage, direct city access and busy character were verified from official tourism sources.",
    "The phrase very high tourist footfall is used cautiously as an editorial description based on official descriptions of the beach as central, very busy and directly connected with Albufeira's historic tourist area.",
    "Facilities are included only where listed by official tourism sources and marked Seasonal where operation may depend on the bathing season or concessions.",
    "ABAAE's 2026 Blue Flag list checked during research did not include Praia dos Pescadores among Albufeira's listed 2026 Blue Flag locations; current Blue Flag status is therefore marked Not verified.",
    "The ABAAE Pescadores page checked shows 2025 season data and coordinates, so it was used for location verification and historic season context, not as proof of 2026 Blue Flag status.",
    "Accessibility is supported by official tourism and municipal accessible-beach information, but visitors should still confirm current seasonal support and the most suitable access point before visiting.",
    "No prohibited third-party platform names, public review scores or unsupported ranking claims were included in the public listing text."
  ]
}
$json$;
begin
  select id into v_category_id
  from public.categories
  where slug = 'beaches'
  limit 1;

  if v_category_id is null then
    raise exception 'Required category beaches was not found';
  end if;

  select id into v_city_id
  from public.cities
  where slug = 'albufeira'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city albufeira was not found';
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
      btrim(v_description),
      btrim(v_short_description),
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'verified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://www.visitportugal.com/pt-pt/content/praia-dos-pescadores',
      'Praia dos Pescadores, Albufeira, Algarve, Portugal',
      37.088991,
      -8.252283,
      array[
        'Praia dos Pescadores',
        'Praia dos Pescadores Albufeira',
        'Fishermen''s Beach Albufeira',
        'Albufeira beaches',
        'central Albufeira beach',
        'Algarve beaches',
        'Portugal beaches',
        'urban beach Algarve',
        'Albufeira old town beach',
        'Praia do Peneco nearby'
      ],
      v_category_data,
      'Praia dos Pescadores, Albufeira | Beach Guide',
      'Praia dos Pescadores in Albufeira is a central urban beach with fishing heritage, easy old-town access, facilities and high summer footfall.',
      now()
    )
    returning id into v_listing_id;
  else
    update public.listings
    set
      name = v_name,
      slug = v_slug,
      description = btrim(v_description),
      short_description = btrim(v_short_description),
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'verified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = 'https://www.visitportugal.com/pt-pt/content/praia-dos-pescadores',
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
      address = 'Praia dos Pescadores, Albufeira, Algarve, Portugal',
      latitude = 37.088991,
      longitude = -8.252283,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia dos Pescadores',
        'Praia dos Pescadores Albufeira',
        'Fishermen''s Beach Albufeira',
        'Albufeira beaches',
        'central Albufeira beach',
        'Algarve beaches',
        'Portugal beaches',
        'urban beach Algarve',
        'Albufeira old town beach',
        'Praia do Peneco nearby'
      ],
      category_data = v_category_data,
      meta_title = 'Praia dos Pescadores, Albufeira | Beach Guide',
      meta_description = 'Praia dos Pescadores in Albufeira is a central urban beach with fishing heritage, easy old-town access, facilities and high summer footfall.',
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
