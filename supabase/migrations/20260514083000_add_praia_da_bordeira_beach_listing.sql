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
  'Aljezur',
  'aljezur',
  'West Algarve town and municipality known for Costa Vicentina beaches, surf, cliffs and protected natural landscapes.',
  37.29442,
  -8.86601,
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
  v_slug text := 'praia-da-bordeira-carrapateira-aljezur';
  v_name text := 'Praia da Bordeira / Carrapateira';
  v_address text := 'Praia da Bordeira / Carrapateira, Carrapateira / Bordeira, Aljezur, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-da-bordeira-ou-carrapateira';
  v_latitude numeric := null;
  v_longitude numeric := null;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Bordeira / Carrapateira",
  "slug": "praia-da-bordeira-carrapateira-aljezur",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Carrapateira / Bordeira",
  "concelho": "Aljezur",
  "municipality": "Aljezur",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Bordeira, also known as Praia da Carrapateira, is a large wild beach near Carrapateira in Aljezur. Known for its vast sand, dunes, river mouth, surf conditions and Costa Vicentina setting, it is one of the Algarve’s most impressive nature-focused beaches.",
  "full_description": "Praia da Bordeira is one of the great Atlantic beaches of the Algarve’s west coast, located just north of Carrapateira in the municipality of Aljezur. Official sources describe it as an exceptionally spacious sandy beach which becomes even larger at low tide, while local parish information identifies it as the most extensive beach in Aljezur, with around 3 km of sand.\n\nThe setting is open, wild and strongly shaped by nature. The Ribeira da Bordeira reaches the sea here and can form a seasonal lagoon, while large dune fields, cliffs and windswept Atlantic water give the beach a powerful Costa Vicentina character. This is not a resort beach; it is a wide natural landscape where space, wind, surf and scenery are the main attractions.\n\nPraia da Bordeira is especially popular for surf, bodyboard and kitesurf-style conditions, although Atlantic waves, wind and currents can vary significantly. Families may enjoy the broad sand and lagoon area when conditions are suitable, but water safety should always be checked carefully.\n\nAccess is available from Carrapateira by road, with parking and wooden boardwalk routes verified by local sources. Visitors may need to cross the shallow river on foot depending on the chosen access and conditions. Services are limited and seasonal, so the beach is best approached as a nature and surf destination where preparation matters.",
  "coordinates": {
    "latitude": null,
    "longitude": null,
    "label": "Praia da Bordeira / Carrapateira",
    "notes": "Coordinates were left blank because current authoritative coordinates were not verified during research."
  },
  "beach_type": "Large sandy Atlantic beach with dunes and river mouth",
  "landscape": "A vast sandy beach backed by extensive dune fields, the Ribeira da Bordeira, high cliffs, Atlantic surf and the protected Costa Vicentina coastal landscape.",
  "access": "Official sources verify road access from Carrapateira. Local parish information describes easy access by wooden boardwalks from the southern cliff-side parking area and another boardwalk near Restaurante Sítio do Rio, with the need to cross the shallow river on foot depending on the route and conditions.",
  "highlights": [
    "One of the largest sandy beaches in the Algarve, especially at low tide",
    "Most extensive beach in the municipality of Aljezur according to local parish information",
    "Ribeira da Bordeira river mouth and occasional lagoon landscape",
    "Large dune system and dramatic Costa Vicentina scenery",
    "Popular for surf, bodyboard and wind-driven water-sports conditions",
    "Close to Carrapateira and the Pontal da Carrapateira walking area"
  ],
  "best_for": [
    "Surfing",
    "Bodyboarding",
    "Nature tourism",
    "Photography",
    "Long beach walks",
    "Wild beach scenery",
    "Coastal walks",
    "Kitesurfing when conditions and rules allow",
    "Visitors exploring Carrapateira and Aljezur"
  ],
  "facilities": [
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Beach support", "status": "Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Wooden boardwalk access", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant nearby", "status": "Verified / Seasonal" },
    { "name": "Surf activity listed by official tourism source", "status": "Verified / conditions dependent" },
    { "name": "Bodyboard activity listed by official tourism source", "status": "Verified / conditions dependent" },
    { "name": "Diving activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Kitesurf suitability referenced by local parish source", "status": "Conditions dependent / verify before visiting" },
    { "name": "Blue Flag 2026 status", "status": "Not verified" },
    { "name": "Toilets", "status": "Not verified" },
    { "name": "Showers", "status": "Not verified" },
    { "name": "Accessible beach support", "status": "Not verified" }
  ],
  "includes": [
    "Seasonal beach surveillance",
    "Seasonal beach support",
    "Car parking",
    "Wooden boardwalk access",
    "Bar and nearby restaurant",
    "Surf and bodyboard activity",
    "Diving activity listed by official tourism source",
    "Kitesurf suitability context",
    "Ribeira da Bordeira river mouth",
    "Costa Vicentina protected landscape"
  ],
  "important_information": {
    "best_time_to_visit": "Spring, early summer and early autumn are especially good for walking, photography and nature tourism. Summer offers the main bathing-season atmosphere, while surf conditions depend on swell, wind and tide throughout the year.",
    "know_before_you_go": "ABAAE’s 2026 regional Blue Flag list checked during research lists Aljezur locations as Odeceixe-Mar, Amoreira-Mar, Monte Clérigo and Arrifana; Praia da Bordeira was not found among the 2026 Aljezur Blue Flag locations.\nThis is an exposed Atlantic west-coast beach; waves, currents and wind can vary significantly.\nThe beach is popular with surfers and bodyboarders, but conditions are not suitable for all ability levels every day.\nLocal access may involve crossing the Ribeira da Bordeira on foot, depending on tide, river flow and chosen boardwalk.\nFacilities and surveillance may be seasonal and should be checked before visiting.\nThe dune system is sensitive; visitors should use boardwalks and marked paths where available.\nCliffs and cliff-edge viewpoints require care. Visitors should keep away from cliff edges and cliff bases.\nThe beach is part of the wider protected Costa Vicentina landscape, so natural habitats should be respected.",
    "notes": [
      "ABAAE’s 2026 regional Blue Flag list checked during research lists Aljezur locations as Odeceixe-Mar, Amoreira-Mar, Monte Clérigo and Arrifana; Praia da Bordeira was not found among the 2026 Aljezur Blue Flag locations.",
      "This is an exposed Atlantic west-coast beach; waves, currents and wind can vary significantly.",
      "The beach is popular with surfers and bodyboarders, but conditions are not suitable for all ability levels every day.",
      "Local access may involve crossing the Ribeira da Bordeira on foot, depending on tide, river flow and chosen boardwalk.",
      "Facilities and surveillance may be seasonal and should be checked before visiting.",
      "The dune system is sensitive; visitors should use boardwalks and marked paths where available.",
      "Cliffs and cliff-edge viewpoints require care. Visitors should keep away from cliff edges and cliff bases.",
      "The beach is part of the wider protected Costa Vicentina landscape, so natural habitats should be respected."
    ]
  },
  "important_notes": "ABAAE’s 2026 regional Blue Flag list checked during research lists Aljezur locations as Odeceixe-Mar, Amoreira-Mar, Monte Clérigo and Arrifana; Praia da Bordeira was not found among the 2026 Aljezur Blue Flag locations.\nThis is an exposed Atlantic west-coast beach; waves, currents and wind can vary significantly.\nThe beach is popular with surfers and bodyboarders, but conditions are not suitable for all ability levels every day.\nLocal access may involve crossing the Ribeira da Bordeira on foot, depending on tide, river flow and chosen boardwalk.\nFacilities and surveillance may be seasonal and should be checked before visiting.\nThe dune system is sensitive; visitors should use boardwalks and marked paths where available.\nCliffs and cliff-edge viewpoints require care. Visitors should keep away from cliff edges and cliff bases.\nThe beach is part of the wider protected Costa Vicentina landscape, so natural habitats should be respected.",
  "best_time_to_visit": "Spring, early summer and early autumn are especially good for walking, photography and nature tourism. Summer offers the main bathing-season atmosphere, while surf conditions depend on swell, wind and tide throughout the year.",
  "suitable_for": [
    "Surfers",
    "Bodyboarders",
    "Nature-focused travellers",
    "Photographers",
    "Long beach walkers",
    "Visitors exploring Carrapateira",
    "Families who choose calm, supervised conditions carefully",
    "Visitors comfortable with wild Atlantic beach environments"
  ],
  "not_suitable_for": [
    "Visitors seeking a sheltered resort beach",
    "Visitors expecting guaranteed calm swimming conditions",
    "Visitors requiring fully verified accessible-beach support",
    "Those who prefer extensive fixed facilities",
    "Visitors uncomfortable with wind, surf or large open beaches",
    "Anyone intending to walk across dunes or ignore cliff and surf-safety guidance"
  ],
  "nearby_attractions": [
    {
      "name": "Carrapateira",
      "type": "Village",
      "description": "A small west-coast village close to Praia da Bordeira and Praia do Amado, useful for services, surf tourism and access to the Pontal da Carrapateira area.",
      "verification_status": "Verified"
    },
    {
      "name": "Ribeira da Bordeira",
      "type": "River mouth and lagoon landscape",
      "description": "The river reaches the sea at Praia da Bordeira and can form a lagoon depending on season, tide and sand movement.",
      "verification_status": "Verified"
    },
    {
      "name": "Pontal da Carrapateira",
      "type": "Headland and walking area",
      "description": "A coastal headland between Bordeira and Amado, associated with cliffs, dunes, viewpoints and the Rota Vicentina walking network.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Amado",
      "type": "Nearby surf beach",
      "description": "A major surf beach south of Carrapateira, known for surf schools, Atlantic waves and Costa Vicentina scenery.",
      "verification_status": "Verified"
    },
    {
      "name": "Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "type": "Protected natural park",
      "description": "The protected coastal landscape surrounding the area, known for cliffs, dunes, wild beaches, biodiversity and walking routes.",
      "verification_status": "Verified"
    },
    {
      "name": "Museu do Mar e da Terra da Carrapateira",
      "type": "Local museum",
      "description": "A local museum in Carrapateira focused on the relationship between the community, the sea, agriculture and local traditions.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Carrapateira",
    "Bordeira",
    "Aljezur",
    "Vila do Bispo",
    "Sagres",
    "Lagos"
  ],
  "walking_trails_nearby": [
    {
      "name": "Pontal da Carrapateira",
      "description": "A Rota Vicentina circular walking route associated with the Carrapateira headland, linking the wider coastal landscape around Praia da Bordeira and Praia do Amado. Visitors should follow official markings and avoid cliff edges.",
      "verification_status": "Verified"
    },
    {
      "name": "Caminho Histórico: Carrapateira - Vila do Bispo",
      "description": "A walking stage in the protected-area context that offers views over the wide sands of Praia da Bordeira and the surrounding valleys and coastal landscape.",
      "verification_status": "Verified"
    },
    {
      "name": "Da Bordeira até ao Mar",
      "description": "A regional route crossing the Bordeira valley, pine areas and dune landscapes above the beach, listed by Visit Algarve.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Check tide, surf and wind conditions before travelling, especially if planning to surf or cross the river area.",
    "Use boardwalks and marked paths to protect the dunes.",
    "Arrive prepared with water, sun protection and layers, as the west coast can be windy and services are limited.",
    "Do not assume Blue Flag status for 2026, as Bordeira was not found in the 2026 Aljezur Blue Flag list checked during research.",
    "Keep away from cliff edges and cliff bases, particularly when taking photographs from viewpoints.",
    "Choose supervised areas during the bathing season when entering the water.",
    "Combine the beach with Carrapateira village, Pontal da Carrapateira or Praia do Amado for a wider west-coast itinerary."
  ],
  "photography_notes": "Praia da Bordeira is highly photogenic from the cliff viewpoints, boardwalks and sand, especially at low tide when the scale of the beach becomes more dramatic. The river mouth, dunes, surf lines and wide Atlantic horizon are the defining visual elements.",
  "family_notes": "Families may enjoy the wide sand and occasional lagoon area when conditions are calm and suitable, but this is an exposed Atlantic beach. Children should be supervised closely near the river mouth, surf zone, dunes and cliff paths.",
  "safety_notes": "Atlantic waves, currents and wind can change quickly. Follow beach flags, local signage and surveillance instructions where present. Avoid walking on dunes, keep away from cliff edges and cliff bases, and do not enter the water when conditions are unclear.",
  "accessibility_notes": "Accessible-beach support was not verified from authoritative current sources. Although local information describes easy access by boardwalks, visitors with reduced mobility should confirm current access, river-crossing conditions and beach-entry suitability before visiting.",
  "seo": {
    "meta_title": "Praia da Bordeira, Aljezur | Algarve Beach Guide",
    "meta_description": "Praia da Bordeira near Carrapateira is a large wild Algarve beach with dunes, river mouth, surf, nature tourism and Costa Vicentina scenery.",
    "keywords": [
      "Praia da Bordeira",
      "Praia da Carrapateira",
      "Bordeira Beach",
      "Carrapateira beach",
      "Aljezur beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Costa Vicentina",
      "surf beach Algarve",
      "bodyboard Aljezur",
      "wild beach Algarve",
      "Pontal da Carrapateira",
      "Rota Vicentina",
      "Parque Natural do Sudoeste Alentejano e Costa Vicentina"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia da Bordeira trip ideas",
      "links": [
        { "label": "Praia da Bordeira" },
        { "label": "Praia da Carrapateira" },
        { "label": "Bordeira Beach" },
        { "label": "Carrapateira beach" },
        { "label": "wild beach Algarve" },
        { "label": "Pontal da Carrapateira" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Carrapateira" },
        { "label": "Bordeira" },
        { "label": "Aljezur" },
        { "label": "Vila do Bispo" },
        { "label": "Sagres" },
        { "label": "Lagos" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Bordeira ou Carrapateira",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-bordeira-ou-carrapateira",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Aljezur",
        "Proximity to Carrapateira",
        "Road access from Carrapateira",
        "Very spacious sandy beach",
        "Beach size increasing at low tide",
        "Ribeira da Bordeira river mouth and occasional lagoon",
        "Surf and bodyboard demand",
        "Facilities including safety or surveillance, parking, bar, restaurant, surf, bodyboard and diving",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "Freguesia da Bordeira - Praias",
      "source_url": "https://www.jf-bordeira.pt/conteudos/praia",
      "facts_verified": [
        "Praia da Bordeira as the most extensive beach in Aljezur municipality",
        "Approximate 3 km sandy beach",
        "Location north of Carrapateira at the mouth of Ribeira da Bordeira",
        "High landscape quality",
        "Northern and southern cliffs",
        "Silves sandstone, river and dune-system context",
        "Well-preserved dune habitats",
        "Demand for nautical sports including kitesurf due to wind and waves",
        "Access by wooden boardwalks",
        "Need to cross the shallow river on foot on some access routes",
        "Parking, beach support and restaurant nearby",
        "Beach surveillance during bathing season"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia da Bordeira",
      "source_url": "https://visitalgarve.pt/equipamento/8727/praia-da-bordeira",
      "facts_verified": [
        "Regional tourism listing for Praia da Bordeira",
        "Extensive dune fields advancing inland towards Carrapateira",
        "Ribeira da Bordeira and occasional lagoon context",
        "Large sandy beach and west-coast setting",
        "More than 3 km beach length from official search-result summary",
        "Exposure to maritime winds from official search-result summary"
      ]
    },
    {
      "source_name": "Câmara Municipal de Aljezur - Praia da Bordeira",
      "source_url": "https://cm-aljezur.pt/pt/611/praia-da-bordeira.aspx",
      "facts_verified": [
        "Municipal beach page located",
        "Praia da Bordeira as Aljezur’s most extensive beach",
        "Approximate 3 km sandy beach",
        "Location north of Carrapateira",
        "Official page returned a fetch error during research, so municipal facts are supported by the official search-result summary and the Freguesia da Bordeira page"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/wp-content/uploads/sites/2/2026/04/BA_listas-regioes_2026.pdf",
      "facts_verified": [
        "Aljezur 2026 Blue Flag locations checked",
        "Aljezur 2026 listed locations: Odeceixe-Mar, Amoreira-Mar, Monte Clérigo and Arrifana",
        "Praia da Bordeira not found among Aljezur’s listed 2026 Blue Flag beaches during verification"
      ]
    },
    {
      "source_name": "VisitPortugal - Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "source_url": "https://www.visitportugal.com/pt-pt/content/parque-natural-do-sudoeste-alentejano-e-costa-vicentina",
      "facts_verified": [
        "Protected-area context from Porto Covo to Burgau",
        "Cliff-dominated and well-conserved coastal landscape",
        "Surfing relevance of the park’s beaches",
        "Wild beach and nature-tourism context"
      ]
    },
    {
      "source_name": "Natural.pt - Praia da Bordeira",
      "source_url": "https://natural.pt/protected-areas/parque-natural-sudoeste-alentejano-costa-vicentina/points-of-interest/praia-bordeira",
      "facts_verified": [
        "Protected-area point-of-interest page for Praia da Bordeira",
        "Extensive sandy beach of approximately 3 km from search-result summary",
        "Dunes with low vegetation",
        "Ribeira da Bordeira crossing the beach landscape"
      ]
    },
    {
      "source_name": "Natural.pt - Percurso Pontal da Carrapateira",
      "source_url": "https://natural.pt/protected-areas/parque-natural-sudoeste-alentejano-costa-vicentina/pathways/percurso-pontal-carrapateira",
      "facts_verified": [
        "Pontal da Carrapateira walking-route context",
        "High cliffs sculpted by sea and wind between Bordeira and Amado from official search-result summary"
      ]
    },
    {
      "source_name": "Rota Vicentina - Pontal da Carrapateira",
      "source_url": "https://rotavicentina.com/walking/20-pontal-da-carrapateira/",
      "facts_verified": [
        "Pontal da Carrapateira listed as a Rota Vicentina walking route",
        "Nearby walking-network context"
      ]
    },
    {
      "source_name": "Natural.pt - Caminho Histórico: Carrapateira - Vila do Bispo",
      "source_url": "https://natural.pt/protected-areas/parque-natural-sudoeste-alentejano-costa-vicentina/pathways/caminho-historico-carrapateira-vila-bispo",
      "facts_verified": [
        "Carrapateira to Vila do Bispo walking-stage context",
        "Views over the wide sandy beach of Bordeira from official search-result summary"
      ]
    },
    {
      "source_name": "Visit Algarve - Da Bordeira até ao Mar",
      "source_url": "https://visitalgarve.pt/10064/da-bordeira-ate-ao-mar",
      "facts_verified": [
        "Regional route from Bordeira towards the sea",
        "Bordeira valley, Bordalete pine area and suspended dune field above the beach from official search-result summary"
      ]
    },
    {
      "source_name": "Natural.pt - Museu do Mar e da Terra da Carrapateira",
      "source_url": "https://natural.pt/protected-areas/parque-natural-sudoeste-alentejano-costa-vicentina/infrastructures/museu-mar-terra-carrapateira",
      "facts_verified": [
        "Carrapateira museum existence",
        "Local sea, land, agricultural and maritime-culture theme from official search-result summary"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, Carrapateira proximity, large sandy character, river-mouth setting, dunes, surf/bodyboard relevance, access and basic facilities were verified from official tourism and local-government sources.",
    "The phrase “large wild beach, surf and nature tourism” is supported by official descriptions of the beach’s exceptional scale, dune system, river-mouth landscape, low-density bathing use and strong surf/bodyboard demand.",
    "Current 2026 Blue Flag status was not verified. ABAAE’s 2026 Aljezur list includes Odeceixe-Mar, Amoreira-Mar, Monte Clérigo and Arrifana, but not Praia da Bordeira.",
    "Facilities are included only where listed by VisitPortugal or local parish information and marked Seasonal where operation may depend on bathing season or concession activity.",
    "Toilets, showers, sunshade rental and accessible-beach support were not verified from authoritative current sources and are therefore marked Not verified.",
    "Coordinates were left blank because current authoritative coordinates were not verified during this research.",
    "Some municipal and Natural.pt pages returned limited accessible text or fetch errors; where used, those facts are supported by official search-result summaries and stronger official sources where available.",
    "Sea and surf conditions are naturally variable on this exposed Atlantic beach, so all swimming, surfing and bodyboarding suitability is conditions-dependent.",
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
  where slug = 'aljezur';

  if v_city_id is null then
    raise exception 'Aljezur city was not found';
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
