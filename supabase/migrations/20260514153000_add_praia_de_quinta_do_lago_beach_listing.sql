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
  'Quinta do Lago',
  'quinta-do-lago',
  'Golden Triangle resort area in Loulé known for Ria Formosa access, golf, resort services and beach access.',
  37.0500,
  -8.0167,
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
  v_slug text := 'praia-de-quinta-do-lago-loule';
  v_name text := 'Praia de Quinta do Lago';
  v_address text := 'Praia de Quinta do Lago, Quinta do Lago, Almancil, Loulé, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-da-quinta-do-lago';
  v_latitude numeric := 37.025341;
  v_longitude numeric := -8.025405;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Quinta do Lago",
  "slug": "praia-de-quinta-do-lago-loule",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Quinta do Lago / Almancil",
  "concelho": "Loulé",
  "municipality": "Loulé",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Quinta do Lago is an upscale resort-area beach in Loulé, set within the Ria Formosa Natural Park near Almancil. Reached by a long wooden bridge across the lagoon, it combines broad Atlantic sand, protected wetland scenery and high-quality beach support.",
  "full_description": "Praia de Quinta do Lago is one of Loulé’s most distinctive resort-area beaches, positioned between the Atlantic Ocean and the Ria Formosa lagoon system. Located in Almancil, close to the Quinta do Lago coastal area, it offers a refined beach experience while remaining closely tied to one of the Algarve’s most important protected natural landscapes.\n\nOfficial tourism sources describe the beach as part of the Ria Formosa Natural Park, with a sandy shoreline extending for around 3.5 km. The beach is separated from the resort area by the ria and is reached on foot via a wooden bridge of approximately 320 metres, crossing sensitive lagoon habitats while helping to protect the area’s fauna and flora.\n\nThis setting makes Quinta do Lago especially attractive for visitors who want resort-level comfort, Ria Formosa scenery and a spacious beach with a more natural feel than the urban beaches further west. Official sources list bars, restaurants, a water-sports centre, surveillance, sunshade rental, light boat rental, showers, parking, windsurfing, sailing and accessible-beach recognition.\n\nThe beach sits in a high-demand resort area and can become busy in summer around the bridge, car park, beach restaurants and serviced sections. Visitors should treat services and accessibility support as seasonal, stay on marked paths, avoid dune disturbance and follow local flags and safety guidance before entering the water.",
  "coordinates": {
    "latitude": 37.025341,
    "longitude": -8.025405,
    "label": "Praia de Quinta do Lago",
    "notes": "Primary listing coordinates use the official ABAAE Quinta do Lago beach entry.",
    "bathing_areas": [
      {
        "name": "Quinta do Lago",
        "latitude": 37.025341,
        "longitude": -8.025405,
        "type": "Ria Formosa resort-area beach",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Large sandy maritime beach with Ria Formosa lagoon access",
  "landscape": "A long Atlantic-facing sandy beach separated from the Quinta do Lago resort area by the Ria Formosa lagoon, with dunes, wetlands, tidal channels and wooden bridge access.",
  "access": "Access to the sand is pedestrian, via a wooden bridge of approximately 320 metres across the Ria Formosa. Official sources list access by car, motorcycle and on foot to the beach access area, with parking nearby, but there is no direct vehicle access to the sand.",
  "highlights": [
    "Upscale resort-area beach near Quinta do Lago and Almancil",
    "Located within the Ria Formosa Natural Park",
    "Access by a long wooden pedestrian bridge across the lagoon",
    "Around 3.5 km of sandy shoreline according to VisitPortugal",
    "Bars, restaurants and water-sports centre listed by official tourism sources",
    "Listed among Loulé’s 2026 Blue Flag locations by ABAAE"
  ],
  "best_for": [
    "Resort beach days",
    "Couples",
    "Families using serviced seasonal areas",
    "Ria Formosa scenery",
    "Long beach walks",
    "Birdwatching nearby",
    "Accessible beach access, subject to current confirmation",
    "Water sports when conditions are suitable",
    "Photography"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal / exact 2026 season dates should be confirmed" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Amphibious chair listed by Visit Algarve accessible-beach information", "status": "Seasonal / verify before visiting" },
    { "name": "Wooden pedestrian bridge access", "status": "Verified" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Water-sports centre", "status": "Verified / Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" },
    { "name": "Sailing", "status": "Seasonal / conditions dependent" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Wooden bridge access",
    "Sunshade rental",
    "Light boat rental",
    "Water-sports centre",
    "Showers",
    "Car parking",
    "Bar and restaurant",
    "Windsurfing and sailing",
    "Ria Formosa Natural Park setting"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the main beach season and full resort atmosphere. May, June and September are often more comfortable for bridge walks, Ria Formosa scenery, birdwatching and fewer peak-summer crowds.",
    "know_before_you_go": "ABAAE lists Quinta do Lago among Loulé’s 2026 Blue Flag locations.\nThe individual ABAAE Quinta do Lago page checked during research showed 2025 bathing-season and Blue Flag-season dates, so exact 2026 season dates should be manually confirmed before publication updates.\nThe beach is reached by a long wooden pedestrian bridge across the Ria Formosa; visitors should allow time for the walk from the access area.\nFacilities, surveillance, accessible-beach support and water-sports services may vary by season and concession operation.\nThe beach is within the Ria Formosa Natural Park; visitors should protect dunes, wetland habitats and marked access routes.\nPeak summer can be busy around the bridge, car park, restaurants and serviced beach sections.\nSea, wind and tide conditions can vary; visitors should follow local flags, signage and official safety guidance.\nBirdwatching and nature observation should be done respectfully, without disturbing wildlife or entering protected habitats.",
    "notes": [
      "ABAAE lists Quinta do Lago among Loulé’s 2026 Blue Flag locations.",
      "The individual ABAAE Quinta do Lago page checked during research showed 2025 bathing-season and Blue Flag-season dates, so exact 2026 season dates should be manually confirmed before publication updates.",
      "The beach is reached by a long wooden pedestrian bridge across the Ria Formosa; visitors should allow time for the walk from the access area.",
      "Facilities, surveillance, accessible-beach support and water-sports services may vary by season and concession operation.",
      "The beach is within the Ria Formosa Natural Park; visitors should protect dunes, wetland habitats and marked access routes.",
      "Peak summer can be busy around the bridge, car park, restaurants and serviced beach sections.",
      "Sea, wind and tide conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "Birdwatching and nature observation should be done respectfully, without disturbing wildlife or entering protected habitats."
    ]
  },
  "important_notes": "ABAAE lists Quinta do Lago among Loulé’s 2026 Blue Flag locations.\nThe individual ABAAE Quinta do Lago page checked during research showed 2025 bathing-season and Blue Flag-season dates, so exact 2026 season dates should be manually confirmed before publication updates.\nThe beach is reached by a long wooden pedestrian bridge across the Ria Formosa; visitors should allow time for the walk from the access area.\nFacilities, surveillance, accessible-beach support and water-sports services may vary by season and concession operation.\nThe beach is within the Ria Formosa Natural Park; visitors should protect dunes, wetland habitats and marked access routes.\nPeak summer can be busy around the bridge, car park, restaurants and serviced beach sections.\nSea, wind and tide conditions can vary; visitors should follow local flags, signage and official safety guidance.\nBirdwatching and nature observation should be done respectfully, without disturbing wildlife or entering protected habitats.",
  "best_time_to_visit": "June to September for the main beach season and full resort atmosphere. May, June and September are often more comfortable for bridge walks, Ria Formosa scenery, birdwatching and fewer peak-summer crowds.",
  "suitable_for": [
    "Visitors staying in Quinta do Lago, Almancil or the Golden Triangle area",
    "Couples wanting a refined beach setting",
    "Families using serviced beach areas",
    "Visitors interested in Ria Formosa scenery",
    "Beach walkers",
    "Birdwatchers",
    "Water-sports users when conditions are suitable",
    "Visitors needing accessible-beach recognition, subject to current confirmation"
  ],
  "not_suitable_for": [
    "Visitors who want direct vehicle access to the sand",
    "Visitors seeking an urban promenade beach",
    "Those wishing to avoid resort-area demand in peak summer",
    "Visitors requiring accessibility support without confirming current seasonal arrangements",
    "Anyone intending to walk across protected dunes, saltmarsh or lagoon habitats"
  ],
  "nearby_attractions": [
    {
      "name": "Ria Formosa Natural Park",
      "type": "Protected natural park",
      "description": "A protected lagoon, wetland and barrier-island system forming the natural setting around Quinta do Lago.",
      "verification_status": "Verified"
    },
    {
      "name": "Quinta do Lago wooden bridge",
      "type": "Pedestrian access and viewpoint",
      "description": "A long wooden bridge crossing the Ria Formosa, providing the main pedestrian access to Praia de Quinta do Lago and views over lagoon habitats.",
      "verification_status": "Verified"
    },
    {
      "name": "São Lourenço Trail",
      "type": "Walking and cycling trail",
      "description": "A linear route in Quinta do Lago through typical Ria Formosa habitats, noted by Visit Algarve for aquatic birdwatching.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Ancão",
      "type": "Nearby beach",
      "description": "A neighbouring dune-backed beach west of Quinta do Lago, also linked with the Ria Formosa coastal setting.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Garrão",
      "type": "Nearby beach",
      "description": "A neighbouring Loulé beach west of Ancão, associated with the Vale do Lobo and Golden Triangle coastal area.",
      "verification_status": "Verified"
    },
    {
      "name": "Almancil",
      "type": "Nearby town",
      "description": "The inland parish and service town connected with Quinta do Lago, Vale do Lobo, Ancão and Garrão.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Quinta do Lago",
    "Almancil",
    "Vale do Lobo",
    "Quarteira",
    "Faro",
    "Loulé"
  ],
  "walking_trails_nearby": [
    {
      "name": "São Lourenço Trail",
      "description": "Visit Algarve lists this as a walking and cycling route in Quinta do Lago, with a 3.3 km there-and-back distance and habitats typical of the Ria Formosa, including opportunities to observe aquatic birds.",
      "verification_status": "Verified"
    },
    {
      "name": "Quinta do Lago wooden bridge walk",
      "description": "A short scenic pedestrian crossing over the Ria Formosa between the resort side and the beach, best enjoyed slowly for lagoon views and birdlife.",
      "verification_status": "Verified"
    },
    {
      "name": "Quinta do Lago to Ancão shoreline walk",
      "description": "A sandy beach walk west towards Ancão, best planned according to tide, heat, wind and marked access routes.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Allow time to cross the wooden bridge before reaching the sand.",
    "Arrive early in July and August for easier access to parking and serviced beach areas.",
    "Use marked paths and boardwalks to protect the Ria Formosa habitats.",
    "Bring binoculars if you plan to combine the beach with birdwatching on the São Lourenço Trail.",
    "Confirm accessible-beach support before travelling if an amphibious chair or adapted assistance is required.",
    "Check beach flags before swimming or using water-sports services.",
    "For photography, early morning and late afternoon usually give the best light over the bridge and lagoon."
  ],
  "photography_notes": "Praia de Quinta do Lago is especially photogenic around the wooden bridge, lagoon channels, dunes and wide Atlantic beach. Early morning and late afternoon are best for softer light across the Ria Formosa and fewer people on the bridge.",
  "family_notes": "The beach can suit families because of its wide sand, official services and resort-area access. Families should plan around the bridge walk, seasonal crowding, sun exposure and the need to keep children on marked paths through the protected environment.",
  "safety_notes": "Sea, wind and tide conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Take care around tidal channels, water-sports zones and protected dune or wetland areas.",
  "accessibility_notes": "VisitPortugal lists Praia de Quinta do Lago as an accessible beach, and Visit Algarve’s accessible-beach information lists Quinta do Lago with an amphibious chair. Current seasonal availability, bridge suitability, adapted equipment and the most suitable access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia de Quinta do Lago, Loulé | Beach Guide",
    "meta_description": "Praia de Quinta do Lago in Loulé is an upscale Ria Formosa beach with bridge access, dunes, services, water sports and Blue Flag listing.",
    "keywords": [
      "Praia de Quinta do Lago",
      "Quinta do Lago Beach",
      "Quinta do Lago Loulé",
      "Loulé beaches",
      "Almancil beaches",
      "Golden Triangle Algarve",
      "Ria Formosa beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Quinta do Lago bridge",
      "Blue Flag Quinta do Lago",
      "accessible beach Loulé",
      "São Lourenço Trail"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Quinta do Lago",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-quinta-do-lago",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Almancil, Loulé",
        "Ria Formosa Natural Park setting",
        "Approximately 3.5 km sandy beach",
        "Separated from the Quinta do Lago resort by the ria",
        "Pedestrian access by wooden bridge of about 320 metres",
        "Bars, restaurants and water-sports centre",
        "Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf, sailing and accessible beach"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Quinta do Lago",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/quinta-do-lago/",
      "facts_verified": [
        "Official Quinta do Lago beach entry",
        "Coastal beach classification",
        "Municipality of Loulé",
        "Coordinates",
        "Beach code PTCV9L",
        "Address at Quinta do Lago",
        "Individual page checked and found to show 2025 season dates at the time of research"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Quinta do Lago listed among Loulé’s 2026 Blue Flag locations",
        "Loulé listed with 12 awarded locations in 2026",
        "Nearby Loulé 2026 Blue Flag locations including Ancão, Garrão Nascente, Garrão Poente and Vale de Lobo"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia da Quinta do Lago",
      "source_url": "https://visitalgarve.pt/equipamento/8750/praia-da-quinta-do-lago",
      "facts_verified": [
        "Regional tourism listing for Praia da Quinta do Lago",
        "Association with a high-quality tourist resort",
        "Location in the Ria Formosa Natural Park",
        "Wooden bridge access across the ria, based on official search-result summary"
      ]
    },
    {
      "source_name": "Câmara Municipal de Loulé - Praia da Quinta do Lago",
      "source_url": "https://www.cm-loule.pt/pt/menu/648/praia-da-quinta-do-lago.aspx",
      "facts_verified": [
        "Official municipal beach page located",
        "Access by wooden bridge over the Ria Formosa, based on official search-result summary",
        "Access to the sand by bridge, boardwalks, stairs and wooden ramps, based on official search-result summary",
        "Support equipment including rigid and flexible beach walkways, based on official search-result summary"
      ]
    },
    {
      "source_name": "Visit Loulé - Quinta do Lago Beach",
      "source_url": "https://visit-loule.pt/en/22350/quinta-do-lago-beach",
      "facts_verified": [
        "Quinta do Lago Beach municipal tourism page located",
        "Blue Flag and Accessible Beach awards listed in official search-result summary",
        "Excellent support infrastructure, including bars, restaurants and water-sports centre, from official search-result summary"
      ]
    },
    {
      "source_name": "Visit Algarve - São Lourenço Trail",
      "source_url": "https://visitalgarve.pt/en/3594/sao-lourenco-trail.aspx",
      "facts_verified": [
        "São Lourenço Trail in Quinta do Lago",
        "Walking and cycling route",
        "Linear route",
        "3.3 km there-and-back distance",
        "Ria Formosa habitats and aquatic birdwatching context"
      ]
    },
    {
      "source_name": "ICNF - Parque Natural da Ria Formosa",
      "source_url": "https://www.icnf.pt/conservacao/rnapareasprotegidas/parquesnaturais/pnriaformosa",
      "facts_verified": [
        "Official Ria Formosa Natural Park protected-area context",
        "Lagoon and wetland setting in the Algarve"
      ]
    },
    {
      "source_name": "Visit Algarve - Accessible Beaches",
      "source_url": "https://visitalgarve.pt/3276/praias-acessiveis.aspx",
      "facts_verified": [
        "Quinta do Lago listed with an amphibious chair in 2025 accessible-beach information",
        "Accessible-beach support treated as requiring current seasonal confirmation"
      ]
    },
    {
      "source_name": "Visit Algarve - Pelos passadiços",
      "source_url": "https://visitalgarve.pt/29300/pelos-passadic-os",
      "facts_verified": [
        "Boardwalk route context near Garrão, Ancão, Faro and Quinta do Lago",
        "Wooden trails over several kilometres, based on official regional tourism summary"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Loulé municipality, Almancil / Quinta do Lago location, Ria Formosa Natural Park setting, pedestrian bridge access, facilities and coordinates were verified from VisitPortugal and ABAAE.",
    "The upscale resort / Ria Formosa access positioning is supported by official descriptions of the beach as separated from the Quinta do Lago resort by the ria and associated with a high-quality tourist resort, without implying any endorsement or partnership.",
    "ABAAE’s 2026 awarded list verifies Quinta do Lago among Loulé’s 2026 Blue Flag locations. The individual ABAAE beach page checked during research showed 2025 season dates, so exact 2026 bathing-season and Blue Flag-display dates should be manually confirmed before publication updates.",
    "Facilities are included only where listed by official tourism sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is verified at recognition level through VisitPortugal and official accessible-beach material, but current adapted equipment, bridge suitability and seasonal support should be checked before visiting.",
    "Some municipal and regional pages returned limited accessible text or fetch errors when opened, so those facts are used cautiously from official search-result summaries and supported by VisitPortugal, ABAAE and Visit Algarve where possible.",
    "No prohibited third-party platform names, public review scores or unsupported ranking claims were included in the public listing text."
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
  where slug = 'quinta-do-lago';

  if v_city_id is null then
    raise exception 'Quinta do Lago city was not found';
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
