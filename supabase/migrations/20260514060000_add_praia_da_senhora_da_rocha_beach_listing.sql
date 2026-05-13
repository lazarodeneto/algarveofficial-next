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
  'Porches',
  'porches',
  'Quiet Lagoa coastal parish known for cliffs, small beaches, heritage viewpoints and traditional pottery.',
  37.126,
  -8.392,
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
  v_slug text := 'praia-da-senhora-da-rocha-lagoa';
  v_name text := 'Praia da Senhora da Rocha';
  v_address text := 'Praia da Senhora da Rocha, Porches / Alporchinhos, Lagoa, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/en/NR/exeres/8F33EF00-2ED5-43F5-A2DC-B571C9AC6AE1';
  v_latitude numeric := 37.097206;
  v_longitude numeric := -8.385787;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Senhora da Rocha",
  "slug": "praia-da-senhora-da-rocha-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Porches / Alporchinhos, Lagoa",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Senhora da Rocha is an iconic cliff-framed beach in Porches, Lagoa, set below the famous chapel and headland of Nossa Senhora da Rocha. Small, scenic and culturally distinctive, it combines fishing heritage, boat excursions, Blue Flag recognition and one of the Algarve’s most recognisable coastal viewpoints.",
  "full_description": "Praia da Senhora da Rocha is one of Lagoa’s most memorable coastal settings, located in Porches beneath the rocky promontory crowned by the Forte e Capela de Nossa Senhora da Rocha. The beach itself is small and enclosed by high limestone cliffs, creating a compact sandy cove with a strong sense of place and a close connection to the sea.\n\nOfficial tourism sources describe Senhora da Rocha as a maritime beach between tall cliffs, suitable as a starting point for boat excursions along the coast to nearby grottoes. The western end is separated from Praia Nova by a rock formation, with a tunnel cut through the rock linking the two beaches. Above, the historic chapel and former fort site dominate the headland, offering wide views over the surrounding Algarve coastline.\n\nThe beach also has a traditional fishing identity. Regional tourism information links the sand with the small fishing harbour of Nossa Senhora da Rocha, where boats, fishing equipment and maritime activity form part of the local character. This makes the beach feel different from a purely resort-oriented cove, although it is well known and can become busy in summer.\n\nABAAE lists Senhora da Rocha as a 2026 Blue Flag beach, and VisitPortugal lists services including surveillance, sunshade rental, small craft hire, showers, parking, bar, restaurant and accessible-beach status. Visitors should still check current access, seasonal support and local signage, especially because Lagoa municipality issued a temporary road-access closure notice in February 2026 due to rockfall risk.",
  "coordinates": {
    "latitude": 37.097206,
    "longitude": -8.385787,
    "label": "Praia da Senhora da Rocha",
    "notes": "Coordinates were taken from the official ABAAE Senhora da Rocha beach entry."
  },
  "beach_type": "Small sandy maritime beach below limestone cliffs",
  "landscape": "A compact sandy cove set between high ochre limestone cliffs, with a historic chapel and former fort on the promontory above and Praia Nova connected through a rock tunnel.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Visit Algarve describes asphalted road access from the EN125 via Porches or from Armação de Pêra towards Nossa Senhora da Rocha. Current access should be checked locally, as Lagoa municipality issued a temporary road-circulation closure notice in February 2026 due to rockfall risk.",
  "highlights": [
    "Iconic chapel and headland above the beach",
    "Small sandy cove enclosed by high limestone cliffs",
    "Tunnel connection through the rock to Praia Nova",
    "Traditional fishing-harbour character with boats and maritime activity",
    "Boat excursions to nearby grottoes listed by official tourism sources",
    "Official 2026 Blue Flag listing for Senhora da Rocha"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Couples",
    "Cultural heritage",
    "Boat excursions",
    "Short beach visits",
    "Families using serviced seasonal areas",
    "Visitors staying in Porches or Armação de Pêra",
    "Accessible beach access, subject to current confirmation"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Small craft hire / boat excursions", "status": "Seasonal / conditions dependent" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Outdoor parking", "status": "Verified / access should be checked" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Fishing boats and working fishing-harbour character", "status": "Verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Seasonal sunshade rental",
    "Small craft hire and boat excursions",
    "Showers",
    "Outdoor parking",
    "Bar and restaurant",
    "Fishing-harbour character",
    "Tunnel connection to Praia Nova"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full beach-support period. Spring, early summer and September are often better for photography, chapel views and a calmer visit than peak July and August.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Senhora da Rocha as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Senhora da Rocha as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nLagoa municipality announced a temporary road-access closure between 9 and 27 February 2026 because of rockfall risk; visitors should check current access, signage and municipal notices before travelling.\nThe beach is enclosed by cliffs, so visitors should keep away from cliff bases and cliff edges.\nThe tunnel to Praia Nova and boat-excursion activity should only be used when conditions and signage allow.\nFacilities, surveillance and accessible-beach support may vary by season.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Senhora da Rocha as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Senhora da Rocha as 1 July 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Lagoa municipality announced a temporary road-access closure between 9 and 27 February 2026 because of rockfall risk; visitors should check current access, signage and municipal notices before travelling.",
      "The beach is enclosed by cliffs, so visitors should keep away from cliff bases and cliff edges.",
      "The tunnel to Praia Nova and boat-excursion activity should only be used when conditions and signage allow.",
      "Facilities, surveillance and accessible-beach support may vary by season.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Senhora da Rocha as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Senhora da Rocha as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nLagoa municipality announced a temporary road-access closure between 9 and 27 February 2026 because of rockfall risk; visitors should check current access, signage and municipal notices before travelling.\nThe beach is enclosed by cliffs, so visitors should keep away from cliff bases and cliff edges.\nThe tunnel to Praia Nova and boat-excursion activity should only be used when conditions and signage allow.\nFacilities, surveillance and accessible-beach support may vary by season.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "June to September for the official bathing season and full beach-support period. Spring, early summer and September are often better for photography, chapel views and a calmer visit than peak July and August.",
  "suitable_for": [
    "Photographers",
    "Couples",
    "Visitors interested in Algarve coastal heritage",
    "Beachgoers wanting a small scenic cove",
    "Visitors staying in Porches, Alporchinhos or Armação de Pêra",
    "Families using seasonal serviced areas",
    "Visitors interested in boat excursions when conditions allow"
  ],
  "not_suitable_for": [
    "Visitors seeking a large open beach",
    "Visitors wanting a remote beach with no services",
    "Those uncomfortable with cliff-backed beaches",
    "Visitors requiring accessibility support without confirming current seasonal arrangements",
    "Anyone intending to sit close to cliff bases or ignore access restrictions"
  ],
  "nearby_attractions": [
    {
      "name": "Forte e Capela de Nossa Senhora da Rocha",
      "type": "Historic chapel, former fort and viewpoint",
      "description": "A classified heritage site on the promontory above the beach, listed by Lagoa municipality as an Imóvel de Interesse Público since 1963.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia Nova",
      "type": "Nearby beach",
      "description": "A neighbouring beach west of Senhora da Rocha, connected by a tunnel cut through the rock according to VisitPortugal.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Cova Redonda",
      "type": "Nearby beach",
      "description": "A nearby Porches beach east of Senhora da Rocha, surrounded by high cliffs and reached by a long but gentle staircase through vegetation.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Vale do Olival",
      "type": "Nearby beach",
      "description": "A nearby beach at the western end of the Armação de Pêra sands, set between eroded rock formations with a cliff-side trail towards Praia dos Beijinhos.",
      "verification_status": "Verified"
    },
    {
      "name": "Porches",
      "type": "Village",
      "description": "A historic Lagoa parish with cultural heritage, pottery traditions, coastal viewpoints and access to the Senhora da Rocha area.",
      "verification_status": "Verified"
    },
    {
      "name": "Armação de Pêra",
      "type": "Nearby coastal town",
      "description": "A busy resort town east of Senhora da Rocha, useful for restaurants, services and access to the wider sandy bay.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Porches",
    "Alporchinhos",
    "Armação de Pêra",
    "Lagoa",
    "Carvoeiro"
  ],
  "walking_trails_nearby": [
    {
      "name": "Senhora da Rocha promontory walk",
      "description": "A short headland walk around the chapel and viewpoint area, offering views over Senhora da Rocha, Praia Nova and the surrounding cliffs. Visitors should remain on safe, authorised paths and respect any closures or cliff-safety signage.",
      "verification_status": "Verified"
    },
    {
      "name": "Senhora da Rocha to Praia Nova tunnel connection",
      "description": "A short beach-to-beach connection through the rock formation between Senhora da Rocha and Praia Nova, verified by VisitPortugal. It should only be used when conditions and local signage allow.",
      "verification_status": "Verified"
    },
    {
      "name": "Vale do Olival cliff-side trail",
      "description": "VisitPortugal notes a cliff-side trail around Praia do Vale do Olival with sea views and a pedestrian connection to Praia dos Beijinhos.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Check current municipal access information before visiting, especially if arriving by car.",
    "Arrive early in July and August because the beach is small and can fill quickly.",
    "Use the chapel headland for photographs, but stay well away from cliff edges.",
    "Respect fishing boats, equipment and any working areas on the sand.",
    "Use the tunnel to Praia Nova only when it is open and safe.",
    "Confirm seasonal accessible-beach support before travelling if mobility assistance is required.",
    "For softer light on the chapel and cliffs, visit early morning or late afternoon."
  ],
  "photography_notes": "Praia da Senhora da Rocha is especially strong for photography from the chapel promontory, where the whitewashed chapel, ochre cliffs and small cove create one of Lagoa’s most recognisable coastal scenes. Safe viewpoints should be used; cliff edges and restricted areas must be avoided.",
  "family_notes": "The beach can suit families who want a small serviced cove with restaurants and seasonal beach support nearby. Families should plan around limited sand space, cliff safety, boat activity and changing sea conditions.",
  "safety_notes": "Cliff and rockfall safety is important at Senhora da Rocha. Lagoa municipality issued a temporary road-access closure in February 2026 due to rockfall risk, so visitors should check current notices, obey local signage, avoid cliff bases and follow beach flags before entering the water.",
  "accessibility_notes": "VisitPortugal lists Praia da Senhora da Rocha as an accessible beach, and official APA search results also reference Praia Acessível for Senhora da Rocha. Current seasonal support, adapted equipment, parking and safe access conditions should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia da Senhora da Rocha, Lagoa | Beach Guide",
    "meta_description": "Praia da Senhora da Rocha in Lagoa is an iconic Algarve beach with a chapel headland, cliffs, tunnel to Praia Nova and Blue Flag status.",
    "keywords": [
      "Praia da Senhora da Rocha",
      "Senhora da Rocha Beach",
      "Nossa Senhora da Rocha",
      "Porches beaches",
      "Lagoa beaches",
      "Algarve beaches",
      "Portugal beaches",
      "chapel beach Algarve",
      "Praia Nova",
      "Forte e Capela de Nossa Senhora da Rocha",
      "Blue Flag Senhora da Rocha",
      "accessible beach Lagoa"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia da Senhora da Rocha trip ideas",
      "links": [
        { "label": "Praia da Senhora da Rocha" },
        { "label": "Senhora da Rocha Beach" },
        { "label": "Nossa Senhora da Rocha" },
        { "label": "Praia Nova" },
        { "label": "Forte e Capela de Nossa Senhora da Rocha" },
        { "label": "Blue Flag Senhora da Rocha" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Porches" },
        { "label": "Alporchinhos" },
        { "label": "Armação de Pêra" },
        { "label": "Lagoa" },
        { "label": "Carvoeiro" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Senhora da Rocha",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/8F33EF00-2ED5-43F5-A2DC-B571C9AC6AE1",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Porches, Lagoa",
        "Small sandy beach between high cliffs",
        "Boat-excursion departure point for nearby grottoes",
        "Tunnel connection to Praia Nova",
        "Chapel on the rocky promontory",
        "Facilities including Blue Flag, surveillance, sunshade rental, small craft hire, showers, parking, bar, restaurant and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Senhora da Rocha",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/senhora-da-rocha/",
      "facts_verified": [
        "Official Senhora da Rocha coastal beach entry",
        "Municipality of Lagoa",
        "Coordinates",
        "Beach code PTCE2H",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Senhora da Rocha listed among Lagoa’s 2026 Blue Flag locations",
        "Lagoa listed with six 2026 Blue Flag locations"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Forte e Capela de Nossa Senhora da Rocha, Porches",
      "source_url": "https://www.cm-lagoa.pt/conhecer/patrimonio-cultural/patrimonio-imovel/poi/forte-e-capela-de-nossa-senhora-da-rocha-porches",
      "facts_verified": [
        "Forte e Capela de Nossa Senhora da Rocha as a municipal heritage site",
        "Location in Porches",
        "Classification as Imóvel de Interesse Público since 1963"
      ]
    },
    {
      "source_name": "Património Cultural - Forte de Nossa Senhora da Rocha",
      "source_url": "https://imovel.patrimoniocultural.gov.pt/detalhes.php?code=73026",
      "facts_verified": [
        "Official heritage record for Forte e Capela de Nossa Senhora da Rocha",
        "Location in Porches, Lagoa",
        "Classified heritage status",
        "Promontory location",
        "Historical and architectural context of the chapel and former fort"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - temporary access closure notice",
      "source_url": "https://www.cm-lagoa.pt/evento/interdicao-temporaria-de-circulacao-rodoviaria-risco-de-derrocada",
      "facts_verified": [
        "Temporary road-circulation closure at Praia da Senhora da Rocha from 9 to 27 February 2026",
        "Rockfall-risk reason for the closure",
        "Municipal safety guidance to follow existing signage"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia da Nossa Senhora da Rocha",
      "source_url": "https://visitalgarve.pt/equipamento/8747/praia-da-nossa-senhora-da-rocha",
      "facts_verified": [
        "Regional tourism listing for Praia da Nossa Senhora da Rocha",
        "Association with the fishing harbour of Nossa Senhora da Rocha",
        "Fishing boats, gear and fishermen’s support buildings on or near the beach, based on official search-result summary",
        "Boat visits to sea caves and isolated beaches, based on official search-result summary",
        "Road access from EN125 via Porches or from Armação de Pêra, based on official search-result summary"
      ]
    },
    {
      "source_name": "Agência Portuguesa do Ambiente - ARH do Algarve",
      "source_url": "https://apambiente.pt/apa/arh-do-algarve",
      "facts_verified": [
        "Senhora da Rocha listed in official bathing-area context",
        "Blue Flag and accessible-beach references from official search-result summary"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Cova Redonda",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-cova-redonda-porches",
      "facts_verified": [
        "Nearby Praia da Cova Redonda",
        "Location in Porches, Lagoa",
        "Position east of Praia da Senhora da Rocha",
        "High cliff setting",
        "Long gentle staircase access"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia do Vale do Olival - Alporchinhos",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-vale-do-olival-alporchinhos",
      "facts_verified": [
        "Nearby Praia do Vale do Olival",
        "Location at the western end of Praia de Armação de Pêra",
        "Eroded rock formations",
        "Cliff-side trail with sea views and pedestrian connection to Praia dos Beijinhos"
      ]
    },
    {
      "source_name": "Junta de Freguesia de Porches - Turismo",
      "source_url": "https://www.jf-porches.pt/freguesia/2-turismo/0",
      "facts_verified": [
        "Porches tourism context",
        "Ermida de Nossa Senhora da Rocha as a panoramic viewpoint and cultural landmark",
        "Porches coastal cliffs, caves and rock formations context",
        "Praia da Senhora da Rocha and Praia Nova listed among Porches coastal places"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, chapel/headland setting, cliff landscape, Praia Nova tunnel, facilities, coordinates and 2026 Blue Flag season were verified from official tourism, heritage, municipal and ABAAE sources.",
    "ABAAE verifies Senhora da Rocha’s 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "A Lagoa municipal notice confirms a temporary road-circulation closure from 9 to 27 February 2026 due to rockfall risk. Because this notice refers to a specific past date range, the public listing advises visitors to check current access rather than stating that the beach is currently closed.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on bathing season, concessions, weather or sea conditions.",
    "Accessibility is verified at recognition level through VisitPortugal and official APA search-result information, but current practical access, adapted equipment and seasonal assistance should be confirmed before visiting.",
    "Visit Algarve and APA pages returned limited accessible text or fetch restrictions during verification, so those facts are used cautiously and supported by VisitPortugal, ABAAE and municipal sources where possible.",
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
  where slug = 'porches';

  if v_city_id is null then
    raise exception 'Porches city was not found';
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
