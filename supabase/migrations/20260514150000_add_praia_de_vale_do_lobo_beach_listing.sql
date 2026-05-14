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
  'Vale do Lobo',
  'vale-do-lobo',
  'Golden Triangle resort area in Loulé known for red cliffs, golf, restaurants and beach access.',
  37.049,
  -8.064,
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
  v_slug text := 'praia-de-vale-do-lobo-loule';
  v_name text := 'Praia de Vale do Lobo';
  v_address text := 'Praia de Vale do Lobo, Vale do Lobo, Almancil, Loulé, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/en/NR/exeres/4CD6CEFB-026A-4C00-9737-CEC537B13FE0';
  v_latitude numeric := 37.048601;
  v_longitude numeric := -8.065467;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Vale do Lobo",
  "slug": "praia-de-vale-do-lobo-loule",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Vale do Lobo / Almancil",
  "concelho": "Loulé",
  "municipality": "Loulé",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Vale do Lobo is a resort beach in Loulé, set beside the Vale do Lobo coastal area near Almancil. Known for its red cliffs, long sandy shoreline, beach restaurants and strong tourist demand, it is one of the Golden Triangle’s most established beach settings.",
  "full_description": "Praia de Vale do Lobo is one of the most recognised resort beaches on the Loulé coast, located in Almancil within the wider Golden Triangle area between Quarteira, Quinta do Lago and Vale do Lobo. Official tourism sources describe the beach as being next to the Vale do Lobo tourist resort, framed by reddish cliffs and backed by a carefully maintained environment of pine trees, gardens, golf and leisure facilities.\n\nThe beach has a long sandy shoreline that continues for kilometres towards neighbouring beaches, making it well suited to beach walks as well as resort-style beach days. Its setting is refined and developed rather than remote: visitors can expect a high level of nearby services, including restaurants, bars, parking, showers, sunshade rental and seasonal beach support listed by official tourism sources.\n\nVale do Lobo is also visually distinctive. The ochre and red cliffs form the beach’s signature landscape, contrasting with pale sand and the green of the surrounding pine and golf-course areas. These cliffs are attractive but vulnerable, and visitors should avoid cliff bases, edges and informal paths.\n\nBecause the beach serves a major resort and residential area, strong tourist demand should be expected in summer, especially around the main access points, restaurant areas and serviced sections. ABAAE lists Vale de Lobo among Loulé’s 2026 Blue Flag locations, but the individual ABAAE page checked during research showed 2025 season dates, so exact current season details should be manually confirmed before publication updates.",
  "coordinates": {
    "latitude": 37.048601,
    "longitude": -8.065467,
    "label": "Praia de Vale do Lobo",
    "notes": "Primary listing coordinates use the official ABAAE Vale de Lobo beach entry.",
    "bathing_areas": [
      {
        "name": "Vale de Lobo",
        "latitude": 37.048601,
        "longitude": -8.065467,
        "type": "Resort beach",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Long sandy maritime resort beach below red cliffs",
  "landscape": "A broad sandy beach backed by distinctive red and ochre cliffs, pine trees, landscaped resort areas and golf-course surroundings.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Municipal search-result information refers to signposted access from the Quarteira / Almancil road towards Vale do Lobo. Visitors should confirm current parking and access conditions before travelling in peak summer.",
  "highlights": [
    "Established Golden Triangle resort beach in Loulé",
    "Red and ochre cliffs forming the beach’s signature landscape",
    "Long sandy shoreline connecting with neighbouring beaches",
    "Restaurants, bars, parking, showers and beach services listed by official tourism sources",
    "Golf, tennis and nautical sports context verified by VisitPortugal",
    "Listed among Loulé’s 2026 Blue Flag locations by ABAAE"
  ],
  "best_for": [
    "Resort beach days",
    "Couples",
    "Families using serviced seasonal areas",
    "Restaurants nearby",
    "Long beach walks",
    "Photography",
    "Accessible beach access, subject to current confirmation",
    "Water sports when conditions are suitable",
    "Golden Triangle visitors"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal / exact 2026 season dates should be confirmed" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Amphibious chair and assisted bathing support listed by Visit Algarve accessible-beach information", "status": "Seasonal / verify before visiting" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Small craft hire", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Outdoor parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Bodyboard", "status": "Seasonal / conditions dependent" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" },
    { "name": "Sailing", "status": "Seasonal / conditions dependent" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Sunshade rental",
    "Small craft hire",
    "Showers",
    "Outdoor parking",
    "Bar and restaurant",
    "Bodyboard, windsurfing and sailing",
    "Red-cliff resort beach setting"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the main beach season and full resort atmosphere. May, June and September are usually more comfortable for beach walks, restaurants and photography with less peak-summer pressure.",
    "know_before_you_go": "ABAAE lists Vale de Lobo among Loulé’s 2026 Blue Flag locations.\nThe individual ABAAE Vale de Lobo page checked during research showed 2025 bathing-season and Blue Flag-season dates, so exact 2026 season details should be manually confirmed before publication updates.\nThis is a resort beach with strong tourist demand, especially in July and August.\nFacilities, surveillance, accessible-beach support and water-sports services may vary by season and concession operation.\nThe red cliffs are visually distinctive but vulnerable; visitors should keep away from cliff bases and cliff edges.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.\nBeach restaurants and serviced areas can be busy during peak summer.",
    "notes": [
      "ABAAE lists Vale de Lobo among Loulé’s 2026 Blue Flag locations.",
      "The individual ABAAE Vale de Lobo page checked during research showed 2025 bathing-season and Blue Flag-season dates, so exact 2026 season details should be manually confirmed before publication updates.",
      "This is a resort beach with strong tourist demand, especially in July and August.",
      "Facilities, surveillance, accessible-beach support and water-sports services may vary by season and concession operation.",
      "The red cliffs are visually distinctive but vulnerable; visitors should keep away from cliff bases and cliff edges.",
      "Sea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "Beach restaurants and serviced areas can be busy during peak summer."
    ]
  },
  "important_notes": "ABAAE lists Vale de Lobo among Loulé’s 2026 Blue Flag locations.\nThe individual ABAAE Vale de Lobo page checked during research showed 2025 bathing-season and Blue Flag-season dates, so exact 2026 season details should be manually confirmed before publication updates.\nThis is a resort beach with strong tourist demand, especially in July and August.\nFacilities, surveillance, accessible-beach support and water-sports services may vary by season and concession operation.\nThe red cliffs are visually distinctive but vulnerable; visitors should keep away from cliff bases and cliff edges.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.\nBeach restaurants and serviced areas can be busy during peak summer.",
  "best_time_to_visit": "June to September for the main beach season and full resort atmosphere. May, June and September are usually more comfortable for beach walks, restaurants and photography with less peak-summer pressure.",
  "suitable_for": [
    "Visitors staying in Vale do Lobo, Almancil, Quinta do Lago or the Golden Triangle area",
    "Families wanting a serviced beach",
    "Couples looking for a resort beach with restaurants nearby",
    "Visitors interested in long beach walks",
    "Photographers drawn to red-cliff scenery",
    "Visitors needing accessible-beach recognition, subject to current confirmation",
    "Water-sports users when conditions are suitable"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors wanting a quiet wild beach with no resort influence",
    "Those wishing to avoid high-demand resort beaches in peak summer",
    "Visitors requiring accessibility support without confirming current seasonal arrangements",
    "Anyone intending to sit close to cliff bases or use informal cliff paths"
  ],
  "nearby_attractions": [
    {
      "name": "Vale do Lobo",
      "type": "Resort and coastal area",
      "description": "The established coastal resort area directly behind the beach, associated with restaurants, golf, tennis, accommodation and beach access.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Garrão",
      "type": "Nearby beach",
      "description": "A neighbouring Loulé beach to the east, divided into Garrão Poente and Garrão Nascente and also listed among Loulé’s 2026 Blue Flag locations.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Quarteira",
      "type": "Nearby beach",
      "description": "A busy urban beach west of Vale do Lobo, with promenade access and strong local and tourist use.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Ancão",
      "type": "Nearby beach",
      "description": "A dune-backed beach east of Garrão, close to the Ria Formosa Natural Park and the Quinta do Lago coastal area.",
      "verification_status": "Verified"
    },
    {
      "name": "Quinta do Lago",
      "type": "Nearby resort and nature area",
      "description": "A nearby coastal and Ria Formosa access area east of Vale do Lobo, useful for nature walks, lagoon scenery and beach access.",
      "verification_status": "Verified"
    },
    {
      "name": "Almancil",
      "type": "Nearby town",
      "description": "The inland parish and service town linked with Vale do Lobo, Quinta do Lago and the wider Golden Triangle area.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Vale do Lobo",
    "Almancil",
    "Quinta do Lago",
    "Quarteira",
    "Loulé",
    "Vilamoura"
  ],
  "walking_trails_nearby": [
    {
      "name": "Vale do Lobo shoreline walk",
      "description": "A long sandy beach walk along the Vale do Lobo shoreline towards neighbouring Loulé beaches, best planned according to tide, wind and heat conditions.",
      "verification_status": "Verified"
    },
    {
      "name": "Vale do Lobo to Garrão beach walk",
      "description": "A practical beach walk east towards Garrão Poente and Garrão Nascente, using the shoreline where conditions allow and avoiding cliff bases.",
      "verification_status": "Verified"
    },
    {
      "name": "Vale do Lobo to Quarteira shoreline walk",
      "description": "A westward shoreline walk towards Quarteira, suitable when tide, weather and beach conditions are favourable.",
      "verification_status": "Partially verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August for easier access to parking and serviced areas.",
    "Book beach restaurants or arrive outside peak lunch periods in high season.",
    "Keep a safe distance from the red cliffs and avoid sitting directly below them.",
    "Confirm accessible-beach support before travelling if an amphibious chair or assisted bathing is required.",
    "Check beach flags before swimming or using water-sports services.",
    "Walk east or west along the sand for a broader view of the coastline when tide and conditions allow.",
    "Treat Blue Flag, surveillance and water-sports services as seasonal rather than permanent."
  ],
  "photography_notes": "Praia de Vale do Lobo is especially photogenic for its red and ochre cliffs, pale sand, green pine and golf-course surroundings, and long beach perspective. Early morning and late afternoon usually provide softer light on the cliffs.",
  "family_notes": "Praia de Vale do Lobo can suit families because of its long sand, beach services and restaurant access. Families should still choose supervised seasonal areas, check flags and keep children away from cliff bases and rockfall-prone sections.",
  "safety_notes": "Sea and wind conditions can vary. Follow local beach flags, signage and instructions from surveillance teams where present. Keep away from cliff bases and cliff edges, and avoid informal paths through vulnerable cliff or dune areas.",
  "accessibility_notes": "VisitPortugal lists Praia de Vale do Lobo as an accessible beach, and Visit Algarve’s accessible-beach information lists Vale de Lobo with an amphibious chair and assisted bathing support. Current seasonal availability, adapted equipment and the most suitable access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia de Vale do Lobo, Loulé | Beach Guide",
    "meta_description": "Praia de Vale do Lobo in Loulé is a Golden Triangle resort beach with red cliffs, long sand, restaurants, services and Blue Flag listing.",
    "keywords": [
      "Praia de Vale do Lobo",
      "Vale do Lobo Beach",
      "Vale do Lobo Loulé",
      "Loulé beaches",
      "Golden Triangle Algarve",
      "Almancil beaches",
      "Algarve beaches",
      "Portugal beaches",
      "resort beach Algarve",
      "red cliffs Algarve",
      "Blue Flag Vale do Lobo",
      "accessible beach Loulé",
      "beach restaurants Algarve"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Vale de Lobo",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/4CD6CEFB-026A-4C00-9737-CEC537B13FE0",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Almancil, Loulé",
        "Reddish cliff setting",
        "Beach beside the Vale do Lobo tourist resort",
        "International resort reputation reference",
        "Large sandy beach extending for kilometres",
        "Long-walk suitability",
        "Sports and leisure context including nautical sports, golf and tennis",
        "Facilities including Blue Flag, surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant, bodyboard, windsurfing, sailing and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Vale de Lobo listed among Loulé’s 2026 Blue Flag coastal beach locations",
        "Loulé listed with 12 awarded locations in 2026",
        "Nearby Loulé 2026 Blue Flag beaches including Garrão Poente, Garrão Nascente, Ancão, Quinta do Lago and Quarteira"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Vale de Lobo",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/vale-de-lobo/",
      "facts_verified": [
        "Official Vale de Lobo beach entry",
        "Coastal beach classification",
        "Municipality of Loulé",
        "Coordinates",
        "Beach code PTCT7J",
        "Address at Vale do Lobo",
        "Individual page checked and found to show 2025 season dates at the time of research"
      ]
    },
    {
      "source_name": "Câmara Municipal de Loulé - Praia de Vale do Lobo",
      "source_url": "https://www.cm-loule.pt/pt/menu/644/praia-de-vale-do-lobo.aspx",
      "facts_verified": [
        "Municipal beach page located",
        "Blue Flag and accessible beach awards referenced in official search-result summary",
        "Signposted access from the Quarteira / Almancil road towards Vale do Lobo",
        "Municipal resort-beach context"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia de Vale do Lobo",
      "source_url": "https://visitalgarve.pt/equipamento/8772/praia-de-vale-do-lobo",
      "facts_verified": [
        "Regional tourism listing for Praia de Vale do Lobo",
        "High-quality tourist complex context",
        "Ochre and red cliff landscape",
        "Soft and vulnerable cliff material referenced in official search-result summary",
        "Long sandy beach and resort context"
      ]
    },
    {
      "source_name": "Visit Algarve - Accessible Beaches",
      "source_url": "https://visitalgarve.pt/en/3276/accessible-beaches",
      "facts_verified": [
        "Vale de Lobo listed with amphibious chair and help to get into the water",
        "Accessible-beach support treated as requiring current seasonal confirmation"
      ]
    },
    {
      "source_name": "Visit Algarve - Loulé 2026 Blue Flag news",
      "source_url": "https://visitalgarve.pt/42600/bandeira-azul-e-qualidade-de-ouro-confirmam-algarve-como-destino-de-qualidade-ambiental",
      "facts_verified": [
        "Regional 2026 Blue Flag context for Algarve beaches",
        "Algarve Blue Flag recognition in 2026"
      ]
    },
    {
      "source_name": "Câmara Municipal de Loulé - Litoral do concelho distinguido com Bandeiras Azuis",
      "source_url": "https://www.cm-loule.pt/pt/noticias/54026/litoral-do-concelho-de-loule-distinguido-com-bandeiras-azuis.aspx",
      "facts_verified": [
        "Municipal 2026 Blue Flag news item located",
        "Vale do Lobo included among Loulé beaches distinguished in 2026 according to official search-result summary",
        "Bathing season start context from municipal search-result summary"
      ]
    },
    {
      "source_name": "Agência Portuguesa do Ambiente - Perfil da Água Balnear Vale do Lobo",
      "source_url": "https://apambiente.pt/sites/default/files/_SNIAMB_A_APA/Comunicacao/Epoca_balnear/PerfisAB/ARH_Algarve/PerfisAguasBalneares/LOULE/ValedoLobo_PTCT7J.pdf",
      "facts_verified": [
        "Vale do Lobo bathing-water profile located",
        "Beach code PTCT7J",
        "Reference to beach nourishment / artificial sand replenishment in the official search-result summary",
        "Access road context in the official search-result summary"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Loulé municipality, Almancil location, red-cliff landscape, resort setting, facilities, accessibility listing and coordinates were verified from VisitPortugal and ABAAE.",
    "The phrase “resort beach with strong tourist demand” is supported by official references to the beach’s position beside the Vale do Lobo tourist resort, its established resort reputation, extensive services and surrounding leisure infrastructure. No private endorsement or partnership is implied.",
    "ABAAE’s 2026 awarded list verifies Vale de Lobo among Loulé’s 2026 Blue Flag locations. The individual ABAAE Vale de Lobo page checked during research showed 2025 season dates, so exact 2026 bathing-season and Blue Flag-display dates should be manually confirmed before publication updates.",
    "Facilities are included only where listed by official tourism sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is verified at recognition level through VisitPortugal and supported by Visit Algarve accessible-beach information, but current adapted equipment and assisted bathing should be checked before visiting.",
    "The red cliffs are described by regional tourism as soft and vulnerable; safety wording therefore advises visitors to avoid cliff bases and edges.",
    "Some municipal and regional pages returned limited accessible text or fetch errors when opened, so those facts are used cautiously from official search-result summaries and supported by VisitPortugal and ABAAE where possible.",
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
  where slug = 'vale-do-lobo';

  if v_city_id is null then
    raise exception 'Vale do Lobo city was not found';
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
