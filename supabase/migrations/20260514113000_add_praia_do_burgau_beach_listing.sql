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
  'Burgau',
  'burgau',
  'Fishing village in Vila do Bispo known for Praia do Burgau, cliff walks and west Algarve coastal scenery.',
  37.0719,
  -8.7752,
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
  v_slug text := 'praia-do-burgau-vila-do-bispo';
  v_name text := 'Praia do Burgau';
  v_address text := 'Praia do Burgau, Burgau, Vila do Bispo, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-do-burgau';
  v_latitude numeric := 37.0719;
  v_longitude numeric := -8.7752;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Burgau",
  "slug": "praia-do-burgau-vila-do-bispo",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Burgau",
  "concelho": "Vila do Bispo",
  "municipality": "Vila do Bispo",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Burgau is a popular village beach in Vila do Bispo, set below the fishing village of Burgau between Salema and Praia da Luz. Sheltered by cliffs and still linked to small-scale fishing activity, it offers a distinctive west Algarve village-beach atmosphere.",
  "full_description": "Praia do Burgau is a well-known village beach on the south coast of Vila do Bispo, where the Algarve begins to feel more western, quieter and more closely tied to the Costa Vicentina landscape. Set below the hillside village of Burgau, the beach is framed by cliffs and whitewashed houses that descend towards the sand, giving it a compact and characterful setting.\n\nOfficial tourism sources describe Burgau as a former fishing port. Today, the western part of the sand is used by bathers, while the eastern side retains a small port area connected with fishing activity. This gives the beach a working-village identity that should be respected, especially around boats, equipment and any designated maritime areas.\n\nPraia do Burgau is popular because it combines scenery, services and a more intimate village atmosphere than larger resort beaches. VisitPortugal lists Blue Flag, seasonal surveillance, sunshade rental, showers, parking, bar, restaurant, bodyboard and windsurf. These services may vary by season and should be checked before travelling outside the main bathing period.\n\nThe beach is also well placed for coastal walking. Burgau sits between Salema and Praia da Luz, with Rota Vicentina programmes and coastal walking material referencing the wider Burgau, Salema and Luz route network. Visitors should take care on cliff paths, follow local signage and avoid unsafe cliff edges or bases.",
  "coordinates": {
    "latitude": 37.0719,
    "longitude": -8.7752,
    "label": "Praia do Burgau",
    "notes": "Coordinates were taken from the official ABAAE Burgau beach entry."
  },
  "beach_type": "Sandy village maritime beach",
  "landscape": "A compact sandy beach below Burgau village, enclosed by cliffs, with whitewashed houses on the slope and a small fishing-port area on the eastern side.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. The beach is directly connected with Burgau village, but visitors should confirm current parking, access and seasonal restrictions before travelling in peak summer.",
  "highlights": [
    "Popular village beach below Burgau",
    "Former fishing port with small harbour activity still present on the eastern side",
    "Sheltered sandy beach framed by cliffs and whitewashed village houses",
    "Bodyboard and windsurf listed by official tourism source",
    "Close to Salema, Praia da Luz and the wider Rota Vicentina walking network",
    "Official 2026 Blue Flag listing for Burgau"
  ],
  "best_for": [
    "Village beach atmosphere",
    "Families using serviced seasonal areas",
    "Couples",
    "Photography",
    "Bodyboarding when conditions are suitable",
    "Coastal walks",
    "Restaurants nearby",
    "West Algarve exploration",
    "Visitors staying in Burgau or nearby villages"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Bodyboard activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Windsurf activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Small fishing-port area", "status": "Verified" },
    { "name": "Accessible beach support", "status": "Not verified" },
    { "name": "Toilets", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Sunshade rental",
    "Showers",
    "Car parking",
    "Bar and restaurant",
    "Bodyboard and windsurf activity",
    "Small fishing-port area",
    "Village beach setting"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the main beach season and village atmosphere. May, June and September are usually more comfortable for walking, photography and a calmer beach visit outside peak August pressure.",
    "know_before_you_go": "ABAAE lists Burgau among Vila do Bispo’s 2026 Blue Flag coastal beach locations.\nABAAE lists Burgau’s 2026 Blue Flag season as 1 July 2026 to 30 September 2026.\nThe individual ABAAE Burgau page checked during research showed an inconsistent 2026 bathing-season end date, so the exact bathing-season dates should be manually confirmed before publication updates.\nFacilities, surveillance and beach services may vary by season and concession operation.\nThe eastern side of the beach is associated with a small fishing-port area; visitors should respect working boats, equipment and any marked zones.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nThe beach is backed by cliffs, so visitors should keep away from cliff bases and cliff edges.\nBurgau is a village beach with limited space compared with larger resort beaches, so it can feel busy in peak summer.",
    "notes": [
      "ABAAE lists Burgau among Vila do Bispo’s 2026 Blue Flag coastal beach locations.",
      "ABAAE lists Burgau’s 2026 Blue Flag season as 1 July 2026 to 30 September 2026.",
      "The individual ABAAE Burgau page checked during research showed an inconsistent 2026 bathing-season end date, so the exact bathing-season dates should be manually confirmed before publication updates.",
      "Facilities, surveillance and beach services may vary by season and concession operation.",
      "The eastern side of the beach is associated with a small fishing-port area; visitors should respect working boats, equipment and any marked zones.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "The beach is backed by cliffs, so visitors should keep away from cliff bases and cliff edges.",
      "Burgau is a village beach with limited space compared with larger resort beaches, so it can feel busy in peak summer."
    ]
  },
  "important_notes": "ABAAE lists Burgau among Vila do Bispo’s 2026 Blue Flag coastal beach locations.\nABAAE lists Burgau’s 2026 Blue Flag season as 1 July 2026 to 30 September 2026.\nThe individual ABAAE Burgau page checked during research showed an inconsistent 2026 bathing-season end date, so the exact bathing-season dates should be manually confirmed before publication updates.\nFacilities, surveillance and beach services may vary by season and concession operation.\nThe eastern side of the beach is associated with a small fishing-port area; visitors should respect working boats, equipment and any marked zones.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nThe beach is backed by cliffs, so visitors should keep away from cliff bases and cliff edges.\nBurgau is a village beach with limited space compared with larger resort beaches, so it can feel busy in peak summer.",
  "best_time_to_visit": "June to September for the main beach season and village atmosphere. May, June and September are usually more comfortable for walking, photography and a calmer beach visit outside peak August pressure.",
  "suitable_for": [
    "Visitors staying in Burgau",
    "Families wanting a serviced village beach",
    "Couples looking for a smaller coastal village setting",
    "Visitors interested in fishing heritage",
    "Bodyboarders when conditions are suitable",
    "Coastal walkers",
    "Travellers exploring between Salema and Praia da Luz"
  ],
  "not_suitable_for": [
    "Visitors seeking a large open resort beach",
    "Visitors requiring verified accessible-beach support",
    "Those wishing to avoid popular village beaches in summer",
    "Visitors expecting guaranteed calm sea conditions",
    "Anyone intending to sit close to cliff bases or interfere with fishing activity"
  ],
  "nearby_attractions": [
    {
      "name": "Burgau village",
      "type": "Coastal village",
      "description": "A small fishing village above the beach, with narrow streets, whitewashed houses and local restaurants close to the sand.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Salema",
      "type": "Nearby beach and village",
      "description": "A neighbouring village beach west of Burgau, also known for fishing heritage and listed by VisitPortugal between Sagres and Lagos.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Luz",
      "type": "Nearby resort beach",
      "description": "A larger beach east of Burgau in the Lagos municipality, useful for visitors exploring the coastal route towards Lagos.",
      "verification_status": "Verified"
    },
    {
      "name": "Forte de Almádena / Forte da Boca do Rio",
      "type": "Historic fort",
      "description": "A historic coastal fort in the wider Burgau–Salema area, associated with the Boca do Rio coast and local maritime defence.",
      "verification_status": "Verified"
    },
    {
      "name": "Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "type": "Protected natural park",
      "description": "The protected coastal landscape begins around Burgau according to official tourism and municipal sources, extending along the western Algarve and Alentejo coast.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Burgau",
    "Salema",
    "Praia da Luz",
    "Budens",
    "Vila do Bispo",
    "Lagos"
  ],
  "walking_trails_nearby": [
    {
      "name": "Rota Vicentina / Fishermen’s Trail - Salema to Luz",
      "description": "A coastal walking section linking the wider Salema, Burgau and Luz area, with cliff paths and sea views. Walkers should follow official markings and avoid cliff edges.",
      "verification_status": "Verified"
    },
    {
      "name": "Burgau to Zavial walking section",
      "description": "Rota Vicentina programme material references a Burgau to Zavial walking day of around 15 km, passing coastal heritage and nearby beaches. Visitors should check current route markings before setting out.",
      "verification_status": "Verified"
    },
    {
      "name": "Burgau to Praia da Luz coastal walk",
      "description": "A local coastal walk east towards Praia da Luz. It is geographically sensible and supported by the wider Rota Vicentina / coastal walking context, but route conditions should be checked locally.",
      "verification_status": "Partially verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August, as the beach is compact and village parking may be limited.",
    "Respect the eastern fishing-port area and any boats or equipment on the sand.",
    "Check local flags before swimming, bodyboarding or windsurfing.",
    "Use marked paths when walking the cliffs towards Salema or Praia da Luz.",
    "For quieter photographs, visit early morning before the beach becomes busier.",
    "Confirm seasonal services before relying on sunshade rental, showers or beach support.",
    "Bring suitable footwear if combining the beach with coastal walking."
  ],
  "photography_notes": "Praia do Burgau photographs well from the sand and safe elevated village viewpoints, with the fishing-village houses, cliffs and small harbour character giving a strong west Algarve identity. Avoid unsafe cliff edges and working fishing areas when taking photographs.",
  "family_notes": "Burgau can suit families who want a smaller village beach with seasonal support and restaurants nearby. Families should still check beach flags, supervise children near boats, rocks and the waterline, and plan around limited sand space at busier times.",
  "safety_notes": "Sea conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Keep away from cliff edges and cliff bases, and respect working fishing areas on the beach.",
  "accessibility_notes": "Accessible-beach support was not verified from authoritative current sources. Visitors with reduced mobility should confirm current access, parking, gradients and seasonal support before visiting.",
  "seo": {
    "meta_title": "Praia do Burgau, Vila do Bispo | Beach Guide",
    "meta_description": "Praia do Burgau in Vila do Bispo is a popular village beach with fishing heritage, cliffs, services, bodyboard appeal and Blue Flag status.",
    "keywords": [
      "Praia do Burgau",
      "Burgau Beach",
      "Praia do Burgau Vila do Bispo",
      "Vila do Bispo beaches",
      "Algarve beaches",
      "Portugal beaches",
      "village beach Algarve",
      "fishing village beach",
      "Blue Flag Burgau",
      "bodyboard Burgau",
      "Praia da Salema nearby",
      "Praia da Luz nearby",
      "Rota Vicentina Burgau"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Burgau",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-burgau",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Vila do Bispo",
        "Former fishing port",
        "Western area reserved for bathers",
        "Small port area on the eastern side",
        "Integration into the fishing village",
        "Bodyboard conditions",
        "Facilities including Blue Flag, surveillance, sunshade rental, showers, parking, bar, restaurant, bodyboard and windsurf",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Burgau",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/burgau/",
      "facts_verified": [
        "Official Burgau beach entry",
        "Coastal beach classification",
        "Municipality of Vila do Bispo",
        "Coordinates",
        "Beach code PTCV3K",
        "2026 Blue Flag season",
        "Individual page checked and found to show an inconsistent 2026 bathing-season end date"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/wp-content/uploads/sites/2/2026/04/BA_listas-regioes_2026.pdf",
      "facts_verified": [
        "Burgau listed among Vila do Bispo’s 2026 Blue Flag beach locations",
        "Vila do Bispo 2026 Blue Flag locations checked"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia do Burgau",
      "source_url": "https://visitalgarve.pt/equipamento/8785/praia-do-burgau",
      "facts_verified": [
        "Burgau integrated into the village",
        "Urban beach character",
        "Western limit of the Parque Natural do Sudoeste Alentejano e Costa Vicentina, based on official regional tourism summary"
      ]
    },
    {
      "source_name": "Câmara Municipal de Vila do Bispo - Burgau",
      "source_url": "https://www.cm-viladobispo.pt/visitar/o-que-visitar/praias/burgau",
      "facts_verified": [
        "Municipal beach page for Burgau",
        "Beach in Vila do Bispo municipality",
        "Village marking the beginning of the Parque Natural do Sudoeste Alentejano e Costa Vicentina, based on official municipal search-result summary"
      ]
    },
    {
      "source_name": "VisitPortugal - Vicentina Coast",
      "source_url": "https://www.visitportugal.com/en/content/vicentina-coast",
      "facts_verified": [
        "Costa Vicentina coastal strip between Odeceixe and Burgau",
        "Nature-preserved west Algarve context"
      ]
    },
    {
      "source_name": "VisitPortugal - Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "source_url": "https://www.visitportugal.com/pt-pt/content/parque-natural-do-sudoeste-alentejano-e-costa-vicentina",
      "facts_verified": [
        "Protected natural-park context extending to Burgau in the Algarve",
        "Cliff-dominated landscape",
        "Conservation and biodiversity context"
      ]
    },
    {
      "source_name": "Rota Vicentina - Salema to Luz",
      "source_url": "https://rotavicentina.com/walking/salema-luz/",
      "facts_verified": [
        "Official Rota Vicentina page for the Salema to Luz walking section",
        "Nearby coastal walking-network context"
      ]
    },
    {
      "source_name": "Rota Vicentina - Pelos Trilhos do Sul",
      "source_url": "https://rotavicentina.com/programas/rota-vicentina-pelos-trilhos-do-sul/",
      "facts_verified": [
        "Burgau to Zavial walking day referenced as 15 km",
        "Nearby Salema, Praia da Luz, coastal heritage and walking context",
        "Rota Vicentina extension towards Lagos and south-west Algarve"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia de Salema",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-salema",
      "facts_verified": [
        "Nearby Salema beach",
        "Fishing heritage",
        "Location between Sagres and Lagos"
      ]
    },
    {
      "source_name": "Património Cultural - Forte de Almádena / Forte da Boca do Rio",
      "source_url": "https://imovel.patrimoniocultural.gov.pt/detalhes.php?code=72858",
      "facts_verified": [
        "Nearby Forte de Almádena / Forte da Boca do Rio",
        "Historic coastal defence context",
        "Boca do Rio area and maritime heritage"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, village setting, former fishing-port identity, service listing, bodyboard and windsurf references, coordinates and Blue Flag 2026 listing were verified from official tourism and ABAAE sources.",
    "The phrase “popular village beach” is supported cautiously by the beach’s official service listing, Blue Flag status, village integration and established tourism presence, without using review-platform rankings or scores.",
    "ABAAE verifies Burgau as a 2026 Blue Flag location and lists the 2026 Blue Flag season as 1 July 2026 to 30 September 2026. The individual page showed an inconsistent bathing-season end date, so exact bathing-season dates should be manually checked before publication updates.",
    "Facilities are included only where listed by VisitPortugal and marked Seasonal where operation may depend on bathing season or concession activity.",
    "Accessible-beach support and toilets were not verified from authoritative current sources and are marked Not verified.",
    "Some municipal and regional tourism pages returned limited accessible text when opened, so their facts are used cautiously from official search-result summaries and supported by VisitPortugal, ABAAE and VisitPortugal protected-area context.",
    "Coordinates are taken from the official ABAAE Burgau beach entry.",
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
  where slug = 'burgau';

  if v_city_id is null then
    raise exception 'Burgau city was not found';
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
