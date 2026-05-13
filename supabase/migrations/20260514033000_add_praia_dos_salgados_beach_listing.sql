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
  v_slug text := 'praia-dos-salgados-albufeira';
  v_name text := 'Praia dos Salgados';
  v_address text := 'Praia dos Salgados, Galé / Guia, Albufeira, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/en/NR/exeres/797744A0-B4AA-4226-B8D8-D08A50048050';
  v_latitude numeric := 37.088391;
  v_longitude numeric := -8.328967;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia dos Salgados",
  "slug": "praia-dos-salgados-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Galé / Guia, Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia dos Salgados is a large sandy beach in western Albufeira, beside the Salgados Lagoon and close to the Galé resort area. It is known for its wide open shoreline, nearby hotels and nature-rich wetland setting.",
  "full_description": "Praia dos Salgados is one of the broadest beaches in the municipality of Albufeira, located west of Galé and close to the boundary with the wider Armação de Pêra coastline. Official tourism sources describe it as a large sandy beach where the usual ochre cliffs of Albufeira give way to golden dunes and the landscape of the Salgados Lagoon.\n\nThe beach is especially valued for its sense of space. Visit Albufeira describes Salgados as part of a continuous sandy expanse connecting Galé to Armação de Pêra, while VisitPortugal highlights its lagoon backdrop and varied landscape. This makes it well suited to long beach walks, families, resort-stay visitors and anyone wanting a larger beach setting than the compact coves closer to central Albufeira.\n\nThe lagoon behind the dunes is an important wetland area for birdlife, with official tourism sources noting migratory birds, biodiversity and birdwatching interest. Wooden boardwalks help organise access while protecting the dune and wetland environment. Nearby resort accommodation, golf and hotel infrastructure make Salgados a practical beach for visitors staying in the western Albufeira and Galé area, although individual hotels are not named in this public listing.\n\nSalgados is also a serviced bathing beach, with VisitPortugal listing surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant, bodyboard and accessible-beach status. Services may vary by season, and visitors should follow local signage, beach flags and environmental guidance.",
  "coordinates": {
    "latitude": 37.088391,
    "longitude": -8.328967,
    "label": "Praia dos Salgados",
    "notes": "Coordinates were taken from the official ABAAE Salgados beach entry."
  },
  "beach_type": "Large sandy maritime beach with dunes and lagoon backdrop",
  "landscape": "A broad golden-sand beach backed by dune cordons, boardwalks and the Salgados Lagoon wetland, with a more open natural character than many cliff-backed Albufeira beaches.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Visit Albufeira confirms wooden boardwalk access that leads directly to the beach and helps protect the dune ecosystem. Visitors with mobility needs should confirm the most suitable current access point before travelling.",
  "highlights": [
    "Large sandy beach in western Albufeira near Galé",
    "Dune-backed landscape beside the Salgados Lagoon",
    "Long shoreline connecting towards Galé and Armação de Pêra",
    "Important wetland setting with birdwatching interest",
    "Boardwalk access helping protect the dune environment",
    "Official 2026 Blue Flag listing for Salgados"
  ],
  "best_for": [
    "Families",
    "Long beach walks",
    "Resort beach days",
    "Birdwatching",
    "Nature lovers",
    "Accessible beach access",
    "Photography",
    "Bodyboarding when conditions are suitable",
    "Visitors staying near Galé or Salgados"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Small craft hire", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Outdoor parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Bodyboard", "status": "Seasonal / conditions dependent" },
    { "name": "Wooden boardwalk access", "status": "Verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Seasonal sunshade rental",
    "Small craft hire",
    "Showers",
    "Outdoor parking",
    "Bar and restaurant",
    "Bodyboard context",
    "Wooden boardwalk access"
  ],
  "important_information": {
    "best_time_to_visit": "May to October for the official bathing season. Spring, early summer and September are especially good for long walks, birdwatching around the lagoon and a quieter beach experience outside peak August pressure.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Salgados as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for Salgados as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nFacilities and beach-support services may vary by season and concession operation.\nThe lagoon and dunes are sensitive environments; visitors should use marked paths and boardwalks.\nBirdwatching should be done respectfully, without disturbing wildlife or entering restricted wetland areas.\nSea and wind conditions can vary; the beach is listed for bodyboarding and water-sports use, but visitors should follow flags and local safety guidance.\nNearby hotel and resort infrastructure increases convenience but may also increase summer footfall around the main access points.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Salgados as 15 May 2026 to 15 October 2026.",
      "ABAAE lists the 2026 Blue Flag season for Salgados as 1 July 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Facilities and beach-support services may vary by season and concession operation.",
      "The lagoon and dunes are sensitive environments; visitors should use marked paths and boardwalks.",
      "Birdwatching should be done respectfully, without disturbing wildlife or entering restricted wetland areas.",
      "Sea and wind conditions can vary; the beach is listed for bodyboarding and water-sports use, but visitors should follow flags and local safety guidance.",
      "Nearby hotel and resort infrastructure increases convenience but may also increase summer footfall around the main access points."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Salgados as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for Salgados as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nFacilities and beach-support services may vary by season and concession operation.\nThe lagoon and dunes are sensitive environments; visitors should use marked paths and boardwalks.\nBirdwatching should be done respectfully, without disturbing wildlife or entering restricted wetland areas.\nSea and wind conditions can vary; the beach is listed for bodyboarding and water-sports use, but visitors should follow flags and local safety guidance.\nNearby hotel and resort infrastructure increases convenience but may also increase summer footfall around the main access points.",
  "best_time_to_visit": "May to October for the official bathing season. Spring, early summer and September are especially good for long walks, birdwatching around the lagoon and a quieter beach experience outside peak August pressure.",
  "suitable_for": [
    "Families wanting a large serviced beach",
    "Visitors staying in Galé, Salgados or western Albufeira",
    "Beach walkers",
    "Birdwatchers",
    "Nature-focused travellers",
    "Visitors needing accessible-beach recognition, subject to current confirmation",
    "Bodyboarders when conditions are suitable",
    "Visitors looking for a beach near hotels and resort services"
  ],
  "not_suitable_for": [
    "Visitors seeking dramatic cliff-cove scenery",
    "Visitors wanting a small sheltered beach",
    "Those expecting a completely remote beach with no resort influence",
    "Visitors requiring accessibility support without confirming current seasonal arrangements",
    "Anyone intending to walk through protected dunes or disturb lagoon wildlife"
  ],
  "nearby_attractions": [
    {
      "name": "Lagoa dos Salgados",
      "type": "Wetland and lagoon area",
      "description": "A lagoon and wetland behind the dunes, noted by official tourism sources for migratory birds, biodiversity and birdwatching interest.",
      "verification_status": "Verified"
    },
    {
      "name": "Passadiços dos Salgados",
      "type": "Boardwalk / walking route",
      "description": "A wooden boardwalk route beside the Salgados Lagoon, described by Visit Albufeira as flat, accessible and suitable for walking, family outings and birdwatching.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Galé",
      "type": "Nearby beach",
      "description": "A neighbouring Albufeira beach to the east, with Galé-Leste and Galé-Oeste sections and a wider beach connection towards Salgados.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia Grande de Pêra",
      "type": "Nearby beach",
      "description": "A neighbouring long sandy beach west of the Salgados Lagoon, useful for wider shoreline walks when conditions allow.",
      "verification_status": "Verified"
    },
    {
      "name": "Armação de Pêra",
      "type": "Nearby coastal town",
      "description": "A coastal town west of the Salgados shoreline, connected with the wider sandy bay and useful for restaurants, services and extended coastal exploration.",
      "verification_status": "Verified"
    },
    {
      "name": "Salgados resort and golf area",
      "type": "Resort and golf area",
      "description": "The developed resort and golf area near the beach provides nearby visitor accommodation and services. Individual hotels are not named in this listing because they were not separately verified.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Galé",
    "Guia",
    "Albufeira",
    "Armação de Pêra",
    "Pêra",
    "Ferreiras"
  ],
  "walking_trails_nearby": [
    {
      "name": "Passadiços dos Salgados",
      "description": "A wooden boardwalk route next to the Salgados Lagoon, officially described as flat, accessible and suitable for relaxed walks, family outings, jogging and birdwatching.",
      "verification_status": "Verified"
    },
    {
      "name": "Salgados to Galé shoreline walk",
      "description": "A long sandy shoreline walk from Salgados towards Galé, best planned according to tide, wind and weather conditions.",
      "verification_status": "Verified"
    },
    {
      "name": "Salgados Lagoon and Praia Grande nature walk",
      "description": "A nature-focused walk around the lagoon and dune landscape towards Praia Grande, using boardwalks and authorised paths where available.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Use the boardwalks and marked routes to protect the dunes and lagoon habitats.",
    "Bring binoculars if you want to observe birds around the lagoon.",
    "Arrive early in July and August if you want easier access to the most convenient parking and serviced areas.",
    "Confirm accessible-beach support before travelling if adapted equipment or assistance is required.",
    "Check wind and sea conditions before bodyboarding or using water-sports services.",
    "Avoid entering the lagoon or disturbing wildlife.",
    "For photography and birdwatching, early morning and late afternoon are usually more rewarding."
  ],
  "photography_notes": "Praia dos Salgados is best photographed for its open sand, dunes, lagoon reflections, boardwalks and wide western-Albufeira light. Early morning and sunset are particularly suitable for softer beach and wetland images.",
  "family_notes": "Praia dos Salgados can suit families because of its wide sand, official beach services, boardwalk access and nearby resort infrastructure. Families should still choose supervised seasonal areas, check beach flags and keep children away from sensitive lagoon and dune zones.",
  "safety_notes": "Sea and wind conditions can vary. Follow local flags, signage and instructions from beach surveillance where present. Use marked access paths, avoid entering the lagoon, and take care around water-sports activity zones.",
  "accessibility_notes": "VisitPortugal lists Praia dos Salgados as an accessible beach, and 2025 official accessible-beach lists include Salgados. Current seasonal support, adapted equipment and the most suitable access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia dos Salgados, Albufeira | Beach Guide",
    "meta_description": "Praia dos Salgados in Albufeira is a large beach near hotels, dunes and Salgados Lagoon, with boardwalks, birdlife and Blue Flag status.",
    "keywords": [
      "Praia dos Salgados",
      "Salgados Beach",
      "Praia dos Salgados Albufeira",
      "Albufeira beaches",
      "Galé beaches",
      "Guia Albufeira",
      "Algarve beaches",
      "Portugal beaches",
      "Lagoa dos Salgados",
      "Salgados Lagoon",
      "Passadiços dos Salgados",
      "family beach Albufeira",
      "accessible beach Albufeira",
      "Blue Flag Salgados"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia dos Salgados trip ideas",
      "links": [
        { "label": "Praia dos Salgados" },
        { "label": "Salgados Beach" },
        { "label": "Praia dos Salgados Albufeira" },
        { "label": "Lagoa dos Salgados" },
        { "label": "Salgados Lagoon" },
        { "label": "Passadiços dos Salgados" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Praia da Galé" },
        { "label": "Praia Grande de Pêra" },
        { "label": "Armação de Pêra" },
        { "label": "Galé" },
        { "label": "Guia" },
        { "label": "Pêra" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia dos Salgados",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/797744A0-B4AA-4226-B8D8-D08A50048050",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Albufeira",
        "Large beach area",
        "Ochre-cliff landscape giving way to golden dunes",
        "Salgados Lagoon behind the dunes",
        "Migratory birds and protected species context",
        "Water-sports, surf and bodyboard context",
        "Facilities including Blue Flag, surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant, bodyboard and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "Visit Albufeira - Praia dos Salgados",
      "source_url": "https://visitalbufeira.pt/praia/praia-dos-salgados",
      "facts_verified": [
        "Praia dos Salgados as one of Albufeira’s broadest and most natural beaches",
        "Continuous sandy expanse connecting Galé to Armação de Pêra",
        "Location beside Salgados Lagoon",
        "Wetland, birdlife and biodiversity context",
        "Boardwalk access protecting the dune ecosystem",
        "Nature-lover and birdwatching suitability"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Salgados",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/salgados/",
      "facts_verified": [
        "Official Salgados coastal beach entry",
        "Municipality of Albufeira",
        "Coordinates",
        "Beach code PTCF2J",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at the time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Albufeira municipality page",
      "source_url": "https://bandeiraazul.abaae.pt/municipio/albufeira/",
      "facts_verified": [
        "Salgados listed among Albufeira’s 2026 Blue Flag locations",
        "Municipality, coordinates and season details cross-checked"
      ]
    },
    {
      "source_name": "Câmara Municipal de Albufeira - Salgados",
      "source_url": "https://www.cm-albufeira.pt/praias/salgados",
      "facts_verified": [
        "Municipal beach page for Salgados",
        "Very extensive golden-sand beach from official search-result summary",
        "Beach located east of Lagoa dos Salgados",
        "Quieter stretches noted in municipal search-result summary"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia dos Salgados",
      "source_url": "https://visitalgarve.pt/Equipamento/8826/Praia%20dos%20Salgados",
      "facts_verified": [
        "Regional tourism listing for Praia dos Salgados",
        "Continuation of Praia Grande sands east of Lagoa dos Salgados from search-result summary",
        "Wetland formed at the lower stretch of the Espiche stream from search-result summary",
        "Access through tourism development associated with the golf course from search-result summary"
      ]
    },
    {
      "source_name": "Visit Albufeira - Passadiços dos Salgados",
      "source_url": "https://visitalbufeira.pt/experiencias/passadicos-dos-salgados/",
      "facts_verified": [
        "Passadiços dos Salgados as a walking route",
        "Location next to Salgados Lagoon",
        "Wooden boardwalk crossing a protected wetland area",
        "Flat and accessible path",
        "Suitability for walks, family outings, jogging and birdwatching"
      ]
    },
    {
      "source_name": "ICNF - Lagoa dos Salgados",
      "source_url": "https://www.icnf.pt/noticias/lagoadossalgados",
      "facts_verified": [
        "Environmental importance of Lagoa dos Salgados",
        "High-value coastal refuge for fauna and flora",
        "Nature-conservation context"
      ]
    },
    {
      "source_name": "Diário da República - Aviso n.º 22090-A/2021",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/aviso/22090-a-2021-174824614",
      "facts_verified": [
        "Public consultation process for proposed classification of Lagoa dos Salgados as a national protected area",
        "ICNF role in the classification proposal"
      ]
    },
    {
      "source_name": "Agência Portuguesa do Ambiente - Lista de Praias Acessíveis 2025",
      "source_url": "https://apambiente.pt/sites/default/files/_Agua/DRH/Acoes/OrdenamentoAcessibilidade/PraiasAcessiveis/Documentos/lista_praias_galardoadas_acessivel_08-2025.pdf",
      "facts_verified": [
        "Salgados listed among accessible beaches in 2025",
        "Accessible-beach recognition treated as requiring current seasonal confirmation"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Albufeira municipality, large sandy character, dunes, Salgados Lagoon context, boardwalk access, Blue Flag 2026 details and coordinates were verified from official tourism and ABAAE sources.",
    "The phrase “large beach, hotels, lagoon area” is handled as large beach, nearby resort/hotel infrastructure and lagoon setting. Individual hotels were not named because they were not separately verified for this listing.",
    "ABAAE verifies Salgados’ 2026 bathing season as 15 May 2026 to 15 October 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is verified at recognition level through VisitPortugal and 2025 official accessible-beach material, but current adapted equipment and support should be confirmed before visiting.",
    "The municipal and Visit Algarve pages returned limited accessible text or search-result summaries during verification; their facts are used cautiously and supported by VisitPortugal, Visit Albufeira and ABAAE where possible.",
    "Protected-area classification for Lagoa dos Salgados should be treated carefully: official sources verify conservation importance and a formal classification proposal/public consultation, but this listing does not claim a final current protected-area designation.",
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
