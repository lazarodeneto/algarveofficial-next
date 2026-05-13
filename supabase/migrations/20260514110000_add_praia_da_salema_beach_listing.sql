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
  'Salema',
  'salema',
  'Fishing village in Vila do Bispo known for Praia da Salema, coastal walks, restaurants and west Algarve beach scenery.',
  37.0652,
  -8.8249,
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
  v_slug text := 'praia-da-salema-vila-do-bispo';
  v_name text := 'Praia da Salema';
  v_address text := 'Praia da Salema, Salema, Budens, Vila do Bispo, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-de-salema';
  v_latitude numeric := 37.0652;
  v_longitude numeric := -8.8249;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Salema",
  "slug": "praia-da-salema-vila-do-bispo",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Salema / Budens",
  "concelho": "Vila do Bispo",
  "municipality": "Vila do Bispo",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Salema is a well-known village beach in Vila do Bispo, set between Sagres and Lagos on the western Algarve coast. It combines fishing heritage, a sandy bay, restaurants, accessible-beach recognition and a distinctive local setting.",
  "full_description": "Praia da Salema is one of Vila do Bispo’s most recognisable village beaches, located on the south coast between Sagres and Lagos. Once used mainly by local fishermen, it still retains a working maritime character, especially early in the morning when fishing activity can still be seen on the sand.\n\nThe beach sits directly below Salema village, with whitewashed houses, restaurants and terraces close to the shoreline. Official regional tourism information describes an ample sandy beach with more than one kilometre of sand, a seafront promenade and sea-facing terraces, giving Salema a practical but still village-led atmosphere. It is not a remote wild beach, but it feels more traditional and less urban than the Algarve’s larger resort centres.\n\nSalema is also notable for its natural and geological interest. Vila do Bispo municipal information identifies dinosaur footprints on the western side of the beach, visible on a rock slab near the access stairs. These should be treated as a fragile natural heritage feature, not as a casual play or climbing area.\n\nThe beach is listed by VisitPortugal with Blue Flag, surveillance, sunshade rental, showers, parking, bar, restaurant and accessible-beach status. ABAAE also lists Salema among Vila do Bispo’s 2026 Blue Flag coastal beaches. Facilities and support may vary by season, and visitors should confirm current conditions before travelling.",
  "coordinates": {
    "latitude": 37.0652,
    "longitude": -8.8249,
    "label": "Praia da Salema",
    "notes": "Coordinates were taken from ABAAE 2026 Blue Flag list and the individual ABAAE Salema entry."
  },
  "beach_type": "Sandy village maritime beach",
  "landscape": "A sandy bay backed by Salema village, with fishing boats, whitewashed houses, coastal cliffs and rock formations at the beach edges.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. The beach is directly connected with Salema village, with parking listed by official tourism sources. Visitors with reduced mobility should confirm the most suitable access point and seasonal support before visiting.",
  "highlights": [
    "Well-known village beach between Sagres and Lagos",
    "Traditional fishing heritage still visible on the beach",
    "Sandy bay directly below Salema village",
    "Seafront promenade and terraces close to the sand",
    "Dinosaur-footprint trail verified on the western side of the beach",
    "Official 2026 Blue Flag listing for Salema"
  ],
  "best_for": [
    "Village beach atmosphere",
    "Families using serviced sections",
    "Couples",
    "Photography",
    "Restaurants nearby",
    "Accessible beach access, subject to current confirmation",
    "Coastal walks",
    "Geology interest",
    "West Algarve exploration"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Fishing activity", "status": "Verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Sunshade rental",
    "Showers",
    "Car parking",
    "Bar and restaurant",
    "Fishing heritage",
    "Dinosaur-footprint heritage nearby"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing-season period and full beach atmosphere. May, June and September are usually more comfortable for village walks, photography and lower crowd levels than peak August.",
    "know_before_you_go": "ABAAE lists Salema among Vila do Bispo’s 2026 Blue Flag coastal beach locations.\nABAAE’s Algarve page lists the 2026 bathing season as 1 June 2026 to 30 September 2026 and the 2026 Blue Flag season as 1 July 2026 to 30 September 2026.\nThe individual ABAAE Salema page checked during research showed 2025 season dates, so 2026 season details should be confirmed before future publication updates.\nFacilities, surveillance and accessible-beach support may vary by season.\nThe western-side dinosaur footprints are a fragile natural heritage feature and should not be touched, climbed on or damaged.\nFishing boats and equipment may be present; visitors should respect working areas.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nThe beach can become busy in peak summer because of its village setting and services.",
    "notes": [
      "ABAAE lists Salema among Vila do Bispo’s 2026 Blue Flag coastal beach locations.",
      "ABAAE’s Algarve page lists the 2026 bathing season as 1 June 2026 to 30 September 2026 and the 2026 Blue Flag season as 1 July 2026 to 30 September 2026.",
      "The individual ABAAE Salema page checked during research showed 2025 season dates, so 2026 season details should be confirmed before future publication updates.",
      "Facilities, surveillance and accessible-beach support may vary by season.",
      "The western-side dinosaur footprints are a fragile natural heritage feature and should not be touched, climbed on or damaged.",
      "Fishing boats and equipment may be present; visitors should respect working areas.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "The beach can become busy in peak summer because of its village setting and services."
    ]
  },
  "important_notes": "ABAAE lists Salema among Vila do Bispo’s 2026 Blue Flag coastal beach locations.\nABAAE’s Algarve page lists the 2026 bathing season as 1 June 2026 to 30 September 2026 and the 2026 Blue Flag season as 1 July 2026 to 30 September 2026.\nThe individual ABAAE Salema page checked during research showed 2025 season dates, so 2026 season details should be confirmed before future publication updates.\nFacilities, surveillance and accessible-beach support may vary by season.\nThe western-side dinosaur footprints are a fragile natural heritage feature and should not be touched, climbed on or damaged.\nFishing boats and equipment may be present; visitors should respect working areas.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nThe beach can become busy in peak summer because of its village setting and services.",
  "best_time_to_visit": "June to September for the official bathing-season period and full beach atmosphere. May, June and September are usually more comfortable for village walks, photography and lower crowd levels than peak August.",
  "suitable_for": [
    "Visitors staying in Salema or western Algarve villages",
    "Families wanting a serviced village beach",
    "Couples looking for a relaxed coastal village setting",
    "Visitors interested in fishing heritage",
    "Beachgoers needing accessible-beach recognition, subject to current confirmation",
    "Walkers using nearby Rota Vicentina sections",
    "Visitors interested in geology and dinosaur footprints"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote wild beach",
    "Visitors who want a large resort promenade",
    "Those wishing to avoid popular village beaches in summer",
    "Visitors requiring accessibility support without checking current seasonal arrangements",
    "Anyone intending to climb rocks, disturb fossil features or walk too close to unstable cliff areas"
  ],
  "nearby_attractions": [
    {
      "name": "Dinosaur Footprints of Praia da Salema",
      "type": "Geological / paleontological feature",
      "description": "A dinosaur-footprint trail on a rock slab near the western access stairs, verified by Vila do Bispo municipal information and supported by scientific source material.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Burgau",
      "type": "Nearby beach and fishing village",
      "description": "A neighbouring Vila do Bispo beach integrated into the fishing village of Burgau, east of Salema.",
      "verification_status": "Verified"
    },
    {
      "name": "Forte de Almádena / Forte da Boca do Rio",
      "type": "Historic fort",
      "description": "A classified coastal fort above the Boca do Rio area, linked to maritime defence and the protection of local tuna-fishing activity.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Boca do Rio",
      "type": "Nearby beach and river-mouth area",
      "description": "A nearby beach between Salema and Burgau, associated with the Boca do Rio valley and coastal heritage. Current facilities were not verified from primary official beach sources.",
      "verification_status": "Partially verified"
    },
    {
      "name": "Vila do Bispo",
      "type": "Municipal town",
      "description": "The inland municipal centre, useful for services, local heritage and wider exploration of the south-west Algarve.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Salema",
    "Budens",
    "Burgau",
    "Vila do Bispo",
    "Sagres",
    "Lagos"
  ],
  "walking_trails_nearby": [
    {
      "name": "Rota Vicentina / Fishermen’s Trail - Sagres to Salema",
      "description": "A coastal Rota Vicentina section linking Sagres and Salema through exposed west-Algarve cliff and beach landscapes. Walkers should follow official markings and avoid cliff edges.",
      "verification_status": "Verified"
    },
    {
      "name": "Rota Vicentina / Fishermen’s Trail - Salema to Luz",
      "description": "A coastal walking section continuing east from Salema towards Praia da Luz, part of the wider Rota Vicentina network.",
      "verification_status": "Verified"
    },
    {
      "name": "Salema to Burgau coastal walk",
      "description": "A scenic local coastal walk between Salema and Burgau, using cliff and shoreline terrain. Route conditions, heat, wind and cliff safety should be checked before setting out.",
      "verification_status": "Partially verified"
    }
  ],
  "visitor_tips": [
    "Visit early in the morning to see the village and fishing character before the beach becomes busier.",
    "Check local tide and safety information before exploring rocky sections.",
    "Respect the dinosaur footprints and avoid stepping on or damaging fossil-bearing rock slabs.",
    "Confirm accessible-beach support before travelling if adapted equipment or assistance is needed.",
    "Use marked paths on nearby coastal walks and stay away from cliff edges.",
    "Book or arrive early for restaurants in peak summer.",
    "For a wider itinerary, combine Salema with Burgau, Boca do Rio or a Rota Vicentina coastal section."
  ],
  "photography_notes": "Praia da Salema photographs well from the village edge, beach level and nearby cliff-safe viewpoints, with fishing boats, whitewashed houses and the sandy bay giving a strong west-Algarve village identity. The dinosaur-footprint area should be photographed respectfully without stepping on fragile features.",
  "family_notes": "Salema can suit families who want a serviced village beach with restaurants and parking listed by official tourism sources. Families should still check flags, supervise children near boats, rocks and water, and avoid allowing children to climb on fossil or cliff areas.",
  "safety_notes": "Sea conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Take care around fishing boats, rocks, cliff-backed sections and fragile geological features.",
  "accessibility_notes": "VisitPortugal lists Praia de Salema as an accessible beach. Current seasonal support, adapted equipment, parking and the most suitable access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia da Salema, Vila do Bispo | Beach Guide",
    "meta_description": "Praia da Salema in Vila do Bispo is a well-known village beach with fishing heritage, sand, restaurants, dinosaur footprints and Blue Flag status.",
    "keywords": [
      "Praia da Salema",
      "Salema Beach",
      "Praia da Salema Vila do Bispo",
      "Vila do Bispo beaches",
      "Algarve beaches",
      "Portugal beaches",
      "village beach Algarve",
      "family beach Salema",
      "accessible beach Salema",
      "Blue Flag Salema",
      "dinosaur footprints Salema",
      "Rota Vicentina Salema",
      "Burgau nearby beach"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Salema",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-salema",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location between Sagres and Lagos",
        "Fishing heritage",
        "Facilities including Blue Flag, surveillance, sunshade rental, showers, parking, bar, restaurant and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Salema listed among 2026 Blue Flag coastal beaches",
        "Municipality of Vila do Bispo",
        "Coordinates"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Algarve region page",
      "source_url": "https://bandeiraazul.abaae.pt/regiao/algarve/",
      "facts_verified": [
        "2026 Algarve bathing-season date range shown on ABAAE page",
        "2026 Algarve Blue Flag-season date range shown on ABAAE page"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Salema",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/salema/",
      "facts_verified": [
        "Official Salema beach entry",
        "Coastal beach classification",
        "Municipality of Vila do Bispo",
        "Coordinates",
        "Individual page checked and found to show 2025 season dates at the time of research"
      ]
    },
    {
      "source_name": "Câmara Municipal de Vila do Bispo - Praia da Salema",
      "source_url": "https://www.cm-viladobispo.pt/visitar/o-que-visitar/praias/salema",
      "facts_verified": [
        "Municipal beach page for Salema",
        "Fishing-village setting",
        "Medium-length sandy beach",
        "Dinosaur-footprint trail on the western side near the access stairs, based on official search-result summary"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia da Salema",
      "source_url": "https://visitalgarve.pt/equipamento/8754/praia-da-salema",
      "facts_verified": [
        "Regional tourism listing for Praia da Salema",
        "Seafront promenade",
        "Terraces overlooking the sea",
        "Ample sandy beach with more than 1 km of sand, based on official regional tourism summary"
      ]
    },
    {
      "source_name": "LNEG / Comunicacoes Geologicas - Dinosaur tracks in the southwest Algarve Basin",
      "source_url": "https://www.lneg.pt/wp-content/uploads/2020/03/11-Dinosaurs-at-the-southwest-Mesozoic-b_Layout-1.pdf",
      "facts_verified": [
        "Scientific source for dinosaur tracks at Praia da Salema",
        "Vila do Bispo southwest Algarve location",
        "Discovery and study of dinosaur track levels in the Salema area"
      ]
    },
    {
      "source_name": "Ciência Viva Lagos - Turismo Científico / Praia Salema Pegadas de Dinossauro",
      "source_url": "https://lagos.cienciaviva.pt/3475/turismo-cientifico",
      "facts_verified": [
        "Scientific-tourism context for dinosaur footprints at Praia da Salema",
        "Vila do Bispo location"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia do Burgau",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-burgau",
      "facts_verified": [
        "Nearby Burgau beach",
        "Vila do Bispo location",
        "Fishing-village beach character"
      ]
    },
    {
      "source_name": "Património Cultural - Forte da Boca do Rio / Forte de Almádena",
      "source_url": "https://imovel.patrimoniocultural.gov.pt/detalhes.php?code=72858",
      "facts_verified": [
        "Nearby Forte de Almádena / Forte da Boca do Rio",
        "Location above Praia da Boca do Rio",
        "Historic coastal defence context",
        "Protection of tuna-fishing activity"
      ]
    },
    {
      "source_name": "Rota Vicentina - Sagres to Salema",
      "source_url": "https://rotavicentina.com/walking/sagres-salema/",
      "facts_verified": [
        "Official Rota Vicentina walking section from Sagres to Salema"
      ]
    },
    {
      "source_name": "Rota Vicentina - Salema to Luz",
      "source_url": "https://rotavicentina.com/en/walking/salema-luz-2/",
      "facts_verified": [
        "Official Rota Vicentina walking section from Salema to Luz"
      ]
    },
    {
      "source_name": "Rota Vicentina - Fishermen’s Trail",
      "source_url": "https://rotavicentina.com/en/fishermens-trail/",
      "facts_verified": [
        "Fishermen’s Trail coastal walking network",
        "Cliff and sandy-path walking context",
        "Walking-only route guidance"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, fishing-village character, facilities, access, Blue Flag 2026 listing and coordinates were verified from official tourism and ABAAE sources.",
    "The phrase “well-known village beach” is expressed through verified village setting, official tourism presence, fishing heritage and service infrastructure, without using review-platform rankings or scores.",
    "ABAAE’s 2026 list verifies Salema as a 2026 Blue Flag coastal beach in Vila do Bispo. The individual Salema page checked showed 2025 season dates, so the listing uses the 2026 Algarve season information from ABAAE’s regional page and recommends future manual confirmation.",
    "Facilities are included only where listed by VisitPortugal and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is verified at recognition level by VisitPortugal, but current adapted equipment and support should be checked before visiting.",
    "Dinosaur-footprint information was verified from Vila do Bispo municipal search-result material and scientific sources; visitors should treat the site as fragile natural heritage.",
    "Some municipal and regional tourism pages returned limited accessible text when opened, so those facts are supported cautiously by official search-result summaries and stronger official sources where available.",
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
  where slug = 'salema';

  if v_city_id is null then
    raise exception 'Salema city was not found';
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
