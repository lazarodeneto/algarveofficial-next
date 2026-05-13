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
  'Sagres',
  'sagres',
  'South-west Algarve village known for Atlantic beaches, surf, cliffs and the Cabo de São Vicente headland.',
  37.009,
  -8.943,
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
  v_slug text := 'praia-do-tonel-vila-do-bispo';
  v_name text := 'Praia do Tonel';
  v_address text := 'Praia do Tonel, Sagres, Vila do Bispo, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-do-tonel';
  v_latitude numeric := 37.005777;
  v_longitude numeric := -8.948119;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Tonel",
  "slug": "praia-do-tonel-vila-do-bispo",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Sagres",
  "concelho": "Vila do Bispo",
  "municipality": "Vila do Bispo",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Tonel is a well-known Sagres surf beach in Vila do Bispo, set below dramatic cliffs between Cabo de São Vicente and Ponta de Sagres. Popular with surfers and bodyboarders, it offers a powerful Atlantic setting close to the historic Sagres headland.",
  "full_description": "Praia do Tonel is one of the key surf beaches in the Sagres area, located in the municipality of Vila do Bispo on the south-western edge of the Algarve. Official tourism sources place it in the bay between Cabo de São Vicente and Ponta de Sagres, with a sheltered sandy area below high cliffs and access from the EN268 by a wide ramp cut into the cliff.\n\nThe beach is especially associated with surfing and bodyboarding. VisitPortugal describes it as much sought after by surfers and bodyboarders, giving Tonel a distinct Atlantic character compared with more sheltered resort beaches elsewhere in the Algarve. Conditions can vary significantly, and the beach should be approached as a surf-oriented west Algarve beach rather than a guaranteed calm swimming spot.\n\nTonel is also valuable for its location. It sits close to Sagres village, the Fortaleza de Sagres and the route towards Cabo de São Vicente, making it a natural stop for visitors exploring the south-western headlands, coastal viewpoints and protected landscapes of the Costa Vicentina. The surrounding cliffs and open horizon give the beach a strong visual identity, especially in softer light.\n\nABAAE lists Tonel as a 2026 Blue Flag beach, with a bathing season from 1 June to 30 September 2026 and a Blue Flag season from 1 July to 30 September 2026. Facilities and surveillance should still be treated as seasonal, and visitors should follow local flags, signage and cliff-safety guidance.",
  "coordinates": {
    "latitude": 37.005777,
    "longitude": -8.948119,
    "label": "Praia do Tonel",
    "notes": "Coordinates were taken from the official ABAAE Tonel beach entry."
  },
  "beach_type": "Sandy Atlantic surf beach below cliffs",
  "landscape": "A sandy beach backed by high cliffs, with Atlantic surf, open sea views and a dramatic Sagres headland setting between Cabo de São Vicente and Ponta de Sagres.",
  "access": "Access is verified by VisitPortugal as being through a wide ramp cut into the cliff from the EN268. Visit Algarve also references asphalted road access from Sagres towards Fortaleza de Sagres, with parking close to the beach and wider parking nearby. Visitors should confirm current access and parking conditions before travelling in peak summer or strong surf periods.",
  "highlights": [
    "Well-known Sagres surf and bodyboard beach",
    "Set between Cabo de São Vicente and Ponta de Sagres",
    "Sandy beach below dramatic Atlantic cliffs",
    "Access by a wide ramp cut into the cliff from the EN268",
    "Close to Fortaleza de Sagres and Sagres village",
    "Official 2026 Blue Flag listing for Tonel"
  ],
  "best_for": [
    "Surfing",
    "Bodyboarding",
    "Photography",
    "Scenic views",
    "Couples",
    "Nature lovers",
    "Coastal walks",
    "Sagres day trips",
    "West Algarve exploration"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Not verified" },
    { "name": "Restaurant", "status": "Not verified" },
    { "name": "Surf activity", "status": "Verified / conditions dependent" },
    { "name": "Bodyboard activity", "status": "Verified / conditions dependent" },
    { "name": "Ramp access cut into the cliff", "status": "Verified" },
    { "name": "Accessible beach support", "status": "Not verified" },
    { "name": "Toilets", "status": "Not verified" },
    { "name": "Showers", "status": "Not verified" },
    { "name": "Sunshade rental", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Car parking",
    "Surf and bodyboard activity",
    "Ramp access cut into the cliff",
    "Sagres headland setting",
    "Nearby Fortaleza de Sagres",
    "Nearby Cabo de São Vicente"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and seasonal beach support. Spring and autumn can be important surf periods, but conditions should always be checked carefully because Atlantic swell and wind can change quickly.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Tonel as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Tonel as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia do Tonel is popular with surfers and bodyboarders, but Atlantic conditions can vary significantly.\nAccess is through a ramp cut into the cliff; visitors should still expect a cliff-backed beach environment.\nParking close to the beach may be limited during peak periods, with broader parking nearby according to regional tourism information.\nFacilities and surveillance may vary by season.\nVisitors should avoid cliff edges and cliff bases and follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Tonel as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Tonel as 1 July 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Praia do Tonel is popular with surfers and bodyboarders, but Atlantic conditions can vary significantly.",
      "Access is through a ramp cut into the cliff; visitors should still expect a cliff-backed beach environment.",
      "Parking close to the beach may be limited during peak periods, with broader parking nearby according to regional tourism information.",
      "Facilities and surveillance may vary by season.",
      "Visitors should avoid cliff edges and cliff bases and follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Tonel as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Tonel as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia do Tonel is popular with surfers and bodyboarders, but Atlantic conditions can vary significantly.\nAccess is through a ramp cut into the cliff; visitors should still expect a cliff-backed beach environment.\nParking close to the beach may be limited during peak periods, with broader parking nearby according to regional tourism information.\nFacilities and surveillance may vary by season.\nVisitors should avoid cliff edges and cliff bases and follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "June to September for the official bathing season and seasonal beach support. Spring and autumn can be important surf periods, but conditions should always be checked carefully because Atlantic swell and wind can change quickly.",
  "suitable_for": [
    "Surfers",
    "Bodyboarders",
    "Photographers",
    "Visitors staying in Sagres",
    "Visitors exploring Cabo de São Vicente",
    "Coastal walkers",
    "Nature-focused travellers",
    "Beachgoers comfortable with Atlantic conditions"
  ],
  "not_suitable_for": [
    "Visitors expecting guaranteed calm swimming conditions",
    "Visitors requiring verified accessible-beach support",
    "Families carrying heavy beach equipment without checking access first",
    "Visitors seeking a fully serviced resort beach",
    "Anyone intending to sit close to cliff bases or ignore surf-safety flags"
  ],
  "nearby_attractions": [
    {
      "name": "Fortaleza de Sagres",
      "type": "Historic fortress",
      "description": "A major historic fortress on Ponta de Sagres, close to Praia do Tonel and central to the area’s maritime heritage.",
      "verification_status": "Verified"
    },
    {
      "name": "Cabo de São Vicente",
      "type": "Headland and lighthouse area",
      "description": "A symbolic south-western headland near Sagres, known for its Atlantic horizon and dramatic coastal views.",
      "verification_status": "Verified"
    },
    {
      "name": "Sagres",
      "type": "Village",
      "description": "A west Algarve village close to Tonel, with restaurants, surf services, accommodation and access to several nearby beaches.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Mareta",
      "type": "Nearby beach",
      "description": "A neighbouring Sagres beach listed among Vila do Bispo’s 2026 Blue Flag locations, useful for visitors comparing conditions around the headland.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Beliche",
      "type": "Nearby beach",
      "description": "A dramatic cliff-backed beach west of Sagres, known for surf and bodyboard activity but requiring careful attention to cliff and access conditions.",
      "verification_status": "Verified"
    },
    {
      "name": "Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "type": "Protected natural park",
      "description": "The protected coastal landscape of the south-west, extending through the Vila do Bispo coast and known for cliffs, wild beaches and biodiversity.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Sagres",
    "Vila do Bispo",
    "Raposeira",
    "Budens",
    "Lagos"
  ],
  "walking_trails_nearby": [
    {
      "name": "Rota Vicentina / Fishermen’s Trail - Sagres area",
      "description": "The wider Rota Vicentina coastal walking network passes through the Sagres and south-west Algarve area, following exposed coastal terrain, cliffs and sandy paths. Walkers should follow official markings and avoid cliff edges.",
      "verification_status": "Verified"
    },
    {
      "name": "Caminho Histórico: Vila do Bispo - Cabo de São Vicente",
      "description": "Portuguese Trails lists this 14 km Rota Vicentina section towards Cabo de São Vicente, with south-west Algarve cliff scenery and coastal views.",
      "verification_status": "Verified"
    },
    {
      "name": "Sagres to Cabo de São Vicente coastal route",
      "description": "A local coastal outing between Sagres and Cabo de São Vicente, passing near Tonel and Beliche. Route condition, wind and cliff safety should be checked locally before setting out.",
      "verification_status": "Not verified"
    }
  ],
  "visitor_tips": [
    "Check surf, tide and wind conditions before entering the water.",
    "Use the official access ramp and avoid informal cliff paths.",
    "Arrive early in peak summer or during good surf conditions, as close parking can be limited.",
    "Bring layers outside summer, as Sagres can feel windy even on sunny days.",
    "Stay away from cliff edges and cliff bases.",
    "For photography, use safe viewpoints above the beach and visit in softer morning or late-afternoon light.",
    "Compare conditions with Mareta, Beliche or Martinhal if wind or surf is unsuitable on the day."
  ],
  "photography_notes": "Praia do Tonel is especially photogenic from safe cliff-top viewpoints and from the sand, with Atlantic waves, ochre cliffs and the Sagres headland creating strong west-Algarve compositions. Visitors should never step beyond safe areas or approach unstable cliff edges for photographs.",
  "family_notes": "Families may enjoy the beach setting, but Tonel is surf-oriented and Atlantic conditions can be changeable. Families should check flags carefully, choose supervised seasonal periods where available and keep children away from cliff areas and strong shorebreak.",
  "safety_notes": "Praia do Tonel is popular with surfers and bodyboarders, so water users should be aware of surf zones, waves and currents. Follow beach flags, local signage and instructions from surveillance teams where present. Avoid cliff bases and cliff edges.",
  "accessibility_notes": "Accessible-beach support was not verified from authoritative current sources. Although access is by a wide ramp cut into the cliff, visitors with reduced mobility should confirm gradient, surface, parking and seasonal support before visiting.",
  "seo": {
    "meta_title": "Praia do Tonel, Vila do Bispo | Sagres Surf Beach",
    "meta_description": "Praia do Tonel in Sagres is a famous Vila do Bispo surf beach with Atlantic cliffs, ramp access, Blue Flag status and Cabo de São Vicente views.",
    "keywords": [
      "Praia do Tonel",
      "Tonel Beach",
      "Praia do Tonel Sagres",
      "Vila do Bispo beaches",
      "Sagres surf beach",
      "Algarve surf beach",
      "Portugal beaches",
      "Costa Vicentina beaches",
      "Blue Flag Tonel",
      "Fortaleza de Sagres",
      "Cabo de São Vicente",
      "bodyboard Sagres",
      "Rota Vicentina Sagres"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia do Tonel trip ideas",
      "links": [
        { "label": "Praia do Tonel" },
        { "label": "Tonel Beach" },
        { "label": "Praia do Tonel Sagres" },
        { "label": "Sagres surf beach" },
        { "label": "Blue Flag Tonel" },
        { "label": "Fortaleza de Sagres" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Sagres" },
        { "label": "Vila do Bispo" },
        { "label": "Raposeira" },
        { "label": "Budens" },
        { "label": "Lagos" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Tonel",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-tonel",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Sagres",
        "Position between Cabo de São Vicente and Ponta de Sagres",
        "Sheltered sandy beach setting",
        "Popularity with surfers and bodyboarders",
        "Access by a wide ramp cut into the cliff from the EN268"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Tonel",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/tonel/",
      "facts_verified": [
        "Official Tonel beach entry",
        "Coastal beach classification",
        "Municipality of Vila do Bispo",
        "Coordinates",
        "Beach code PTCH8M",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/wp-content/uploads/sites/2/2026/04/BA_listas-regioes_2026.pdf",
      "facts_verified": [
        "Tonel listed among Vila do Bispo’s 2026 Blue Flag beach locations",
        "Vila do Bispo 2026 listings checked"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia do Tonel",
      "source_url": "https://visitalgarve.pt/equipamento/8810/praia-do-tonel",
      "facts_verified": [
        "Regional tourism listing for Praia do Tonel",
        "Asphalted road access from Sagres towards Fortaleza de Sagres",
        "Small organised parking close to the beach and wider parking nearby, based on official search-result summary"
      ]
    },
    {
      "source_name": "Câmara Municipal de Vila do Bispo - Tonel",
      "source_url": "https://www.cm-viladobispo.pt/visitar/o-que-visitar/praias/tonel",
      "facts_verified": [
        "Municipal beach page for Tonel",
        "Urban Sagres setting",
        "Proximity of around 500 m to the centre of Sagres from official search-result summary",
        "Beach sought after for location and accessibility from official search-result summary"
      ]
    },
    {
      "source_name": "Câmara Municipal de Vila do Bispo - 2026 Blue Flag news",
      "source_url": "https://www.cm-viladobispo.pt/noticias/vila-do-bispo-tem-12-praias-com-qualidade-de-ouro",
      "facts_verified": [
        "Municipal 2026 beach-quality context",
        "Tonel listed among beaches recognised in the municipal 2026 quality announcement"
      ]
    },
    {
      "source_name": "VisitPortugal - Sagres",
      "source_url": "https://www.visitportugal.com/pt-pt/content/sagres-1",
      "facts_verified": [
        "Sagres visitor context",
        "Ponta de Sagres and Cabo de São Vicente context",
        "South-western coastal setting"
      ]
    },
    {
      "source_name": "VisitPortugal - Fortaleza de Sagres",
      "source_url": "https://www.visitportugal.com/pt-pt/content/fortaleza-de-sagres",
      "facts_verified": [
        "Nearby Fortaleza de Sagres",
        "Historic and maritime heritage context"
      ]
    },
    {
      "source_name": "ICNF - Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "source_url": "https://www.icnf.pt/conservacao/rnapareasprotegidas/parquesnaturais/pnsudoestealentejanoecostavicentina",
      "facts_verified": [
        "Official protected-area context for the Sudoeste Alentejano e Costa Vicentina Natural Park"
      ]
    },
    {
      "source_name": "VisitPortugal - Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "source_url": "https://www.visitportugal.com/pt-pt/content/parque-natural-do-sudoeste-alentejano-e-costa-vicentina",
      "facts_verified": [
        "Protected coastline from Porto Covo to Burgau",
        "Cliff-dominated coastal landscape",
        "Nature and coastal conservation context"
      ]
    },
    {
      "source_name": "Rota Vicentina - Fishermen’s Trail",
      "source_url": "https://rotavicentina.com/trilho-dos-pescadores/",
      "facts_verified": [
        "Fishermen’s Trail coastal walking network",
        "Cliff, sand and exposed coastal terrain context",
        "Walking-only guidance and fragile ecosystem context"
      ]
    },
    {
      "source_name": "Portuguese Trails - Caminho Histórico / Vila do Bispo - Cabo de São Vicente",
      "source_url": "https://www.portuguesetrails.com/pt-pt/routes/rota-vicentina-algarve-walking/caminho-historico-vila-do-bispo-cabo-de-s-vicente",
      "facts_verified": [
        "Vila do Bispo to Cabo de São Vicente Rota Vicentina section",
        "14 km distance",
        "South-west Algarve cliff and coastal panorama context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, Sagres location, surf/bodyboard relevance, access, coordinates and 2026 Blue Flag season were verified from official tourism and ABAAE sources.",
    "The phrase “Sagres surf beach” is supported by VisitPortugal’s wording that Tonel is much sought after by surfers and bodyboarders, plus its verified position in Sagres.",
    "ABAAE verifies Tonel’s 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where verified. Bar, restaurant, showers, toilets, sunshade rental and accessible-beach support were not clearly verified from the primary official sources used and are therefore marked Not verified.",
    "Parking is verified from regional tourism search-result summary, but visitors should confirm current availability and restrictions in peak periods.",
    "Accessibility is not claimed, despite ramp access, because current accessible-beach support was not verified from authoritative sources.",
    "Some municipal and regional tourism pages returned limited accessible text when opened, so facts from those pages are used cautiously and supported where possible by VisitPortugal and ABAAE.",
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
  where slug = 'sagres';

  if v_city_id is null then
    raise exception 'Sagres city was not found';
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
