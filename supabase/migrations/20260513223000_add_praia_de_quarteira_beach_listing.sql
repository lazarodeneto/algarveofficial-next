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
  'Quarteira',
  'quarteira',
  'Town-front Algarve beach destination in Loule with a long promenade, urban sand and local seaside services.',
  37.06778,
  -8.104391,
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
  v_slug text := 'praia-de-quarteira-loule';
  v_name text := 'Praia de Quarteira';
  v_short_description text := $short$
Praia de Quarteira is a busy urban beach in Loule, set directly beside the town's seafront promenade. With a long sandy shoreline, strong support infrastructure and easy town access, it is heavily used by both local residents and summer visitors.
$short$;
  v_description text := $description$
Praia de Quarteira is one of the Algarve's most established urban beaches, located directly beside the town of Quarteira in the municipality of Loule. Official tourism sources describe Quarteira as one of the Algarve's busiest localities during summer, and the beach reflects that character: lively, practical, accessible and closely connected to everyday town life.

The beach has an extensive sandy shoreline divided by concrete breakwaters, with the Avenida Marginal and seafront promenade running behind it. This gives Praia de Quarteira a different feel from the cliff-backed coves or dune-island beaches elsewhere in the Algarve. Here, visitors can move easily between the sand, cafes, restaurants, shops and town services, making it especially suitable for families, long-stay visitors, residents and tourists who value convenience.

Praia de Quarteira is not a secluded beach. It is best understood as a high-use seaside space with strong summer capacity, beach services and a lively promenade atmosphere. VisitPortugal lists Blue Flag recognition, surveillance, sunshade rental, light boat rental, showers, parking, bars, restaurants, bodyboard and accessible-beach support, although many services may be seasonal and should be checked before travelling outside the main bathing period.

