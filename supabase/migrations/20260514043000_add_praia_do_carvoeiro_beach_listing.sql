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
  'Carvoeiro',
  'carvoeiro',
  'Charming coastal village known for cliffs, whitewashed houses, fishing heritage and rock formations.',
  37.096196,
  -8.472004,
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
  v_slug text := 'praia-do-carvoeiro-lagoa';
  v_name text := 'Praia do Carvoeiro';
  v_address text := 'Praia do Carvoeiro, Carvoeiro, Lagoa, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-do-carvoeiro';
  v_latitude numeric := 37.096196;
  v_longitude numeric := -8.472004;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Carvoeiro",
  "slug": "praia-do-carvoeiro-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Carvoeiro",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Carvoeiro is a central village beach in Lagoa, set directly below the whitewashed houses and cliffs of Carvoeiro. Small, sheltered and very visited, it combines fishing heritage, restaurants, boat trips and a lively Algarve village atmosphere.",
  "full_description": "Praia do Carvoeiro is the central beach of Carvoeiro, one of Lagoa’s best-known coastal villages. Set in a compact sandy cove beside limestone cliffs, it has a distinctive Algarve image: white houses above the beach, fishing boats on the sand, restaurants and terraces immediately nearby, and the sea opening out towards a coastline of caves and rock formations.\n\nThis is not a remote beach. Official sources describe the sand as small, sheltered and very sought after by bathers, with no real separation between the animated village and the beach itself. Its central location makes it practical for visitors staying in Carvoeiro, but also means it can become very busy during the summer season, especially around the main access points, restaurants and boat-trip departures.\n\nThe beach retains a visible fishing identity, with boats that also operate coastal trips to nearby caves and sea arches. It is also a strong base for exploring the wider Lagoa coastline, including Algar Seco, the Caminho do Algar Seco boardwalk, Vale de Centeanes and the Seven Hanging Valleys route.\n\nPraia do Carvoeiro is officially listed with Blue Flag recognition for 2026, seasonal safety or surveillance, beach services and accessible-beach references. Services should still be checked before visiting, especially outside the main bathing season. Visitors should follow local flags and signage, take care around boats and cliffs, and expect a lively village-beach setting rather than a quiet natural escape.",
  "coordinates": {
    "latitude": 37.096196,
    "longitude": -8.472004,
    "label": "Praia do Carvoeiro",
    "notes": "Coordinates were taken from the official ABAAE Carvoeiro beach entry."
  },
  "beach_type": "Small sandy urban village beach",
  "landscape": "A compact sandy cove enclosed by limestone cliffs, white village houses, fishing boats and a lively seafront with restaurants and terraces.",
  "access": "Access is directly from Carvoeiro village, with VisitPortugal listing access by car, motorcycle and on foot. The beach is central and urban, but visitors with reduced mobility should confirm the most suitable current access point and seasonal support before travelling.",
  "highlights": [
    "Central village beach directly below Carvoeiro",
    "Small, sheltered sandy cove beside limestone cliffs",
    "Fishing boats and coastal cave-trip departures from the beach",
    "Restaurants, bars and terraces immediately beside the sand",
    "Close to Algar Seco and the Caminho do Algar Seco boardwalk",
    "Official 2026 Blue Flag listing for Carvoeiro"
  ],
  "best_for": [
    "Village beach atmosphere",
    "Couples",
    "Families using serviced sections",
    "Photography",
    "Boat trips",
    "Restaurants nearby",
    "Coastal walks",
    "Visitors staying in Carvoeiro",
    "Accessible beach access, subject to current confirmation"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental / coastal boat trips", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Diving activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Fishing boats on the beach", "status": "Verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Seasonal sunshade rental",
    "Light boat rental and coastal boat trips",
    "Showers",
    "Car parking",
    "Bar and restaurant",
    "Diving context",
    "Fishing boats on the beach"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full village-beach atmosphere. May, June and September are usually more comfortable for visitors who want services with less peak-summer pressure than July and August.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Carvoeiro as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Carvoeiro as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nThe beach is small and central, so it can become very busy during the main summer season.\nBeach use coexists with fishing boats and coastal-trip activity; visitors should respect working areas and boarding points.\nFacilities and surveillance may vary by season and concession operation.\nThe beach is backed by cliffs and village structures; visitors should follow local signage and avoid unsafe cliff areas.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Carvoeiro as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Carvoeiro as 1 July 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "The beach is small and central, so it can become very busy during the main summer season.",
      "Beach use coexists with fishing boats and coastal-trip activity; visitors should respect working areas and boarding points.",
      "Facilities and surveillance may vary by season and concession operation.",
      "The beach is backed by cliffs and village structures; visitors should follow local signage and avoid unsafe cliff areas.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Carvoeiro as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Carvoeiro as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nThe beach is small and central, so it can become very busy during the main summer season.\nBeach use coexists with fishing boats and coastal-trip activity; visitors should respect working areas and boarding points.\nFacilities and surveillance may vary by season and concession operation.\nThe beach is backed by cliffs and village structures; visitors should follow local signage and avoid unsafe cliff areas.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "June to September for the official bathing season and full village-beach atmosphere. May, June and September are usually more comfortable for visitors who want services with less peak-summer pressure than July and August.",
  "suitable_for": [
    "Visitors staying in Carvoeiro",
    "Couples wanting a central village beach",
    "Families using serviced seasonal areas",
    "Visitors interested in coastal boat trips",
    "Photographers",
    "Short beach stops",
    "Visitors combining beach time with restaurants and cliff walks"
  ],
  "not_suitable_for": [
    "Visitors seeking a quiet or remote beach",
    "Visitors wanting a large open sandy beach",
    "Those wishing to avoid very visited village beaches in summer",
    "Visitors requiring accessibility support without confirming current seasonal arrangements",
    "Visitors uncomfortable with boat activity close to the beach"
  ],
  "nearby_attractions": [
    {
      "name": "Algar Seco",
      "type": "Natural rock formation and coastal landmark",
      "description": "A notable Lagoa coastal site east of Carvoeiro, known for ochre limestone rocks sculpted by rain and sea erosion.",
      "verification_status": "Verified"
    },
    {
      "name": "Caminho do Algar Seco",
      "type": "Boardwalk / walking route",
      "description": "A roughly 600 m official municipal route along the cliffs near Carvoeiro, with views over the sea, coastal vegetation and limestone formations.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Paraíso",
      "type": "Nearby beach",
      "description": "A small beach close to Carvoeiro, near the end of the Caminho dos Promontórios route and suitable as part of a short local coastal exploration.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Vale Centeanes",
      "type": "Nearby beach",
      "description": "A cliff-backed Lagoa beach east of Carvoeiro and one of the endpoints of the Seven Hanging Valleys Trail.",
      "verification_status": "Verified"
    },
    {
      "name": "Sete Vales Suspensos",
      "type": "Walking trail",
      "description": "A 5.7 km official municipal nature trail linking Praia de Vale Centeanes to Praia da Marinha along a line of limestone cliffs and hanging valleys.",
      "verification_status": "Verified"
    },
    {
      "name": "Carvoeiro village centre",
      "type": "Coastal village",
      "description": "The village sits directly behind the beach, with restaurants, terraces, accommodation and visitor services immediately close to the sand.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Carvoeiro",
    "Lagoa",
    "Ferragudo",
    "Porches",
    "Benagil",
    "Portimão"
  ],
  "walking_trails_nearby": [
    {
      "name": "Caminho do Algar Seco",
      "description": "An official Lagoa municipal route of about 600 m near Carvoeiro, following a boardwalk through ochre limestone cliff scenery, coastal vegetation and sea views.",
      "verification_status": "Verified"
    },
    {
      "name": "Sete Vales Suspensos",
      "description": "An official Lagoa municipal nature trail of 5.7 km linking Praia de Vale Centeanes to Praia da Marinha, close to Carvoeiro and suitable for experienced coastal walkers.",
      "verification_status": "Verified"
    },
    {
      "name": "Caminho dos Promontórios",
      "description": "An official 6 km municipal coastal route between Praia do Molhe and Praia do Paraíso, near Carvoeiro, following a landscape of promontories, cliffs and small inlets.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August, as the beach is compact and very visited.",
    "Travel light, especially if planning to combine the beach with the Algar Seco boardwalk.",
    "Check current boat-trip operations locally, as sea conditions and seasonal demand can affect departures.",
    "Respect fishing boats, equipment and boarding areas on the sand.",
    "Use official cliff paths and boardwalks rather than informal cliff-edge routes.",
    "For a quieter visit, choose morning, late afternoon or shoulder-season dates.",
    "Confirm accessible-beach support before travelling if adapted assistance is required."
  ],
  "photography_notes": "Praia do Carvoeiro photographs well from the sand, village edge and nearby cliff viewpoints, with white houses, fishing boats, limestone cliffs and the cove creating a classic Lagoa coastal composition. Early morning is usually best for quieter scenes.",
  "family_notes": "The beach can suit families who want a central village beach with restaurants and seasonal services close by. Families should still plan around summer crowding, boat activity, changing sea conditions and limited space on the sand.",
  "safety_notes": "Sea conditions can vary. Follow local flags, signage and instructions from beach surveillance where present. Take care around boats, boarding points, rocks and cliff areas, and avoid informal cliff-edge paths.",
  "accessibility_notes": "VisitPortugal lists Praia do Carvoeiro as an accessible beach, and Lagoa municipality confirmed Praia Acessível recognition for Carvoeiro in 2025. Current seasonal support, adapted equipment and the best access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia do Carvoeiro, Lagoa | Algarve Beach Guide",
    "meta_description": "Praia do Carvoeiro in Lagoa is a central village beach with fishing boats, restaurants, cave trips, cliffs and high summer visitor use.",
    "keywords": [
      "Praia do Carvoeiro",
      "Carvoeiro Beach",
      "Carvoeiro Lagoa",
      "Lagoa beaches",
      "Algarve beaches",
      "Portugal beaches",
      "central village beach Algarve",
      "Carvoeiro boat trips",
      "Algar Seco",
      "Caminho do Algar Seco",
      "Sete Vales Suspensos",
      "accessible beach Lagoa",
      "Blue Flag Carvoeiro"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia do Carvoeiro trip ideas",
      "links": [
        { "label": "Praia do Carvoeiro" },
        { "label": "Carvoeiro Beach" },
        { "label": "Carvoeiro boat trips" },
        { "label": "Algar Seco" },
        { "label": "Caminho do Algar Seco" },
        { "label": "Sete Vales Suspensos" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Carvoeiro" },
        { "label": "Lagoa" },
        { "label": "Ferragudo" },
        { "label": "Porches" },
        { "label": "Benagil" },
        { "label": "Portimão" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Carvoeiro",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-carvoeiro",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Carvoeiro, Lagoa",
        "Small sheltered sandy beach",
        "Beach backed by cliffs and white fishermen's houses",
        "Very sought-after beach use",
        "Fishing boats on the sand",
        "Coastal boat trips to nearby caves and algares",
        "Restaurants, bars and terraces immediately beside the beach",
        "Facilities including Blue Flag, safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, diving and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Carvoeiro",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/carvoeiro/",
      "facts_verified": [
        "Official Carvoeiro beach entry",
        "Coastal beach classification",
        "Municipality of Lagoa",
        "Coordinates",
        "Beach code PTCF9K",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at the time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Carvoeiro listed among Lagoa's 2026 Blue Flag locations",
        "Lagoa listed with six awarded 2026 locations"
      ]
    },
    {
      "source_name": "ABAAE beach platform - Carvoeiro beach description",
      "source_url": "https://bandeiraazul.abaae.pt/plataforma/index.php?id=127&p=beaches&s=beach",
      "facts_verified": [
        "Urban beach of intensive use",
        "Sandy beach set within limestone cliffs",
        "Bathing activity coexisting with a residual artisanal fishing nucleus",
        "Coastal limestone cliff setting"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Hastear das Bandeiras Azul da Europa e Praia Acessível",
      "source_url": "https://www.cm-lagoa.pt/noticia/hastear-das-bandeiras-azul-da-europa-e-praia-acessivel-praia-para-todos-nas-praias-do-municipio-de-lagoa",
      "facts_verified": [
        "Carvoeiro received Blue Flag recognition in 2025",
        "Carvoeiro received Praia Acessível, Praia para Todos recognition in 2025",
        "Accessible-beach recognition linked to suitable conditions for people with disability or reduced mobility",
        "Municipal accessibility and beach-quality context"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Caminho do Algar Seco",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/caminho-do-algar-seco",
      "facts_verified": [
        "Algar Seco as a notable Lagoa coastal site",
        "Ochre limestone cliff landscape sculpted by rain and sea action",
        "Approximate 600 m boardwalk route",
        "Coastal vegetation, fauna and sea-view context"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Sete Vales Suspensos",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/sete-vales-suspensos",
      "facts_verified": [
        "Official Seven Hanging Valleys route",
        "5.7 km pedestrian nature trail",
        "Connection between Praia de Vale Centeanes and Praia da Marinha",
        "Limestone cliffs, hanging valleys and geomorphological landscape context"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Caminho dos Promontórios",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/caminho-dos-promontorios",
      "facts_verified": [
        "Official 6 km coastal route",
        "Route between Praia do Molhe and Praia do Paraíso near Carvoeiro",
        "Promontory, cliff and inlet landscape context"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia do Vale de Centeanes",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-vale-de-centeanes",
      "facts_verified": [
        "Nearby Praia de Vale Centeanes",
        "Location in Carvoeiro, Lagoa",
        "Golden cliff-backed beach setting",
        "Connection with Lagoa coastal route context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, central village setting, small sheltered sand, fishing heritage, coastal boat-trip role, facilities, coordinates and 2026 Blue Flag season were verified from official tourism, municipal and ABAAE sources.",
    "The phrase “central village beach, very visited” is supported by VisitPortugal's description of the beach as very sought after by bathers, its immediate connection with the animated village, and the ABAAE beach-platform description of intensive urban use.",
    "ABAAE verifies Carvoeiro's 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on the bathing season, concessions, weather or sea conditions.",
    "Accessibility is verified at recognition level through VisitPortugal and 2025 Lagoa municipal accessible-beach information; current seasonal support should be manually confirmed before publication updates.",
    "Boat trips and diving are included only as seasonal or conditions-dependent activities because sea state, operator availability and regulations can change.",
    "Some Welcome to Lagoa pages returned fetch errors during verification, so this listing relies primarily on VisitPortugal, ABAAE and Câmara Municipal de Lagoa pages that were accessible.",
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
  where slug = 'carvoeiro';

  if v_city_id is null then
    raise exception 'Carvoeiro city was not found';
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
