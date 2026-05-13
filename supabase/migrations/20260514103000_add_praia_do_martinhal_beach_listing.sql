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
  v_slug text := 'praia-do-martinhal-vila-do-bispo';
  v_name text := 'Praia do Martinhal';
  v_address text := 'Praia do Martinhal, Sagres, Vila do Bispo, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-do-martinhal';
  v_latitude numeric := 37.0202;
  v_longitude numeric := -8.9254;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Martinhal",
  "slug": "praia-do-martinhal-vila-do-bispo",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Sagres / Martinhal",
  "concelho": "Vila do Bispo",
  "municipality": "Vila do Bispo",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Martinhal is a family-oriented resort beach near Sagres, in the municipality of Vila do Bispo. Set in a wide sandy bay with offshore islets and water-sports appeal, it offers one of the most practical beach settings around Sagres.",
  "full_description": "Praia do Martinhal sits around 2 km east of Sagres, in the municipality of Vila do Bispo, where the south-west Algarve begins to soften into a broader bay. Official tourism sources describe it as a large sandy beach with regular swell, appreciated by surfers and windsurfers, while the offshore rocks form small islets that shelter marine life and give the bay a distinctive seaward view.\n\nThe beach is closely associated with a family-focused resort setting behind the sand, but it remains a public beach and should be presented independently. Its wide sand, nearby services and easier access make Martinhal especially useful for families, couples and visitors staying in or around Sagres who want more space than the smaller cliff beaches nearby.\n\nMartinhal has a different character from Tonel and Beliche. It feels more open and practical, with a resort and water-sports atmosphere rather than a dramatic cliff-cove setting. VisitPortugal lists Blue Flag, seasonal surveillance, sunshade rental, parking, bar, restaurant and activities including surf, bodyboard and windsurf. These services may depend on the bathing season and local concession operation.\n\nABAAE lists Martinhal as a 2026 Blue Flag beach, with the bathing season from 1 June to 30 September 2026 and the Blue Flag season from 1 July to 30 September 2026. Sea and wind conditions can vary, so visitors should always follow local flags, signage and official safety guidance.",
  "coordinates": {
    "latitude": 37.0202,
    "longitude": -8.9254,
    "label": "Praia do Martinhal",
    "notes": "Coordinates were taken from the official ABAAE Vila do Bispo municipality beach listing for Martinhal."
  },
  "beach_type": "Large sandy maritime beach in a bay",
  "landscape": "A broad sandy beach near Sagres, with dune and bay scenery, offshore rocky islets, open Atlantic water and a family-resort backdrop.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Vila do Bispo municipal information describes Praia do Martinhal as 650 m long by 50 m wide at high tide, with dune shelter and limestone cliff character on the eastern side. Visitors should confirm current parking and access conditions before travelling in peak summer.",
  "highlights": [
    "Large sandy beach around 2 km east of Sagres",
    "Family-oriented resort setting behind the bay",
    "Offshore islets and marine-life interest",
    "Surf, bodyboard and windsurf listed by VisitPortugal",
    "Part of the wider Costa Vicentina natural-park landscape",
    "Official 2026 Blue Flag listing for Martinhal"
  ],
  "best_for": [
    "Families",
    "Resort beach days",
    "Couples",
    "Water sports",
    "Windsurfing when conditions are suitable",
    "Surfing when conditions are suitable",
    "Long beach walks",
    "Sagres stays",
    "Photography"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Surf activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Bodyboard activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Windsurf activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Accessible beach support", "status": "Not verified" },
    { "name": "Showers", "status": "Not verified" },
    { "name": "Toilets", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Sunshade rental",
    "Car parking",
    "Bar and restaurant",
    "Surf, bodyboard and windsurf activity",
    "Offshore islets",
    "Family-oriented resort context"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full summer beach support. May, June and September are often more comfortable for families and beach walks, with less peak-summer pressure.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Martinhal as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Martinhal as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nFacilities, surveillance and water-sports services may vary by season and concession operation.\nAlthough Martinhal is more family-oriented than some Sagres surf beaches, sea and wind conditions can still vary.\nVisitors should follow beach flags, local signage and official safety guidance before swimming or practising water sports.\nThe surrounding dune and natural-park environment should be respected; use marked access routes where available.\nAccessibility support for the current season was not fully verified and should be checked before visiting.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Martinhal as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Martinhal as 1 July 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Facilities, surveillance and water-sports services may vary by season and concession operation.",
      "Although Martinhal is more family-oriented than some Sagres surf beaches, sea and wind conditions can still vary.",
      "Visitors should follow beach flags, local signage and official safety guidance before swimming or practising water sports.",
      "The surrounding dune and natural-park environment should be respected; use marked access routes where available.",
      "Accessibility support for the current season was not fully verified and should be checked before visiting."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Martinhal as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Martinhal as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nFacilities, surveillance and water-sports services may vary by season and concession operation.\nAlthough Martinhal is more family-oriented than some Sagres surf beaches, sea and wind conditions can still vary.\nVisitors should follow beach flags, local signage and official safety guidance before swimming or practising water sports.\nThe surrounding dune and natural-park environment should be respected; use marked access routes where available.\nAccessibility support for the current season was not fully verified and should be checked before visiting.",
  "best_time_to_visit": "June to September for the official bathing season and full summer beach support. May, June and September are often more comfortable for families and beach walks, with less peak-summer pressure.",
  "suitable_for": [
    "Families staying near Sagres",
    "Visitors seeking a larger beach close to the village",
    "Couples wanting a practical beach with services nearby",
    "Water-sports users when conditions are suitable",
    "Visitors interested in a resort-adjacent beach setting",
    "Beach walkers",
    "Visitors exploring the south-west Algarve"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote wild beach with no resort influence",
    "Visitors expecting guaranteed calm sea conditions",
    "Visitors requiring verified accessible-beach support without current confirmation",
    "Those who prefer small cliff coves",
    "Visitors wanting a nightlife-focused beach setting"
  ],
  "nearby_attractions": [
    {
      "name": "Sagres",
      "type": "Village",
      "description": "A south-west Algarve village close to Martinhal, useful for restaurants, services, surf culture and access to nearby headlands and beaches.",
      "verification_status": "Verified"
    },
    {
      "name": "Fortaleza de Sagres",
      "type": "Historic fortress",
      "description": "A major historic monument on Ponta de Sagres, close to the village and connected with Portugal’s maritime heritage.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Mareta",
      "type": "Nearby beach",
      "description": "A central Sagres beach with a large sandy bay and good village access, useful for comparing conditions around the headland.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Tonel",
      "type": "Nearby surf beach",
      "description": "A Sagres surf and bodyboard beach west of the village, set below cliffs between Cabo de São Vicente and Ponta de Sagres.",
      "verification_status": "Verified"
    },
    {
      "name": "Cabo de São Vicente",
      "type": "Headland and lighthouse area",
      "description": "A symbolic south-western headland near Sagres, suitable for dramatic Atlantic views and wider exploration of Vila do Bispo.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia dos Rebolinhos",
      "type": "Nearby small cove",
      "description": "A small neighbouring cove east of Martinhal referenced by regional tourism alongside Praia do Martinhal; access and conditions should be checked locally.",
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
      "name": "Sagres to Martinhal local coastal walk",
      "description": "A local coastal outing between Sagres and Martinhal, suitable for visitors staying in the village. Route condition, wind and access should be checked locally before setting out.",
      "verification_status": "Not verified"
    },
    {
      "name": "Rota Vicentina / Fishermen’s Trail - Sagres area",
      "description": "The wider Rota Vicentina coastal walking network passes through the Sagres and south-west Algarve area, following exposed coastal terrain and protected landscapes.",
      "verification_status": "Verified"
    },
    {
      "name": "Caminho Histórico: Vila do Bispo - Cabo de São Vicente",
      "description": "A 14 km Rota Vicentina section listed by Portuguese Trails, relevant for visitors exploring the wider Vila do Bispo and Sagres coastline.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Check wind and sea conditions before planning water sports, especially windsurfing.",
    "Arrive early in July and August for easier access to parking and serviced areas.",
    "Treat Blue Flag and surveillance as seasonal rather than permanent.",
    "Confirm current beach support and concession services before visiting outside the main bathing season.",
    "Use marked paths to protect dunes and coastal vegetation.",
    "For photography, include the offshore islets and wide bay view, especially in softer morning or late-afternoon light.",
    "Compare conditions with Mareta or Tonel if wind or swell is unsuitable on the day."
  ],
  "photography_notes": "Praia do Martinhal photographs well for its broad bay, clean sandy lines, offshore islets and views back towards the Sagres area. Early morning and late afternoon usually offer softer light and a quieter atmosphere.",
  "family_notes": "Praia do Martinhal can suit families because of its wide sand, resort-adjacent setting and verified beach services. Families should still check flags, sea state and wind conditions, and choose supervised seasonal periods where available.",
  "safety_notes": "Sea and wind conditions can vary, and the beach is used for surf, bodyboard and windsurf. Follow beach flags, local signage and instructions from surveillance teams where present. Take care around water-sports zones and rocky areas near the islets or beach edges.",
  "accessibility_notes": "Current accessible-beach support was not fully verified from authoritative current sources. Visitors with reduced mobility should confirm the best access point, surface conditions, parking and seasonal support before visiting.",
  "seo": {
    "meta_title": "Praia do Martinhal, Vila do Bispo | Beach Guide",
    "meta_description": "Praia do Martinhal near Sagres is a family-oriented resort beach with wide sand, offshore islets, water sports and Blue Flag status.",
    "keywords": [
      "Praia do Martinhal",
      "Martinhal Beach",
      "Praia do Martinhal Sagres",
      "Vila do Bispo beaches",
      "Sagres beaches",
      "Algarve beaches",
      "Portugal beaches",
      "family beach Sagres",
      "resort beach Vila do Bispo",
      "Blue Flag Martinhal",
      "windsurf Sagres",
      "surf beach Sagres",
      "Costa Vicentina beach"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Martinhal",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-martinhal",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location 2 km from Sagres",
        "Municipality of Vila do Bispo",
        "Large sandy beach",
        "Regular swell",
        "Surf and windsurf relevance",
        "Offshore rocks forming small islets",
        "Marine-life interest around the islets",
        "Facilities including Blue Flag, safety or surveillance, sunshade rental, parking, bar and restaurant",
        "Activities including surf, bodyboard and windsurf",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Martinhal",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/martinhal/",
      "facts_verified": [
        "Official Martinhal beach entry",
        "Municipality of Vila do Bispo",
        "Beach code PTCN8E",
        "Hydrographic region RH8 - Ribeiras do Algarve"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Vila do Bispo municipality page",
      "source_url": "https://bandeiraazul.abaae.pt/municipio/vila-do-bispo/",
      "facts_verified": [
        "Martinhal listed among Vila do Bispo’s 2026 Blue Flag locations",
        "Coordinates",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/wp-content/uploads/sites/2/2026/04/BA_listas-regioes_2026.pdf",
      "facts_verified": [
        "Martinhal listed under Vila do Bispo in the 2026 Blue Flag regional list",
        "Nearby Vila do Bispo Blue Flag beaches listed for 2026"
      ]
    },
    {
      "source_name": "Câmara Municipal de Vila do Bispo - Martinhal",
      "source_url": "https://www.cm-viladobispo.pt/visitar/o-que-visitar/praias/martinhal",
      "facts_verified": [
        "Official municipal beach page for Martinhal",
        "Beach dimensions of 650 m by 50 m at high tide, based on official search-result summary",
        "Dune cordon sheltering the beach from north-west winds, based on official search-result summary",
        "Limestone cliff on the eastern side, based on official search-result summary"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia do Martinhal e Praia dos Rebolinhos",
      "source_url": "https://visitalgarve.pt/equipamento/8802/praia-do-martinhal-e-praia-dos-rebolinhos",
      "facts_verified": [
        "Regional tourism listing for Praia do Martinhal and Praia dos Rebolinhos",
        "Martinhal located east of Sagres",
        "Shelter from Ponta da Baleeira, based on official search-result summary",
        "Potential wind exposure, based on official search-result summary"
      ]
    },
    {
      "source_name": "VisitPortugal - Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "source_url": "https://www.visitportugal.com/pt-pt/content/parque-natural-do-sudoeste-alentejano-e-costa-vicentina",
      "facts_verified": [
        "Protected-area context from Porto Covo to Burgau",
        "Cliff and coastal landscape context",
        "Nature-conservation relevance for the south-west coast"
      ]
    },
    {
      "source_name": "ICNF - Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "source_url": "https://www.icnf.pt/conservacao/rnapareasprotegidas/parquesnaturais/pnsudoestealentejanoecostavicentina",
      "facts_verified": [
        "Official ICNF protected-area page",
        "Natural-park context for the south-western coast"
      ]
    },
    {
      "source_name": "Natural.pt - Praia do Martinhal: aves limícolas e fornos romanos",
      "source_url": "https://natural.pt/protected-areas/parque-natural-sudoeste-alentejano-costa-vicentina/points-of-interest/praia-martinhal-aves-limicolas-fornos-romanos",
      "facts_verified": [
        "Protected-area point-of-interest page for Martinhal",
        "Dunes, saltmarsh vegetation and wading-bird context from official search-result summary",
        "Roman kiln heritage reference from page title and protected-area listing"
      ]
    },
    {
      "source_name": "Martinhal Sagres Family Beach Resort",
      "source_url": "https://www.martinhal.com/pt/resorts/sagres/",
      "facts_verified": [
        "Family-focused resort located overlooking Praia do Martinhal",
        "Resort setting used only as contextual support and not as a public endorsement or partnership claim"
      ]
    },
    {
      "source_name": "VisitPortugal - Sagres",
      "source_url": "https://www.visitportugal.com/pt-pt/content/sagres-1",
      "facts_verified": [
        "Sagres visitor context",
        "Cabo de São Vicente nearby",
        "South-western coastal setting"
      ]
    },
    {
      "source_name": "VisitPortugal - Fortaleza de Sagres",
      "source_url": "https://www.visitportugal.com/pt-pt/content/fortaleza-de-sagres",
      "facts_verified": [
        "Fortaleza de Sagres as nearby historic monument",
        "Ponta de Sagres maritime heritage context"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Mareta",
      "source_url": "https://www.visitportugal.com/en/node/141502",
      "facts_verified": [
        "Nearby Praia da Mareta",
        "Large sandy beach in Sagres",
        "Good access and central Sagres context"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia do Tonel",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-tonel",
      "facts_verified": [
        "Nearby Praia do Tonel",
        "Sagres surf and bodyboard beach context",
        "Position between Cabo de São Vicente and Ponta de Sagres"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Sagres location, Vila do Bispo municipality, large sandy character, offshore islets, water-sports relevance, facilities, coordinates and 2026 Blue Flag season were verified from official tourism and ABAAE sources.",
    "The phrase “family/resort beach near Sagres” is supported cautiously by the verified large sandy bay, services, access and nearby family-focused resort setting. The listing does not imply endorsement, partnership or exclusive resort status.",
    "ABAAE verifies Martinhal’s 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where listed by VisitPortugal or ABAAE and marked Seasonal where operation may depend on bathing season or concession activity.",
    "Current accessible-beach support was not verified from authoritative current sources and is therefore marked Not verified.",
    "Showers and toilets were not verified from the primary official sources checked and are marked Not verified.",
    "Some municipal and regional tourism pages returned limited accessible text when opened, so their facts are used cautiously from official search-result summaries and supported by VisitPortugal and ABAAE where possible.",
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