The beach is also well placed for exploring the wider Loule coast. Vilamoura lies to the west, while Forte Novo, Almargem and Loule Velho continue eastwards along the shoreline. Visitors should expect crowds in peak summer, follow beach flags and signage, and use designated access points where available.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Quarteira",
  "slug": "praia-de-quarteira-loule",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Quarteira",
  "concelho": "Loule",
  "municipality": "Loule",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Quarteira is a busy urban beach in Loule, set directly beside the town's seafront promenade. With a long sandy shoreline, strong support infrastructure and easy town access, it is heavily used by both local residents and summer visitors.",
  "full_description": "Praia de Quarteira is one of the Algarve's most established urban beaches, located directly beside the town of Quarteira in the municipality of Loule. Official tourism sources describe Quarteira as one of the Algarve's busiest localities during summer, and the beach reflects that character: lively, practical, accessible and closely connected to everyday town life.\n\nThe beach has an extensive sandy shoreline divided by concrete breakwaters, with the Avenida Marginal and seafront promenade running behind it. This gives Praia de Quarteira a different feel from the cliff-backed coves or dune-island beaches elsewhere in the Algarve. Here, visitors can move easily between the sand, cafes, restaurants, shops and town services, making it especially suitable for families, long-stay visitors, residents and tourists who value convenience.\n\nPraia de Quarteira is not a secluded beach. It is best understood as a high-use seaside space with strong summer capacity, beach services and a lively promenade atmosphere. VisitPortugal lists Blue Flag recognition, surveillance, sunshade rental, light boat rental, showers, parking, bars, restaurants, bodyboard and accessible-beach support, although many services may be seasonal and should be checked before travelling outside the main bathing period.\n\nThe beach is also well placed for exploring the wider Loule coast. Vilamoura lies to the west, while Forte Novo, Almargem and Loule Velho continue eastwards along the shoreline. Visitors should expect crowds in peak summer, follow beach flags and signage, and use designated access points where available.",
  "coordinates": {
    "latitude": 37.06778,
    "longitude": -8.104391,
    "notes": "Coordinates were taken from the ABAAE Quarteira beach entry."
  },
  "beach_type": "Long sandy urban maritime beach",
  "landscape": "A broad town-front sandy beach divided by coastal breakwaters, backed by Quarteira's Avenida Marginal, promenade, buildings and visitor services.",
  "access": "Official tourism sources place the beach directly beside Quarteira and the Avenida Marginal seafront. Access is town-based and supported by nearby roads, promenade connections and listed parking. Visitors with mobility requirements should confirm the most suitable current access point before visiting.",
  "highlights": [
    "Central urban beach directly beside Quarteira's seafront",
    "Extensive sandy shoreline divided by concrete breakwaters",
    "High local and tourist use during the summer season",
    "Long promenade with restaurants, cafes and town services nearby",
    "Strong beach-support infrastructure verified by official tourism sources",
    "Listed among Loule's 2026 Blue Flag locations by ABAAE"
  ],
  "best_for": [
    "Urban beach days",
    "Families",
    "Local atmosphere",
    "Long beach walks",
    "Restaurants nearby",
    "Accessible beach access",
    "Summer visitors",
    "Town-centre convenience",
    "Bodyboarding when conditions are suitable"
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
    { "name": "Bodyboard", "status": "Seasonal / conditions dependent" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal surveillance",
    "Accessible beach designation",
    "Car parking",
    "Bars and restaurants",
    "Seasonal bodyboard / beach activity context"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the main summer beach atmosphere and seasonal services. May, June and September are usually better for a more comfortable promenade walk and beach visit with fewer peak-summer crowds.",
    "know_before_you_go": "Praia de Quarteira is a high-use urban beach and can become very busy during summer.\nABAAE lists Quarteira among Loule's 2026 Blue Flag locations.\nThe ABAAE Quarteira beach page checked during research showed 2025 season dates, so exact 2026 bathing-season dates should be manually checked before publication updates.\nFacilities and beach-support services may vary by season and concession area.\nThe beach is divided by concrete breakwaters; visitors should take care near structures and avoid restricted or unsafe areas.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.\nThe promenade and most central sections are likely to be busiest in July and August.",
    "notes": [
      "Praia de Quarteira is a high-use urban beach and can become very busy during summer.",
      "ABAAE lists Quarteira among Loule's 2026 Blue Flag locations.",
      "The ABAAE Quarteira beach page checked during research showed 2025 season dates, so exact 2026 bathing-season dates should be manually checked before publication updates.",
      "Facilities and beach-support services may vary by season and concession area.",
      "The beach is divided by concrete breakwaters; visitors should take care near structures and avoid restricted or unsafe areas.",
      "Sea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "The promenade and most central sections are likely to be busiest in July and August."
    ]
  },
  "important_notes": "Praia de Quarteira is a high-use urban beach and can become very busy during summer.\nABAAE lists Quarteira among Loule's 2026 Blue Flag locations.\nThe ABAAE Quarteira beach page checked during research showed 2025 season dates, so exact 2026 bathing-season dates should be manually checked before publication updates.\nFacilities and beach-support services may vary by season and concession area.\nThe beach is divided by concrete breakwaters; visitors should take care near structures and avoid restricted or unsafe areas.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.\nThe promenade and most central sections are likely to be busiest in July and August.",
  "best_time_to_visit": "June to September for the main summer beach atmosphere and seasonal services. May, June and September are usually better for a more comfortable promenade walk and beach visit with fewer peak-summer crowds.",
  "suitable_for": [
    "Visitors staying in Quarteira",
    "Families wanting services close by",
    "Local residents",
    "Visitors seeking an easy urban beach",
    "Long-stay Algarve visitors",
    "Promenade walkers",
    "Visitors combining beach time with restaurants and town services"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors looking for dramatic cliff scenery",
    "Those wishing to avoid busy town beaches in summer",
    "Visitors expecting a quiet nature-focused beach setting"
  ],
  "nearby_attractions": [
    {
      "name": "Quarteira Seafront Promenade",
      "type": "Promenade",
      "description": "A long urban seafront beside the beach, useful for walking, cafes, restaurants and easy access along the town-front shoreline.",
      "verification_status": "Verified"
    },
    {
      "name": "Vilamoura Marina",
      "type": "Marina and resort area",
      "description": "A major marina and resort area west of Quarteira, suitable for dining, marina walks and boat departures.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Vilamoura",
      "type": "Nearby beach",
      "description": "A neighbouring resort beach west of Quarteira, connected with Vilamoura's marina setting.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Forte Novo",
      "type": "Nearby beach",
      "description": "A nearby beach east of central Quarteira, associated with the wider Loule coastal stretch.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Almargem",
      "type": "Nearby beach",
      "description": "A more natural beach east of Quarteira, near the Almargem area and part of the wider Loule coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Loule",
      "type": "Historic inland town",
      "description": "The municipal centre of Loule, known for its historic streets, market and inland Algarve character.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Quarteira",
    "Vilamoura",
    "Almancil",
    "Loule",
    "Vale do Lobo"
  ],
  "walking_trails_nearby": [
    {
      "name": "Quarteira seafront promenade walk",
      "description": "A practical urban-coastal walk along the Avenida Marginal and beach frontage, suitable for combining beach time with cafes, restaurants and town services.",
      "verification_status": "Verified"
    },
    {
      "name": "Vilamoura to Quarteira coastal walk",
      "description": "A town-and-resort coastal walk linking Vilamoura's marina area with Quarteira's urban beach and promenade.",
      "verification_status": "Verified"
    },
    {
      "name": "Ecovia do Litoral / EuroVelo 1 Algarve route",
      "description": "The wider Algarve coastal cycling and walking route passes through the region, with Quarteira forming part of the coastal route context. Visitors should confirm current route markings locally.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August if you want easier access to the most convenient serviced areas.",
    "Use the promenade for a simple beach-and-town route with restaurants and cafes close by.",
    "Choose your beach section in advance, as the shoreline is divided by breakwaters and access points vary.",
    "Expect a lively town beach rather than a secluded beach experience.",
    "Check local flags before swimming or bodyboarding.",
    "For a longer outing, combine Quarteira with Vilamoura Marina or the beaches east towards Forte Novo and Almargem."
  ],
  "photography_notes": "Praia de Quarteira is best photographed for its town-front beach life, promenade, broad sand and urban Algarve seaside atmosphere rather than wild natural scenery. Early morning is useful for quieter promenade and shoreline photographs.",
  "family_notes": "Praia de Quarteira can suit families who want a central beach with services close by. Families should still check beach flags, avoid unsafe areas near breakwaters and choose supervised sections during the bathing season.",
  "safety_notes": "Sea conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Take care near concrete breakwaters and avoid entering any restricted or unsafe zones.",
  "accessibility_notes": "VisitPortugal lists Praia de Quarteira as an accessible beach, and the municipal beach page search result states that it is prepared for disabled people. Visitors with reduced mobility should still confirm current access conditions and seasonal support before travelling.",
  "seo": {
    "meta_title": "Praia de Quarteira, Loule | Algarve Beach Guide",
    "meta_description": "Praia de Quarteira in Loule is a busy urban Algarve beach with long sand, promenade access, facilities, restaurants and local atmosphere.",
    "keywords": [
      "Praia de Quarteira",
      "Quarteira Beach",
      "Quarteira Loule",
      "Loule beaches",
      "Algarve beaches",
      "Portugal beaches",
      "urban beach Algarve",
      "Quarteira promenade",
      "family beach Quarteira",
      "accessible beach Quarteira",
      "Vilamoura nearby beach"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de Quarteira trip ideas",
      "links": [
        { "label": "Praia de Quarteira" },
        { "label": "Quarteira Beach" },
        { "label": "Quarteira promenade" },
        { "label": "urban beach Algarve" },
        { "label": "family beach Quarteira" },
        { "label": "accessible beach Quarteira" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Vilamoura Marina" },
        { "label": "Praia de Vilamoura" },
        { "label": "Praia do Forte Novo" },
        { "label": "Praia do Almargem" },
        { "label": "Loule" },
        { "label": "Ecovia do Litoral" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Quarteira",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-quarteira",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Quarteira, Loule",
        "Quarteira as one of the Algarve's busiest localities during summer",
        "Extensive sandy beach divided by concrete breakwaters",
        "Avenida Marginal and promenade context",
        "Beach-support infrastructure",
        "Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, bodyboard and accessible beach"
      ]
    },
    {
      "source_name": "VisitPortugal - Quarteira",
      "source_url": "https://www.visitportugal.com/pt-pt/content/quarteira",
      "facts_verified": [
        "Quarteira as a former fishing village",
        "Transformation into a cosmopolitan tourist centre",
        "Quarteira receiving many tourists every year",
        "Local town context"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia de Quarteira",
      "source_url": "https://visitalgarve.pt/equipamento/8767/praia-de-quarteira",
      "facts_verified": [
        "Almost two-kilometre sandy beach reference",
        "Shoreline divided by breakwaters",
        "Urban beach character",
        "High-use beach context",
        "Promenade and tourist-support context"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Quarteira",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/quarteira/",
      "facts_verified": [
        "Official Quarteira beach entry",
        "Coastal beach classification",
        "Municipality of Loule",
        "Coordinates",
        "Beach code PTCF7K",
        "2025 bathing-season and Blue Flag-season information shown on the checked beach page"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Quarteira listed among Loule's 2026 Blue Flag locations",
        "Loule listed with 12 awarded locations in 2026"
      ]
    },
    {
      "source_name": "Camara Municipal de Loule - Praia de Quarteira",
      "source_url": "https://www.cm-loule.pt/pt/menu/640/praia-de-quarteira.aspx",
      "facts_verified": [
        "Municipal beach page result confirming Praia de Quarteira",
        "Urban and intense beach character",
        "Coastal breakwaters",
        "Promenade and tourist-offering context",
        "Accessibility support noted in the municipal page search result"
      ]
    },
    {
      "source_name": "Camara Municipal de Loule - Quarteira",
      "source_url": "https://www.cm-loule.pt/pt/menu/48/quarteira.aspx",
      "facts_verified": [
        "Quarteira as a parish and town in Loule municipality",
        "Local identity connected with the beach, fish and coastal character"
      ]
    },
    {
      "source_name": "Camara Municipal de Loule - 2026 Blue Flag news",
      "source_url": "https://www.cm-loule.pt/pt/noticias/54026/litoral-do-concelho-de-loule-distinguido-com-bandeiras-azuis.aspx",
      "facts_verified": [
        "Loule coastline Blue Flag recognition in 2026",
        "Municipal confirmation context for awarded beaches",
        "Additional space for beachgoers between Quarteira and Garrao after coastal works, based on search-result summary"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia de Vilamoura",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-vilamoura",
      "facts_verified": [
        "Vilamoura as nearby beach west of Quarteira",
        "Coastal connection between Vilamoura and Quarteira"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, urban beach character, extensive sand, breakwaters, promenade context and facilities were verified from official tourism and Blue Flag sources.",
    "The phrase high local and tourist use is supported cautiously by official descriptions of Quarteira as one of the Algarve's busiest localities during summer and as a tourist centre receiving many visitors each year.",
    "ABAAE's 2026 list verifies Quarteira among Loule's 2026 Blue Flag locations. The individual ABAAE Quarteira page checked showed 2025 season dates, so exact 2026 bathing-season dates should be manually confirmed before publication updates.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on the bathing season or beach concessions.",
    "Accessibility is supported by VisitPortugal and municipal search-result information, but current access and seasonal support should still be checked before visiting.",
    "The Camara Municipal de Loule pages were visible in search results but returned a temporary fetch error when opened; therefore, their facts are used cautiously and supported mainly by the search-result summaries.",
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
  where slug = 'quarteira'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city quarteira was not found';
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
      'https://www.visitportugal.com/pt-pt/content/praia-de-quarteira',
      'Praia de Quarteira, Quarteira, Loule, Algarve, Portugal',
      37.06778,
      -8.104391,
      array[
        'Praia de Quarteira',
        'Quarteira Beach',
        'Quarteira Loule',
        'Loule beaches',
        'Algarve beaches',
        'Portugal beaches',
        'urban beach Algarve',
        'Quarteira promenade',
        'family beach Quarteira',
        'accessible beach Quarteira',
        'Vilamoura nearby beach'
      ],
      v_category_data,
      'Praia de Quarteira, Loule | Algarve Beach Guide',
      'Praia de Quarteira in Loule is a busy urban Algarve beach with long sand, promenade access, facilities, restaurants and local atmosphere.',
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
      website_url = 'https://www.visitportugal.com/pt-pt/content/praia-de-quarteira',
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
      address = 'Praia de Quarteira, Quarteira, Loule, Algarve, Portugal',
      latitude = 37.06778,
      longitude = -8.104391,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia de Quarteira',
        'Quarteira Beach',
        'Quarteira Loule',
        'Loule beaches',
        'Algarve beaches',
        'Portugal beaches',
        'urban beach Algarve',
        'Quarteira promenade',
        'family beach Quarteira',
        'accessible beach Quarteira',
        'Vilamoura nearby beach'
      ],
      category_data = v_category_data,
      meta_title = 'Praia de Quarteira, Loule | Algarve Beach Guide',
      meta_description = 'Praia de Quarteira in Loule is a busy urban Algarve beach with long sand, promenade access, facilities, restaurants and local atmosphere.',
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
