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
  'Central Algarve resort city with western beaches around Galé, Guia and Salgados.',
  37.0891,
  -8.2479,
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
  v_slug text := 'praia-da-gale-albufeira';
  v_name text := 'Praia da Galé';
  v_address text := 'Praia da Galé, Galé / Guia, Albufeira, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/en/NR/exeres/D3060CF1-B43A-46DE-B32A-CF7C1ABD3A89';
  v_latitude numeric := 37.08062;
  v_longitude numeric := -8.316371;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Galé",
  "slug": "praia-da-gale-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Galé / Guia, Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Galé is a large, family-friendly beach west of Albufeira, divided into Galé-Leste and Galé-Oeste. Known for its wide sand, low golden cliffs, rock formations and accessible-beach recognition, it is one of the most practical beach choices in the Galé and Guia area.",
  "full_description": "Praia da Galé is one of Albufeira’s broadest and most versatile beach areas, located west of the city near Galé and Guia. Official tourism sources describe it as a long sandy beach divided into two sections, Galé-Leste and Galé-Oeste, with the distinction linked to different access points from the parking areas.\n\nThe beach combines open sand with low golden cliffs and rock formations, giving it a softer and more spacious feel than many of Albufeira’s smaller cliff coves. Galé-Leste has more visible rocks and scenic formations, while Galé-Oeste opens into a wider stretch of uninterrupted sand that connects naturally towards Salgados. This makes the beach well suited to families, long beach walks, relaxed swimming when conditions allow, and visitors who prefer space over compact coves.\n\nPraia da Galé is also a strong practical choice. VisitPortugal lists Blue Flag recognition, surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant, windsurfing, sailing and accessible-beach status. Visit Algarve’s accessible-beach information also lists both Galé-Leste and Galé-Oeste with amphibious chair and assisted bathing support, though visitors should always confirm current seasonal availability before travelling.\n\nIn summer, Galé can become busy around the main serviced and parking areas, but its size usually gives visitors more room than many central Albufeira beaches. Sea conditions can vary, and visitors should follow local flags, signage and lifeguard guidance where present.",
  "coordinates": {
    "primary": {
      "label": "Galé-Leste",
      "latitude": 37.08062,
      "longitude": -8.316371
    },
    "latitude": 37.08062,
    "longitude": -8.316371,
    "points": [
      {
        "label": "Galé-Leste",
        "latitude": 37.08062,
        "longitude": -8.316371
      },
      {
        "label": "Galé-Oeste",
        "latitude": 37.084899,
        "longitude": -8.323002
      }
    ],
    "notes": "Coordinates are provided as two official ABAAE points, Galé-Leste and Galé-Oeste. The listing map uses Galé-Leste as the primary point."
  },
  "coordinate_points": [
    {
      "name": "Galé-Leste",
      "latitude": 37.08062,
      "longitude": -8.316371,
      "verification_status": "Verified"
    },
    {
      "name": "Galé-Oeste",
      "latitude": 37.084899,
      "longitude": -8.323002,
      "verification_status": "Verified"
    }
  ],
  "beach_type": "Large sandy maritime beach with two recognised sections",
  "landscape": "A broad sandy beach backed by low golden cliffs, warm sediment layers and natural rock formations, with a more open sandy character towards Galé-Oeste and Salgados.",
  "access": "VisitPortugal verifies access by car, motorcycle and on foot, and describes the beach as divided into East and West sections due to different access points from the parking area. Visit Albufeira describes Galé-Leste access by paved paths and Galé-Oeste access as easy and well marked, with nearby parking and paths leading to the sand.",
  "highlights": [
    "Large sandy beach divided into Galé-Leste and Galé-Oeste",
    "Low golden cliffs and natural rock formations",
    "Wide open sand suited to families and long beach walks",
    "Accessible-beach recognition listed by official tourism sources",
    "Seasonal restaurants, bars, showers and beach-support services",
    "Both Galé-Leste and Galé-Oeste listed among Albufeira’s 2026 Blue Flag locations"
  ],
  "best_for": [
    "Families",
    "Accessible beach access",
    "Long beach walks",
    "Resort beach days",
    "Couples",
    "Photography",
    "Water sports when conditions are suitable",
    "Visitors staying in Galé or Guia",
    "Sunset walks"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing for Galé-Leste and Galé-Oeste", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Amphibious chair and assisted bathing support listed for Galé-Leste and Galé-Oeste by Visit Algarve accessible-beach information", "status": "Seasonal / verify before visiting" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Small craft hire", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Outdoor parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" },
    { "name": "Sailing", "status": "Seasonal / conditions dependent" }
  ],
  "includes": [
    "Blue Flag 2026 listing for Galé-Leste and Galé-Oeste",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Seasonal amphibious chair and assisted bathing support",
    "Seasonal sunshade rental",
    "Small craft hire",
    "Showers",
    "Outdoor parking",
    "Bar and restaurant",
    "Windsurfing and sailing context"
  ],
  "important_information": {
    "best_time_to_visit": "May to October for the official bathing-season period around Albufeira’s Galé beaches. June and September are often more comfortable for families, beach walks and accessible beach visits with less peak-summer pressure.",
    "know_before_you_go": "ABAAE lists both Galé-Leste and Galé-Oeste among Albufeira’s 2026 Blue Flag locations.\nABAAE lists the 2026 bathing season for Galé-Leste as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for Galé-Leste as 1 July 2026 to 30 September 2026.\nThe ABAAE Galé-Oeste page checked showed a 2026 Blue Flag season but displayed 2025 bathing-season dates, so the exact current bathing season for Galé-Oeste should be manually confirmed before publication updates.\nFacilities and accessible-beach support may vary by section and season.\nThe beach includes rock formations and low cliffs; visitors should take care around rocks and avoid cliff bases.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.\nThe most convenient access and serviced sections can become busy during July and August.",
    "notes": [
      "ABAAE lists both Galé-Leste and Galé-Oeste among Albufeira’s 2026 Blue Flag locations.",
      "ABAAE lists the 2026 bathing season for Galé-Leste as 15 May 2026 to 15 October 2026.",
      "ABAAE lists the 2026 Blue Flag season for Galé-Leste as 1 July 2026 to 30 September 2026.",
      "The ABAAE Galé-Oeste page checked showed a 2026 Blue Flag season but displayed 2025 bathing-season dates, so the exact current bathing season for Galé-Oeste should be manually confirmed before publication updates.",
      "Facilities and accessible-beach support may vary by section and season.",
      "The beach includes rock formations and low cliffs; visitors should take care around rocks and avoid cliff bases.",
      "Sea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "The most convenient access and serviced sections can become busy during July and August."
    ]
  },
  "important_notes": "ABAAE lists both Galé-Leste and Galé-Oeste among Albufeira’s 2026 Blue Flag locations.\nABAAE lists the 2026 bathing season for Galé-Leste as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for Galé-Leste as 1 July 2026 to 30 September 2026.\nThe ABAAE Galé-Oeste page checked showed a 2026 Blue Flag season but displayed 2025 bathing-season dates, so the exact current bathing season for Galé-Oeste should be manually confirmed before publication updates.\nFacilities and accessible-beach support may vary by section and season.\nThe beach includes rock formations and low cliffs; visitors should take care around rocks and avoid cliff bases.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.\nThe most convenient access and serviced sections can become busy during July and August.",
  "best_time_to_visit": "May to October for the official bathing-season period around Albufeira’s Galé beaches. June and September are often more comfortable for families, beach walks and accessible beach visits with less peak-summer pressure.",
  "suitable_for": [
    "Families wanting a larger beach with services",
    "Visitors staying in Galé, Guia or western Albufeira",
    "Visitors needing accessible-beach support, subject to current confirmation",
    "Beach walkers",
    "Couples",
    "Visitors looking for a beach with both open sand and scenic rock formations",
    "Water-sports users when conditions are suitable"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors who want a very small sheltered cove",
    "Those wishing to avoid all summer resort activity",
    "Visitors requiring accessibility support without confirming current seasonal arrangements",
    "Anyone intending to sit close to cliff bases or climb rock formations"
  ],
  "nearby_attractions": [
    {
      "name": "Praia dos Salgados",
      "type": "Nearby beach",
      "description": "A neighbouring broad sandy beach west of Galé, forming part of the wider open shoreline towards the Salgados area.",
      "verification_status": "Verified"
    },
    {
      "name": "Lagoa dos Salgados",
      "type": "Wetland and nature area",
      "description": "A coastal lagoon and wetland beside Praia dos Salgados, known for birdlife and nature interest in the western Albufeira area.",
      "verification_status": "Verified"
    },
    {
      "name": "Passadiços dos Salgados",
      "type": "Boardwalk / walking route",
      "description": "A nearby boardwalk route in the Salgados area, useful for combining beach time with wetland and dune scenery.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia Manuel Lourenço",
      "type": "Nearby beach",
      "description": "A neighbouring beach east of Galé, part of the western Albufeira beach sequence.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Evaristo",
      "type": "Nearby beach",
      "description": "A smaller rocky beach east of Galé, useful for visitors exploring the scenic western Albufeira coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Guia",
      "type": "Nearby village",
      "description": "A village inland from Galé, useful for local services, restaurants and access between western Albufeira beaches.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Galé",
    "Guia",
    "Albufeira",
    "Armação de Pêra",
    "Ferreiras"
  ],
  "walking_trails_nearby": [
    {
      "name": "Galé to Salgados beach walk",
      "description": "A long shoreline walk from Galé-Oeste towards Praia dos Salgados, best planned according to tide, sea state and weather conditions.",
      "verification_status": "Verified"
    },
    {
      "name": "Passadiços dos Salgados",
      "description": "A nearby boardwalk route listed by Visit Albufeira among its walks and tours, connected with the Salgados wetland and beach landscape.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Choose Galé-Leste for more rock formations and Galé-Oeste for a broader, more open sandy feel.",
    "Arrive early in July and August if you want easier access to the most convenient parking and serviced areas.",
    "Confirm accessible-beach support before travelling if an amphibious chair or assisted bathing is required.",
    "Use marked paths and avoid walking across sensitive dune areas.",
    "Check beach flags before swimming or using water-sports services.",
    "For a longer outing, combine Galé with Salgados and the nearby boardwalks."
  ],
  "photography_notes": "Praia da Galé photographs well for its contrast between open golden sand, low cliffs and sculpted rock formations. Early morning and late afternoon are best for softer light, especially around the Galé-Leste rocks and the wider Galé-Oeste shoreline.",
  "family_notes": "Praia da Galé is a strong family option because of its space, official facilities and accessible-beach recognition. Families should still choose supervised seasonal sections, check sea conditions, keep children away from rocks and cliffs, and confirm services before travelling outside the main season.",
  "safety_notes": "Sea conditions can vary, even on beaches described as family-suitable by official local tourism. Follow local flags, signage and lifeguard instructions where present. Take care around rocks, low cliffs and water-sports zones.",
  "accessibility_notes": "VisitPortugal lists Praia da Galé as an accessible beach, and Visit Algarve’s accessible-beach information lists Galé-Leste and Galé-Oeste with amphibious chair and assisted bathing support. Current seasonal availability, the best access point and any adapted equipment should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia da Galé, Albufeira | Algarve Beach Guide",
    "meta_description": "Praia da Galé in Albufeira is a large family-friendly beach with wide sand, rock formations, accessibility support and Blue Flag status.",
    "keywords": [
      "Praia da Galé",
      "Praia da Gale",
      "Galé Beach",
      "Galé-Leste",
      "Galé-Oeste",
      "Albufeira beaches",
      "Algarve beaches",
      "Portugal beaches",
      "family beach Albufeira",
      "accessible beach Albufeira",
      "Blue Flag Galé",
      "Praia dos Salgados nearby",
      "Guia Albufeira"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia da Galé trip ideas",
      "links": [
        { "label": "Praia da Galé" },
        { "label": "Praia da Gale" },
        { "label": "Galé Beach" },
        { "label": "Galé-Leste" },
        { "label": "Galé-Oeste" },
        { "label": "family beach Albufeira" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Praia dos Salgados" },
        { "label": "Lagoa dos Salgados" },
        { "label": "Passadiços dos Salgados" },
        { "label": "Praia Manuel Lourenço" },
        { "label": "Praia do Evaristo" },
        { "label": "Guia" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Galé",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/D3060CF1-B43A-46DE-B32A-CF7C1ABD3A89",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Albufeira",
        "Long sandy beach divided into Galé-Leste and Galé-Oeste",
        "Golden cliffs and rock formations",
        "Nearby restaurants and bars",
        "Facilities including Blue Flag, surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant, windsurfing, sailing and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "Visit Albufeira - Galé Beach East",
      "source_url": "https://visitalbufeira.pt/praia/praia-da-gale-leste",
      "facts_verified": [
        "Galé-Leste beach section",
        "Broad golden sand",
        "Low rounded cliffs",
        "Family-suitability context",
        "Paved paths leading directly to the sand",
        "Outdoor activity and beach-walk suitability"
      ]
    },
    {
      "source_name": "Visit Albufeira - Galé Beach West",
      "source_url": "https://visitalbufeira.pt/praia/praia-da-gale-oeste",
      "facts_verified": [
        "Galé-Oeste beach section",
        "Wide uninterrupted sandy stretch",
        "Low smooth cliffs and golden sediment layers",
        "Easy marked access",
        "Nearby parking areas and paths to the sand",
        "Suitability for long walks and family beach use"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galé-Leste",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/gale-leste/",
      "facts_verified": [
        "Official Galé-Leste beach entry",
        "Municipality of Albufeira",
        "Coastal beach classification",
        "Coordinates",
        "Beach code PTCP8F",
        "2026 bathing season",
        "2026 Blue Flag season"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galé-Oeste",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/gale-oeste/",
      "facts_verified": [
        "Official Galé-Oeste beach entry",
        "Municipality of Albufeira",
        "Coastal beach classification",
        "Coordinates",
        "Beach code PTCE9X",
        "2026 Blue Flag season",
        "Individual page checked and bathing-season date flagged for manual review"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Galé-Leste listed among Albufeira’s 2026 Blue Flag locations",
        "Galé-Oeste listed among Albufeira’s 2026 Blue Flag locations",
        "Albufeira listed with 25 awarded locations in 2026"
      ]
    },
    {
      "source_name": "Visit Algarve - Accessible Beaches",
      "source_url": "https://visitalgarve.pt/3276/praias-acessiveis.aspx",
      "facts_verified": [
        "Galé-Leste listed with amphibious chair and assisted bathing support",
        "Galé-Oeste listed with amphibious chair and assisted bathing support",
        "Accessible-beach support context for the Algarve"
      ]
    },
    {
      "source_name": "Câmara Municipal de Albufeira - 2025 accessible beach announcement",
      "source_url": "https://www.cm-albufeira.pt/artigo/albufeira-hasteia-bandeiras-azuis-e-praia-acessivel-para-presente-epoca-balnear",
      "facts_verified": [
        "Galé Oeste listed among Albufeira accessible beaches",
        "Galé Leste listed among Albufeira accessible beaches",
        "Accessible-beach recognition treated as requiring current seasonal confirmation"
      ]
    },
    {
      "source_name": "Visit Albufeira - Salgados Beach",
      "source_url": "https://visitalbufeira.pt/praia/praia-dos-salgados",
      "facts_verified": [
        "Praia dos Salgados as a nearby broad beach",
        "Continuous sandy link from Galé towards Armação de Pêra",
        "Salgados Lagoon and birdlife context",
        "Passadiços dos Salgados listed among nearby walks and tours"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Albufeira municipality, East and West division, large sandy character, golden cliffs, rock formations, facilities and accessibility were verified from official tourism, municipal and ABAAE sources.",
    "The phrase “large, accessible, family beach” is supported by the verified beach scale, official accessible-beach listings, VisitPortugal facilities and Visit Albufeira’s family-suitability wording.",
    "ABAAE verifies Galé-Leste’s 2026 bathing season as 15 May 2026 to 15 October 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "ABAAE lists Galé-Oeste among Albufeira’s 2026 Blue Flag locations and shows a 2026 Blue Flag season on the Galé-Oeste page, but the individual page displayed a 2025 bathing season. This should be manually checked before publication updates.",
    "Coordinates are provided as two official ABAAE points, Galé-Leste and Galé-Oeste, rather than inventing one central coordinate for the wider beach.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is verified at recognition level, but current adapted equipment, assisted bathing and the best access point should be confirmed before visiting.",
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
  where slug = 'albufeira';

  if v_city_id is null then
    raise exception 'Albufeira city was not found';
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
