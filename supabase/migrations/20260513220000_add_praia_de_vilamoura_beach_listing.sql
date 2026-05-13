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
  'Vilamoura',
  'vilamoura',
  'Established Algarve marina resort in the municipality of Loule, with beaches, golf, dining and nautical services.',
  37.071752,
  -8.116064,
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
  v_slug text := 'praia-de-vilamoura-loule';
  v_name text := 'Praia de Vilamoura';
  v_short_description text := $short$
Praia de Vilamoura is a major resort beach in Loule, set beside Vilamoura Marina and extending towards Quarteira. It is known for easy access, strong beach infrastructure and its central position within one of the Algarve's most established marina resorts.
$short$;
  v_description text := $description$
Praia de Vilamoura is the main resort beach serving Vilamoura, in the municipality of Loule. Set immediately beside the marina area, it combines an extensive sandy shoreline with the convenience of a developed resort setting, hotels, restaurants, bars, shops and nautical activity close by.

Official tourism sources describe the beach as having urban-beach characteristics, very easy access from the road that runs alongside it and excellent support infrastructure. To the west, it is bounded by the marina breakwater; to the east, the sand continues in the direction of Quarteira, creating a practical coastal link between two of Loule's busiest seaside areas.

This is a beach for visitors who want comfort, access and resort energy rather than isolation. It suits families, couples, marina visitors, golfers staying in Vilamoura, and anyone looking to combine beach time with dining, shopping, boat departures or an evening walk around the marina. During high summer, the central sections and concession areas can become busy, particularly because of the surrounding accommodation and marina footfall.

