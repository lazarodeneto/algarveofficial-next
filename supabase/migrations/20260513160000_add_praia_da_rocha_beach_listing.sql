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
  'Portimão',
  'portimao',
  'Portimão coastal city and resort area including Praia da Rocha, the Arade riverfront and nearby marina.',
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
  v_existing_tier public.listing_tier;
  v_existing_category_id uuid;
  v_category_id uuid;
  v_city_id uuid;
  v_region_id uuid := null;
  v_slug text := 'praia-da-rocha-portimao';
  v_name text := 'Praia da Rocha';
  v_short_description text := $short$
Praia da Rocha is a major resort beach in Portimão, set beside the mouth of the River Arade and backed by warm-toned cliffs. It is one of the Algarve's busiest and best-known seaside settings, with a long sandy shore, boardwalk access and a lively resort atmosphere.
$short$;
  v_description text := $description$
Praia da Rocha is Portimão's landmark resort beach, located beside the mouth of the River Arade and close to the marina. Official sources describe it as a maritime beach with a large sandy shore, distinctive rock formations and a long-standing reputation as one of southern Portugal's most frequented bathing resorts. The setting is broad and open rather than hidden or secluded: a wide stretch of sand sits below warm-toned cliffs, with viewpoints above, a seafront avenue, hotels, restaurants, bars, a casino and marina access forming the wider visitor environment. VisitPortugal describes the beach as around 3 km, while Portimão tourism sources describe the sand as extending for more than 1 km; for publication, it is safest to describe it as a long, spacious beach rather than use one fixed measurement. Praia da Rocha is well suited to visitors who want a classic Algarve resort beach with facilities, beach sports, viewpoints and easy access to Portimão's coastal attractions. The municipality references a broad boardwalk running along the beach and connections between the sand, marginal and marina. Official sources also list parking, restaurants, bars, showers, sunshade rental, light boat rental, windsurfing, surveillance, accessible beach designation and beach support facilities, though availability may vary by season and specific access point. Nearby route ideas include the Fortaleza de Santa Catarina, Miradouro dos Três Castelos, Praia dos Três Castelos, Praia da Marina de Portimão and the Portimão riverside area.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Rocha",
  "slug": "praia-da-rocha-portimao",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Portimão",
  "concelho": "Portimão",
  "municipality": "Portimão",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Rocha is a major resort beach in Portimão, set beside the mouth of the River Arade and backed by warm-toned cliffs. It is one of the Algarve's busiest and best-known seaside settings, with a long sandy shore, boardwalk access and a lively resort atmosphere.",
  "full_description": "Praia da Rocha is Portimão's landmark resort beach, located beside the mouth of the River Arade and close to the marina. Official sources describe it as a maritime beach with a large sandy shore, distinctive rock formations and a long-standing reputation as one of southern Portugal's most frequented bathing resorts. The setting is broad and open rather than hidden or secluded: a wide stretch of sand sits below warm-toned cliffs, with viewpoints above, a seafront avenue, hotels, restaurants, bars, a casino and marina access forming the wider visitor environment. VisitPortugal describes the beach as around 3 km, while Portimão tourism sources describe the sand as extending for more than 1 km; for publication, it is safest to describe it as a long, spacious beach rather than use one fixed measurement. Praia da Rocha is well suited to visitors who want a classic Algarve resort beach with facilities, beach sports, viewpoints and easy access to Portimão's coastal attractions. The municipality references a broad boardwalk running along the beach and connections between the sand, marginal and marina. Official sources also list parking, restaurants, bars, showers, sunshade rental, light boat rental, windsurfing, surveillance, accessible beach designation and beach support facilities, though availability may vary by season and specific access point. Nearby route ideas include the Fortaleza de Santa Catarina, Miradouro dos Três Castelos, Praia dos Três Castelos, Praia da Marina de Portimão and the Portimão riverside area.",
  "coordinates": {
    "latitude": 37.11773,
    "longitude": -8.53642,
    "notes": "Coordinates are taken from the ABAAE Rocha beach profile and represent the official beach area point, not necessarily every access point along the sand."
  },
  "beach_type": "Maritime resort beach; long sandy beach backed by cliffs and rock formations.",
  "landscape": "Wide golden sand, warm-coloured cliffs, sculpted coastal rocks, seafront avenue, boardwalk and resort skyline close to Portimão Marina.",
  "access": "Official sources list access by car or motorbike and on foot. Portimão municipality describes a broad boardwalk along the beach and multiple connections between the sand, marginal and marina. VisitPortugal lists parking and accessible beach designation, but visitors should verify the most suitable access point before visiting.",
  "highlights": [
    "Large sandy resort beach beside the mouth of the River Arade",
    "Warm-toned cliffs and sculpted rock formations along the shoreline",
    "Verified as one of southern Portugal's most frequented bathing resorts by VisitPortugal",
    "Boardwalk and seafront resort setting with marina access nearby",
    "Viewpoints from Fortaleza de Santa Catarina and Miradouro dos Três Castelos",
    "Official 2026 Blue Flag and bathing season listed by ABAAE for the Rocha beach area"
  ],
  "best_for": [
    "Resort beach days",
    "Families",
    "Couples",
    "Scenic views",
    "Photography",
    "Swimming when conditions allow",
    "Beach sports",
    "Long beach walks",
    "Nightlife nearby",
    "Marina access"
  ],
  "facilities": [
    { "name": "Parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified" },
    { "name": "Restaurant", "status": "Verified" },
    { "name": "Showers", "status": "Verified" },
    { "name": "WC / public toilets", "status": "Verified" },
    { "name": "Sunshade / beach shade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Windsurfing", "status": "Seasonal" },
    { "name": "Nautical centre", "status": "Verified" },
    { "name": "Beach support facilities", "status": "Verified" },
    { "name": "First aid post", "status": "Verified" },
    { "name": "Lifeguard / beach surveillance listed by official sources", "status": "Seasonal" },
    { "name": "Accessible beach designation listed by official sources", "status": "Verified" },
    { "name": "Beach sports area", "status": "Verified" },
    { "name": "2026 Blue Flag / official bathing season listed for Rocha", "status": "Seasonal" },
    { "name": "Dog rules", "status": "Not verified" }
  ],
  "includes": [
    "Parking",
    "Bars and restaurants",
    "Showers",
    "WC / public toilets",
    "Beach support facilities",
    "First aid post",
    "Accessible beach designation",
    "Boardwalk access",
    "Beach sports area"
  ],
  "important_information": {
    "best_time_to_visit": "June to September is the main official bathing season for the Rocha beach area in 2026, according to ABAAE. May, June and September are often more comfortable for long walks and photography, while July and August bring the fullest resort atmosphere and the highest likelihood of crowds. Early morning and late afternoon are the best times for softer light on the cliffs.",
    "know_before_you_go": "This is a busy resort beach, especially during peak summer holiday periods.\nABAAE lists the 2026 bathing season and Blue Flag season for Rocha from 1 June to 30 September 2026.\nAt the time checked, the ABAAE page displayed the Blue Flag as not hoisted outside the stated season; the listing should therefore refer to seasonal Blue Flag status rather than a permanent flag display.\nFacilities, rentals, concessions and supervision may be seasonal or vary by section of the beach.\nParking is listed by VisitPortugal, but current capacity and availability were not verified.\nSea conditions can vary. Visitors should check beach flags, local signage and lifeguard instructions before entering the water.\nThe beach is backed by cliffs and rock formations. Visitors should avoid unstable cliff edges, climbing on rocks and sitting directly below cliff faces."
  },
  "important_notes": "This is a busy resort beach, especially during peak summer holiday periods.\nABAAE lists the 2026 bathing season and Blue Flag season for Rocha from 1 June to 30 September 2026.\nAt the time checked, the ABAAE page displayed the Blue Flag as not hoisted outside the stated season; the listing should therefore refer to seasonal Blue Flag status rather than a permanent flag display.\nFacilities, rentals, concessions and supervision may be seasonal or vary by section of the beach.\nParking is listed by VisitPortugal, but current capacity and availability were not verified.\nSea conditions can vary. Visitors should check beach flags, local signage and lifeguard instructions before entering the water.\nThe beach is backed by cliffs and rock formations. Visitors should avoid unstable cliff edges, climbing on rocks and sitting directly below cliff faces.",
  "best_time_to_visit": "June to September is the main official bathing season for the Rocha beach area in 2026, according to ABAAE. May, June and September are often more comfortable for long walks and photography, while July and August bring the fullest resort atmosphere and the highest likelihood of crowds. Early morning and late afternoon are the best times for softer light on the cliffs.",
  "suitable_for": [
    "Visitors looking for a classic Algarve resort beach",
    "Families who want a wide sandy beach with verified facilities nearby",
    "Couples combining beach time with restaurants, viewpoints or the marina",
    "Travellers staying in Portimão or Praia da Rocha",
    "Photographers seeking cliffs, rock formations and broad coastal views",
    "Visitors interested in beach sports and a lively seafront setting"
  ],
  "not_suitable_for": [
    "Visitors seeking a quiet or undeveloped beach",
    "Travellers wanting a small hidden cove",
    "Visitors who want to avoid resort nightlife and busy summer crowds",
    "Anyone needing guaranteed step-free access across every part of the beach without checking the current access point first"
  ],
  "nearby_attractions": [
    {
      "name": "Fortaleza de Santa Catarina de Ribamar",
      "type": "Fort / viewpoint",
      "description": "Historic fort above Praia da Rocha, built to help defend the Arade river bar and now used as a viewpoint over the beach, river and sea.",
      "verification_status": "Verified"
    },
    {
      "name": "Miradouro dos Três Castelos",
      "type": "Viewpoint",
      "description": "A viewpoint referenced by VisitPortimão as one of the main panoramic locations for looking across Praia da Rocha and the coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia dos Três Castelos",
      "type": "Beach",
      "description": "Neighbouring maritime beach next to Praia da Rocha, known for golden sand, cliffs and a connection through the rock area described by VisitPortugal.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Marina de Portimão",
      "type": "Beach",
      "description": "Small beach at the mouth of the River Arade, separated from Praia da Rocha by the west breakwater and accessible through the marina's pedestrian and cycling route.",
      "verification_status": "Verified"
    },
    {
      "name": "Marina de Portimão",
      "type": "Marina",
      "description": "Nearby marina and visitor hub at the eastern side of Praia da Rocha, referenced by official tourism sources as part of Portimão's coastal visitor area.",
      "verification_status": "Verified"
    },
    {
      "name": "Museu de Portimão",
      "type": "Museum",
      "description": "Municipal museum installed in the former Feu canning factory, presenting Portimão's territory, identity and maritime-industrial history.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Portimão",
    "Alvor",
    "Ferragudo"
  ],
  "walking_trails_nearby": [
    {
      "name": "Praia da Rocha boardwalk",
      "description": "Portimão municipality describes a broad boardwalk running along the beach, useful for a resort-side walk with access between the sand, marginal and marina.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Rocha to Portimão Marina pedestrian route",
      "description": "The nearby Praia da Marina de Portimão is described by VisitPortugal as accessible through a pedestrian and cycling route around the marina area.",
      "verification_status": "Verified"
    },
    {
      "name": "Cliff-top viewpoint walk toward Três Castelos",
      "description": "A short viewpoint-oriented route from the Praia da Rocha side toward Miradouro dos Três Castelos and Praia dos Três Castelos. Visitors should keep to safe paths and avoid cliff edges.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in peak summer if you want easier parking and more choice of beach space.",
    "Use the boardwalk for a simple orientation walk before choosing where to settle.",
    "For photography, try the Fortaleza de Santa Catarina side and Miradouro dos Três Castelos for wider views.",
    "Check beach flags and local signage before swimming, even when conditions appear calm.",
    "Treat rentals, nautical activities and beach support as seasonal unless confirmed for the day of visit.",
    "For quieter scenery, continue west toward the Três Castelos viewpoint area, while staying on safe marked paths."
  ],
  "photography_notes": "The strongest compositions are from above: Fortaleza de Santa Catarina gives views across the beach, river and marina, while Miradouro dos Três Castelos offers a western perspective over the cliffs and rock formations. Late afternoon light is especially useful for bringing out the warm tones of the rock.",
  "family_notes": "Praia da Rocha can work well for families who want a large sandy beach with verified facilities nearby, but it is also a busy resort beach. Families should choose a supervised section during the bathing season, check the flags, keep children away from cliff bases and be mindful of rocks near the waterline.",
  "safety_notes": "Sea conditions can vary and should not be assumed safe without checking the flags and local instructions. The cliff and rock landscape is part of the beach's appeal but also requires care: avoid climbing rock formations, standing near cliff edges or sitting beneath unstable-looking cliff sections.",
  "accessibility_notes": "Official sources list Praia da Rocha as an accessible beach and VisitPortimão includes Praia Acessível among its beach facilities. However, accessibility can vary by access point, tide, season and available support equipment. Visitors with reduced mobility should confirm the current accessible entrance and any assisted bathing services before visiting.",
  "blue_flag": {
    "awarded": true,
    "year": 2026,
    "bathing_season": "01/06/2026 to 30/09/2026",
    "blue_flag_season": "01/06/2026 to 30/09/2026",
    "notes": "Blue Flag information is verified for the 2026 Rocha beach area but is seasonal. At the time checked, ABAAE displayed the flag as not hoisted, so the listing avoids saying the Blue Flag is currently flying."
  },
  "seo": {
    "meta_title": "Praia da Rocha, Portimão - Algarve Resort Beach",
    "meta_description": "Praia da Rocha in Portimão: a busy Algarve resort beach with long sand, warm-toned cliffs, Blue Flag season, boardwalk access and nearby marina.",
    "keywords": [
      "Praia da Rocha",
      "Praia da Rocha Portimão",
      "Portimão beach",
      "Algarve resort beach",
      "Algarve beaches",
      "Portugal beaches",
      "Rocha beach",
      "Portimão Marina",
      "Fortaleza de Santa Catarina",
      "Três Castelos viewpoint",
      "Blue Flag beach Portimão",
      "family beach Algarve",
      "long sandy beach Algarve"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia da Rocha trip ideas",
      "links": [
        { "label": "Praia da Rocha Portimão" },
        { "label": "Portimão beach guide" },
        { "label": "Algarve resort beaches" },
        { "label": "Blue Flag beaches in Portimão" },
        { "label": "Family beaches in the Algarve" },
        { "label": "Long sandy beaches in the Algarve" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Portimão Marina" },
        { "label": "Fortaleza de Santa Catarina" },
        { "label": "Miradouro dos Três Castelos" },
        { "label": "Praia dos Três Castelos" },
        { "label": "Museu de Portimão" },
        { "label": "Ferragudo" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "Uploaded BEACH GPT brief",
      "source_url": "Uploaded file in conversation",
      "facts_verified": [
        "Required AlgarveOfficial JSON structure",
        "Source hierarchy and anti-hallucination rules",
        "Requirement to mark uncertain facilities, accessibility and seasonal information clearly"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Rocha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-rocha",
      "facts_verified": [
        "Praia da Rocha exists as a maritime beach",
        "Location: Portimão",
        "Setting beside the mouth of the River Arade",
        "Large sandy shore and sculpted rock formations",
        "Highly frequented bathing resort profile",
        "Listed facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurfing and accessible beach"
      ]
    },
    {
      "source_name": "VisitPortugal - Portimão",
      "source_url": "https://www.visitportugal.com/pt-pt/destinos/algarve/73800",
      "facts_verified": [
        "Praia da Rocha is about 3 km from the centre of Portimão",
        "Praia da Rocha is described as perhaps the best-known Algarve beach",
        "Busy seaside resort history since the early 20th century",
        "Casino and leisure activity context",
        "Fortaleza de Santa Catarina connection",
        "Nearby beaches including Três Castelos, Careanos, Vau, João d'Arens, Prainha, Três Irmãos and Alvor",
        "Portimão Marina and river/sea context"
      ]
    },
    {
      "source_name": "VisitPortimão - Praia da Rocha",
      "source_url": "https://visitportimao.com/praias/praia-da-rocha/",
      "facts_verified": [
        "Praia da Rocha is one of the emblematic beaches of the Algarve",
        "Sandy beach extends for more than 1 km",
        "Warm-toned cliffs",
        "Viewpoints from Fortaleza de Santa Catarina de Ribamar and Miradouro dos Três Castelos",
        "Facilities listed: beach support, Blue Flag, nautical centre, lifeguard, first aid post, accessible beach, WC and sunshade zone"
      ]
    },
    {
      "source_name": "Câmara Municipal de Portimão - Praias do Concelho",
      "source_url": "https://www.cm-portimao.pt/menus/servicos/ambiente/praias-do-concelho",
      "facts_verified": [
        "Praia da Rocha has a broad sandy area of more than 1 km",
        "Beach underwent requalification",
        "Boardwalk along the beach",
        "Sports area",
        "Resort context with hotels, bars, terraces, clubs, casino and Marina de Portimão",
        "Connections between the beach, marginal and marina",
        "Municipal reference to toilets, medical post, showers and playground"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Rocha",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/rocha/",
      "facts_verified": [
        "Official Rocha beach area",
        "Municipality: Portimão",
        "Beach code PTCH9Q",
        "Coastal beach classification",
        "Coordinates 37.11773, -8.53642",
        "2026 bathing season: 01/06/2026 to 30/09/2026",
        "2026 Blue Flag season: 01/06/2026 to 30/09/2026",
        "Current page status displayed as flag not hoisted at the time checked"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia dos Três Castelos",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-dos-tr%C3%AAs-castelos",
      "facts_verified": [
        "Praia dos Três Castelos is beside Praia da Rocha",
        "Connection through a passage carved in the rocks",
        "High cliff landscape and walking/viewpoint relevance"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Marina de Portimão",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-marina-de-portim%C3%A3o",
      "facts_verified": [
        "Praia da Marina de Portimão is at the mouth of the River Arade",
        "Separated from Praia da Rocha by the west breakwater",
        "Access through the marina pedestrian and cycling route",
        "Nearby marina support context"
      ]
    },
    {
      "source_name": "VisitPortimão - Fortaleza de Santa Catarina",
      "source_url": "https://visitportimao.com/portimao-2/fortaleza-de-santa-catarina/",
      "facts_verified": [
        "Fortaleza de Santa Catarina is located at Praia da Rocha",
        "Built during the reign of D. Filipe II to defend the Arade river bar",
        "Relevant nearby cultural and viewpoint attraction"
      ]
    },
    {
      "source_name": "VisitPortimão - Museu de Portimão",
      "source_url": "https://visitportimao.com/portimao-2/museu-de-portimao/",
      "facts_verified": [
        "Museu de Portimão is installed in the former Feu canning factory",
        "Museum covers Portimão's origins, identity and city history",
        "Nearby Portimão cultural attraction"
      ]
    },
    {
      "source_name": "Câmara Municipal de Portimão - Área Desportiva Praia da Rocha",
      "source_url": "https://www.cm-portimao.pt/menus/servicos/desporto-e-juventude/espacos-desportivos/area-desportiva-praia-da-rocha",
      "facts_verified": [
        "Beach sports area exists on Praia da Rocha",
        "Activities listed include volleyball, basketball, beach football, footvolley, yoga, hydro-gymnastics, frisbee and fitness",
        "Location near the pontoon separating the marina area"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, maritime beach classification, resort character, cliff landscape, facilities and nearby attractions were verified from official tourism, municipal and Blue Flag sources.",
    "Official sources differ on beach length: VisitPortugal describes around 3 km, while Portimão tourism and municipal sources describe more than 1 km. The listing therefore uses cautious wording such as long, large and spacious instead of relying on one exact length.",
    "Blue Flag information is verified for the 2026 Rocha beach area but is seasonal. At the time checked, ABAAE displayed the flag as not hoisted, so the listing avoids saying the Blue Flag is currently flying.",
    "Coordinates are taken from the ABAAE Rocha beach profile and represent the official beach area point, not necessarily every access point along the sand.",
    "Facilities are verified as listed by official sources, but individual concessions, rental availability, lifeguard presence and support services should be checked locally for the visit date.",
    "Dog rules, exact daily lifeguard hours, parking capacity and current beach rental prices could not be fully verified from the reviewed authoritative sources.",
    "Accessibility is listed by official sources, but exact accessible entrances, equipment availability and current assisted bathing arrangements should be confirmed before publication or before visiting.",
    "No unsupported claims were added about guaranteed calm seas, guaranteed safe swimming, permanent Blue Flag display or universal step-free access."
  ]
}
$json$::jsonb;
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
  where slug = 'portimao'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city portimao was not found';
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
      'https://www.visitportugal.com/pt-pt/content/praia-da-rocha',
      'Praia da Rocha, Portimão, Algarve, Portugal',
      37.11773,
      -8.53642,
      array[
        'Praia da Rocha',
        'Praia da Rocha Portimão',
        'Portimão beach',
        'Algarve resort beach',
        'Blue Flag beach Portimão',
        'Fortaleza de Santa Catarina',
        'Três Castelos viewpoint',
        'Portimão Marina',
        'family beach Algarve',
        'long sandy beach Algarve'
      ],
      v_category_data,
      'Praia da Rocha, Portimão - Algarve Resort Beach',
      'Praia da Rocha in Portimão: a busy Algarve resort beach with long sand, warm-toned cliffs, Blue Flag season, boardwalk access and nearby marina.',
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
      website_url = 'https://www.visitportugal.com/pt-pt/content/praia-da-rocha',
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
      address = 'Praia da Rocha, Portimão, Algarve, Portugal',
      latitude = 37.11773,
      longitude = -8.53642,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia da Rocha',
        'Praia da Rocha Portimão',
        'Portimão beach',
        'Algarve resort beach',
        'Blue Flag beach Portimão',
        'Fortaleza de Santa Catarina',
        'Três Castelos viewpoint',
        'Portimão Marina',
        'family beach Algarve',
        'long sandy beach Algarve'
      ],
      category_data = v_category_data,
      meta_title = 'Praia da Rocha, Portimão - Algarve Resort Beach',
      meta_description = 'Praia da Rocha in Portimão: a busy Algarve resort beach with long sand, warm-toned cliffs, Blue Flag season, boardwalk access and nearby marina.',
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