Praia de Vilamoura is listed by official sources with Blue Flag recognition, beach surveillance, sunshade rental, showers, parking, bar and restaurant services, as well as activities such as windsurf and sailing. These facilities may depend on the bathing season and local concession operation, so visitors should verify current conditions before travelling.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Vilamoura",
  "slug": "praia-de-vilamoura-loule",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Vilamoura / Quarteira",
  "concelho": "Loule",
  "municipality": "Loule",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Vilamoura is a major resort beach in Loule, set beside Vilamoura Marina and extending towards Quarteira. It is known for easy access, strong beach infrastructure and its central position within one of the Algarve's most established marina resorts.",
  "full_description": "Praia de Vilamoura is the main resort beach serving Vilamoura, in the municipality of Loule. Set immediately beside the marina area, it combines an extensive sandy shoreline with the convenience of a developed resort setting, hotels, restaurants, bars, shops and nautical activity close by.\n\nOfficial tourism sources describe the beach as having urban-beach characteristics, very easy access from the road that runs alongside it and excellent support infrastructure. To the west, it is bounded by the marina breakwater; to the east, the sand continues in the direction of Quarteira, creating a practical coastal link between two of Loule's busiest seaside areas.\n\nThis is a beach for visitors who want comfort, access and resort energy rather than isolation. It suits families, couples, marina visitors, golfers staying in Vilamoura, and anyone looking to combine beach time with dining, shopping, boat departures or an evening walk around the marina. During high summer, the central sections and concession areas can become busy, particularly because of the surrounding accommodation and marina footfall.\n\nPraia de Vilamoura is listed by official sources with Blue Flag recognition, beach surveillance, sunshade rental, showers, parking, bar and restaurant services, as well as activities such as windsurf and sailing. These facilities may depend on the bathing season and local concession operation, so visitors should verify current conditions before travelling.",
  "coordinates": {
    "latitude": 37.071752,
    "longitude": -8.116064,
    "notes": "Coordinates were taken from the ABAAE Vilamoura Blue Flag entry."
  },
  "beach_type": "Large sandy urban resort beach",
  "landscape": "A broad sandy beach framed by Vilamoura's resort frontage, the marina breakwater to the west and the open shoreline towards Quarteira to the east.",
  "access": "Official tourism sources describe very easy access from the road that runs alongside the beach. The beach is also closely connected with Vilamoura Marina and the wider resort area. Visitors should confirm the most suitable access point before travelling, especially if mobility support is required.",
  "highlights": [
    "Major resort beach beside Vilamoura Marina",
    "Extensive sandy shoreline continuing towards Quarteira",
    "Easy access from the road running beside the beach",
    "Strong beach-support infrastructure verified by official tourism sources",
    "Good for combining beach time with marina dining, shops and boat departures",
    "Official 2026 Blue Flag season listed by ABAAE"
  ],
  "best_for": [
    "Resort beach days",
    "Families",
    "Couples",
    "Marina visitors",
    "Long beach walks",
    "Restaurants nearby",
    "Water sports",
    "Accessible beach access",
    "Summer atmosphere"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach designation", "status": "Verified" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Windsurf", "status": "Seasonal" },
    { "name": "Sailing", "status": "Seasonal" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal surveillance",
    "Accessible beach designation",
    "Car parking",
    "Bars and restaurants",
    "Seasonal water sports"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the main bathing season and full resort atmosphere. May, June and September are often more comfortable for beach walks and marina visits with fewer peak-summer crowds.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Vilamoura as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Vilamoura as 1 July 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia de Vilamoura is a central resort beach and can become busy during peak summer.\nFacilities and beach-support services may vary by season and concession area.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.\nVisitors using accessible-beach support should confirm current seasonal arrangements before travelling.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Vilamoura as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Vilamoura as 1 July 2026 to 30 September 2026.",
      "At the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Praia de Vilamoura is a central resort beach and can become busy during peak summer.",
      "Facilities and beach-support services may vary by season and concession area.",
      "Sea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "Visitors using accessible-beach support should confirm current seasonal arrangements before travelling."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Vilamoura as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Vilamoura as 1 July 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia de Vilamoura is a central resort beach and can become busy during peak summer.\nFacilities and beach-support services may vary by season and concession area.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.\nVisitors using accessible-beach support should confirm current seasonal arrangements before travelling.",
  "best_time_to_visit": "June to September for the main bathing season and full resort atmosphere. May, June and September are often more comfortable for beach walks and marina visits with fewer peak-summer crowds.",
  "suitable_for": [
    "Visitors staying in Vilamoura",
    "Families wanting a serviced beach",
    "Couples combining beach time with the marina",
    "Visitors seeking easy access",
    "Beach walkers heading towards Quarteira",
    "Water-sports users when conditions are suitable",
    "Marina and resort guests"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors who prefer quiet natural coves",
    "Those wishing to avoid busy resort areas in peak summer",
    "Visitors seeking dramatic cliff scenery directly on the beach"
  ],
  "nearby_attractions": [
    {
      "name": "Marina de Vilamoura",
      "type": "Marina",
      "description": "Portugal's largest marina according to VisitPortugal, with restaurants, shops, hotels, nautical services and boat departures close to the beach.",
      "verification_status": "Verified"
    },
    {
      "name": "Cerro da Vila",
      "type": "Archaeological site and museum",
      "description": "A Roman archaeological site and museum in Vilamoura, close to the resort centre and marina area.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Quarteira",
      "type": "Nearby beach",
      "description": "A neighbouring urban beach east of Vilamoura, separated from Quarteira by the Avenida Marginal seafront promenade.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Rocha Baixinha Nascente",
      "type": "Nearby beach",
      "description": "A broad sandy beach west of the marina area, associated with the wider Falesia and Rocha Baixinha coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Quarteira",
      "type": "Nearby coastal town",
      "description": "A busy seaside town east of Vilamoura, useful for promenade walks, local restaurants and wider beach access.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Vilamoura",
    "Quarteira",
    "Almancil",
    "Loule",
    "Vale do Lobo"
  ],
  "walking_trails_nearby": [
    {
      "name": "Vilamoura to Quarteira beachfront walk",
      "description": "A practical seaside walk following the developed coast from Vilamoura towards Quarteira, using beach, road and promenade sections where available.",
      "verification_status": "Verified"
    },
    {
      "name": "Ecovia do Litoral / EuroVelo 1 Algarve route",
      "description": "The wider Algarve coastal cycling and walking network passes through the region, with Vilamoura and Quarteira forming part of the coastal route context. Visitors should confirm current markings before using it.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Choose your beach section before arriving, as services and crowd levels can vary along the sand.",
    "Arrive early in July and August for easier access to the most convenient serviced areas.",
    "Combine the beach with a marina walk, boat departure or dinner in Vilamoura.",
    "Walk east towards Quarteira for a longer urban-coastal beach experience.",
    "Check beach flags and local signage before swimming or using water-sports services.",
    "Confirm current accessible-beach support if travelling with reduced mobility requirements."
  ],
  "photography_notes": "Praia de Vilamoura is best photographed for its resort-marina setting, wide sand and marina breakwater views rather than wild natural scenery. Early morning and late afternoon are usually better for softer light and fewer crowds.",
  "family_notes": "Praia de Vilamoura can suit families who want easy access, nearby restaurants and serviced beach areas. Families should still check local flags, seasonal surveillance and sea conditions before swimming.",
  "safety_notes": "Sea and wind conditions can vary. Follow beach flags, local signage and instructions from beach surveillance where present. Take care around the marina breakwater and avoid entering restricted nautical areas.",
  "accessibility_notes": "Official tourism sources list Praia de Vilamoura as an accessible beach. Visitors with reduced mobility should still confirm the most suitable access point and current seasonal support conditions before visiting.",
  "seo": {
    "meta_title": "Praia de Vilamoura, Loule | Algarve Beach Guide",
    "meta_description": "Praia de Vilamoura in Loule is a major Algarve resort beach beside the marina, with wide sand, facilities, access and summer atmosphere.",
    "keywords": [
      "Praia de Vilamoura",
      "Vilamoura Beach",
      "Vilamoura Marina beach",
      "Loule beaches",
      "Algarve beaches",
      "Portugal beaches",
      "resort beach Algarve",
      "accessible beach Vilamoura",
      "Quarteira nearby beach",
      "marina beach Algarve"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de Vilamoura trip ideas",
      "links": [
        { "label": "Praia de Vilamoura" },
        { "label": "Vilamoura Beach" },
        { "label": "Vilamoura Marina beach" },
        { "label": "resort beach Algarve" },
        { "label": "accessible beach Vilamoura" },
        { "label": "marina beach Algarve" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Marina de Vilamoura" },
        { "label": "Cerro da Vila" },
        { "label": "Praia de Quarteira" },
        { "label": "Praia da Rocha Baixinha Nascente" },
        { "label": "Quarteira" },
        { "label": "Ecovia do Litoral" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Vilamoura",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-vilamoura",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Vilamoura, Loule",
        "Vilamoura resort context",
        "Extensive sandy beach towards Quarteira",
        "Urban-beach characteristics",
        "Easy road access",
        "Marina boundary to the west",
        "Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf, sailing and accessible beach"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Vilamoura",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/vilamoura/",
      "facts_verified": [
        "Official Vilamoura beach entry",
        "Municipality of Loule",
        "Coastal beach classification",
        "Coordinates",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Vilamoura listed among Loule's 2026 Blue Flag locations",
        "Marina de Vilamoura also listed among Loule's 2026 Blue Flag locations"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia de Vilamoura",
      "source_url": "https://visitalgarve.pt/equipamento/8775/praia-de-vilamoura",
      "facts_verified": [
        "Beach positioned between the eastern mole of Vilamoura Marina and the Quarteira dock area",
        "Major tourism-development setting",
        "Resort-beach context"
      ]
    },
    {
      "source_name": "Camara Municipal de Loule - Praia de Vilamoura",
      "source_url": "https://www.cm-loule.pt/pt/menu/639/praia-de-vilamoura.aspx",
      "facts_verified": [
        "Praia de Vilamoura municipal listing",
        "Vilamoura as a leisure, sport and cultural resort centre",
        "Marina and nautical activity context",
        "High-quality equipment and resort infrastructure context"
      ]
    },
    {
      "source_name": "VisitPortugal - Vilamoura and its marina",
      "source_url": "https://www.visitportugal.com/en/destinos/algarve/73801",
      "facts_verified": [
        "Vilamoura developed around its marina",
        "Vilamoura as one of Europe's largest leisure resorts",
        "Hotels, tourist villages and golf courses",
        "Marina as the main entertainment hub",
        "1300-berth marina reference on the destination page",
        "Cerro da Vila context"
      ]
    },
    {
      "source_name": "VisitPortugal - Marina de Vilamoura",
      "source_url": "https://www.visitportugal.com/pt-pt/content/marina-de-vilamoura",
      "facts_verified": [
        "Marina de Vilamoura as Portugal's largest marina by VisitPortugal description",
        "825 berths listed on the marina page",
        "Restaurants, shops, hotels and nautical services around the marina",
        "Marina surrounded by beaches and tourism complexes"
      ]
    },
    {
      "source_name": "VisitPortugal - Museu e Estacao Arqueologica Cerro da Vila",
      "source_url": "https://www.visitportugal.com/pt-pt/content/museu-e-estacao-arquelogica-do-cerro-da-vila",
      "facts_verified": [
        "Cerro da Vila as a nearby archaeological site and museum",
        "Historical visitor attraction in Vilamoura"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia de Quarteira",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-quarteira",
      "facts_verified": [
        "Praia de Quarteira as a neighbouring Loule beach",
        "Avenida Marginal promenade context",
        "Urban beach setting east of Vilamoura"
      ]
    },
    {
      "source_name": "Visit Algarve - Ecovia do Litoral / EuroVelo 1",
      "source_url": "https://visitalgarve.pt/3493/ecovia-do-litoral-eurovelo-1",
      "facts_verified": [
        "Ecovia do Litoral / EuroVelo 1 coastal route context in the Algarve",
        "Relevance for walking and cycling near the Loule coast"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Loule municipality, resort-marina setting, access, facilities and beach type were verified from official tourism, municipal and ABAAE sources.",
    "The phrase major resort/marina beach is supported by official descriptions of Vilamoura as a major leisure resort developed around its marina and by the beach's direct marina-side location.",
    "ABAAE verifies Vilamoura's 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is listed by VisitPortugal, but visitors with reduced mobility should confirm current access point and seasonal support before travelling.",
    "The nearby-walk suggestions are based on verified coastal geography and official route context; visitors should confirm current route markings and conditions locally.",
    "No prohibited third-party platform names, public review scores or unsupported ranking claims were included in the public listing text."
  ]
}
$json$;
begin
  select id into v_category_id
  from public.categories
  where slug = 'beaches'
  limit 1;

  if v_category_id is null then
    raise exception 'Required category beaches was not found';
  end if;

  select id into v_city_id
  from public.cities
  where slug = 'vilamoura'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city vilamoura was not found';
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
      btrim(v_description),
      btrim(v_short_description),
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'verified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://www.visitportugal.com/pt-pt/content/praia-de-vilamoura',
      'Praia de Vilamoura, Vilamoura, Loule, Algarve, Portugal',
      37.071752,
      -8.116064,
      array[
        'Praia de Vilamoura',
        'Vilamoura Beach',
        'Vilamoura Marina beach',
        'Loule beaches',
        'Algarve beaches',
        'Portugal beaches',
        'resort beach Algarve',
        'accessible beach Vilamoura',
        'Quarteira nearby beach',
        'marina beach Algarve'
      ],
      v_category_data,
      'Praia de Vilamoura, Loule | Algarve Beach Guide',
      'Praia de Vilamoura in Loule is a major Algarve resort beach beside the marina, with wide sand, facilities, access and summer atmosphere.',
      now()
    )
    returning id into v_listing_id;
  else
    update public.listings
    set
      name = v_name,
      slug = v_slug,
      description = btrim(v_description),
      short_description = btrim(v_short_description),
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'verified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = 'https://www.visitportugal.com/pt-pt/content/praia-de-vilamoura',
      contact_phone = null,
      contact_email = null,
      whatsapp_number = null,
      instagram_url = null,
      facebook_url = null,
      linkedin_url = null,
      twitter_url = null,
      youtube_url = null,
      tiktok_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      address = 'Praia de Vilamoura, Vilamoura, Loule, Algarve, Portugal',
      latitude = 37.071752,
      longitude = -8.116064,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia de Vilamoura',
        'Vilamoura Beach',
        'Vilamoura Marina beach',
        'Loule beaches',
        'Algarve beaches',
        'Portugal beaches',
        'resort beach Algarve',
        'accessible beach Vilamoura',
        'Quarteira nearby beach',
        'marina beach Algarve'
      ],
      category_data = v_category_data,
      meta_title = 'Praia de Vilamoura, Loule | Algarve Beach Guide',
      meta_description = 'Praia de Vilamoura in Loule is a major Algarve resort beach beside the marina, with wide sand, facilities, access and summer atmosphere.',
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
