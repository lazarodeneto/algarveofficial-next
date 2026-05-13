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
  'Olhos de Água / Açoteias, near Vilamoura',
  'olhos-de-agua-acoteias-near-vilamoura',
  'Albufeira coastal area around Olhos de Água and Açoteias, close to Praia da Falésia and the Vilamoura side of the coast.',
  37.086149,
  -8.168335,
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
  v_category_id uuid;
  v_city_id uuid;
  v_region_id uuid := null;
  v_slug text := 'praia-da-falesia-albufeira';
  v_previous_slug text := 'praia-da-falesia-albufeira-loule';
  v_name text := 'Praia da Falésia';
  v_short_description text := $short$
Praia da Falésia is a long cliff-backed beach in Albufeira, stretching for several kilometres between Olhos de Água and Vilamoura. It is known for its red and golden cliffs, wide sandy shore, resort-area access points and strong international recognition.
$short$;
  v_description text := $description$
Praia da Falésia is one of the Algarve's most recognisable coastal landscapes, set along the eastern side of Albufeira between Olhos de Água and Vilamoura. Its name comes from the striking cliff line behind the sand, where warm red, copper and golden tones create a distinctive backdrop, especially in the softer light of late afternoon.

The beach is long, open and spacious, with several access points serving the Açoteias and Alfamar areas. Official tourism sources describe the shore as extending for several kilometres and note that parts of the beach are concessioned, with road access and resort-area connections. This makes Falésia especially suitable for visitors staying in nearby hotels, tourist villages and resort areas who want a beach with broad sand, scenic walking potential and a strong Algarve identity.

Falésia is also one of the Algarve beaches with notable international recognition, highlighted for its landscape, scale and visitor appeal. The setting suits long beach walks, photography, sunbathing and relaxed coastal days, although conditions can vary and visitors should always follow local signage. During the main season it can become busy, particularly around the easier access points. For a quieter experience, early morning, late afternoon and shoulder-season visits are often more comfortable.

Because the beach is backed by cliffs, visitors should avoid standing or sitting close to the base of the cliffs and should take care on any elevated paths or access routes.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Falésia",
  "slug": "praia-da-falesia-albufeira",
  "previous_slug": "praia-da-falesia-albufeira-loule",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Olhos de Água / Açoteias, near Vilamoura",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Falésia is a long cliff-backed beach in Albufeira, stretching for several kilometres between Olhos de Água and Vilamoura. It is known for its red and golden cliffs, wide sandy shore, resort-area access points and strong international recognition.",
  "full_description": "Praia da Falésia is one of the Algarve's most recognisable coastal landscapes, set along the eastern side of Albufeira between Olhos de Água and Vilamoura. Its name comes from the striking cliff line behind the sand, where warm red, copper and golden tones create a distinctive backdrop, especially in the softer light of late afternoon.\n\nThe beach is long, open and spacious, with several access points serving the Açoteias and Alfamar areas. Official tourism sources describe the shore as extending for several kilometres and note that parts of the beach are concessioned, with road access and resort-area connections. This makes Falésia especially suitable for visitors staying in nearby hotels, tourist villages and resort areas who want a beach with broad sand, scenic walking potential and a strong Algarve identity.\n\nFalésia is also one of the Algarve beaches with notable international recognition, highlighted for its landscape, scale and visitor appeal. The setting suits long beach walks, photography, sunbathing and relaxed coastal days, although conditions can vary and visitors should always follow local signage. During the main season it can become busy, particularly around the easier access points. For a quieter experience, early morning, late afternoon and shoulder-season visits are often more comfortable.\n\nBecause the beach is backed by cliffs, visitors should avoid standing or sitting close to the base of the cliffs and should take care on any elevated paths or access routes.",
  "coordinates": {
    "latitude": 37.086149,
    "longitude": -8.168335,
    "label": "Falésia Açoteias",
    "notes": "Primary map point uses the official Falésia Açoteias coordinates. ABAAE also lists Falésia Alfamar at 37.083496, -8.158958."
  },
  "coordinate_points": [
    {
      "name": "Falésia Açoteias",
      "latitude": 37.086149,
      "longitude": -8.168335,
      "verification_status": "Verified"
    },
    {
      "name": "Falésia Alfamar",
      "latitude": 37.083496,
      "longitude": -8.158958,
      "verification_status": "Verified"
    }
  ],
  "beach_type": "Long sandy maritime beach",
  "landscape": "Wide sandy shore backed by a continuous line of red, copper and golden cliffs.",
  "access": "Verified road access is described by official tourism sources for the Açoteias area, with an additional access point associated with the Alfamar area. Access conditions can vary by section, and visitors should confirm the most suitable entrance before travelling.",
  "highlights": [
    "Long sandy beach extending for several kilometres between Olhos de Água and Vilamoura",
    "Distinctive red, copper and golden cliff scenery",
    "Internationally recognised Algarve beach with strong visitor appeal",
    "Multiple resort-area access points around Açoteias and Alfamar",
    "Good for long beach walks and coastal photography",
    "Official 2026 Blue Flag entries listed for Falésia Açoteias and Falésia Alfamar"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Long beach walks",
    "Couples",
    "Families using serviced sections",
    "Resort-stay visitors",
    "Sunset walks",
    "Nature lovers"
  ],
  "facilities": [
    { "name": "Concessioned beach areas", "status": "Verified" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Seasonal" },
    { "name": "Restaurant", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Light boat rental / nautical activities", "status": "Seasonal" },
    { "name": "Blue Flag 2026 designation for Falésia Açoteias and Falésia Alfamar", "status": "Seasonal" }
  ],
  "includes": [
    "Concessioned beach areas",
    "Car parking",
    "Seasonal bar",
    "Seasonal restaurant",
    "Showers",
    "Seasonal sunshade rental",
    "Seasonal safety or surveillance",
    "Seasonal light boat rental / nautical activities",
    "Seasonal 2026 Blue Flag designation for Falésia Açoteias and Falésia Alfamar"
  ],
  "important_information": {
    "best_time_to_visit": "May to October for the official bathing season, with early morning, late afternoon and shoulder-season visits offering a calmer experience for walks and photography.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Falésia Açoteias and Falésia Alfamar as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for Falésia Açoteias and Falésia Alfamar as 1 July 2026 to 30 September 2026.\nBlue Flag status and seasonal services should be checked before visiting, especially outside the main bathing season.\nThe beach is backed by cliffs; visitors should keep a safe distance from cliff bases and edges.\nFacilities may vary by beach section and season.\nThe easiest resort-area access points may become busy during peak summer periods.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Falésia Açoteias and Falésia Alfamar as 15 May 2026 to 15 October 2026.",
      "ABAAE lists the 2026 Blue Flag season for Falésia Açoteias and Falésia Alfamar as 1 July 2026 to 30 September 2026.",
      "Blue Flag status and seasonal services should be checked before visiting, especially outside the main bathing season.",
      "The beach is backed by cliffs; visitors should keep a safe distance from cliff bases and edges.",
      "Facilities may vary by beach section and season.",
      "The easiest resort-area access points may become busy during peak summer periods.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Falésia Açoteias and Falésia Alfamar as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for Falésia Açoteias and Falésia Alfamar as 1 July 2026 to 30 September 2026.\nBlue Flag status and seasonal services should be checked before visiting, especially outside the main bathing season.\nThe beach is backed by cliffs; visitors should keep a safe distance from cliff bases and edges.\nFacilities may vary by beach section and season.\nThe easiest resort-area access points may become busy during peak summer periods.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "May to October for the official bathing season, with early morning, late afternoon and shoulder-season visits offering a calmer experience for walks and photography.",
  "suitable_for": [
    "Visitors staying in Açoteias, Alfamar, Olhos de Água or Vilamoura resort areas",
    "Beach walkers",
    "Photographers",
    "Couples",
    "Families who prefer serviced beach sections",
    "Visitors looking for a spacious sandy beach"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach experience",
    "Visitors with reduced mobility unless a suitable access point is confirmed in advance",
    "Visitors wishing to avoid popular beach areas during peak summer",
    "Anyone intending to sit close to cliff bases"
  ],
  "nearby_attractions": [
    {
      "name": "Olhos de Água",
      "type": "Nearby town and beach area",
      "description": "A coastal village west of Falésia, known for its beach setting and proximity to the western end of the Falésia coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Barranco das Belharucas Beach",
      "type": "Beach",
      "description": "A neighbouring beach area close to the western side of the Falésia stretch, useful for visitors exploring the Olhos de Água coast.",
      "verification_status": "Verified"
    },
    {
      "name": "Rocha Baixinha",
      "type": "Beach",
      "description": "An eastern beach area connected with the wider sandy coastline towards Vilamoura.",
      "verification_status": "Verified"
    },
    {
      "name": "Vilamoura Marina",
      "type": "Marina and resort area",
      "description": "A major resort and marina area east of the Falésia coastline, suitable for dining, marina walks and onward exploration.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Olhos de Água",
    "Açoteias",
    "Albufeira",
    "Vilamoura",
    "Quarteira"
  ],
  "walking_trails_nearby": [
    {
      "name": "Falésia Beach coastal walk",
      "description": "Visit Albufeira lists Falésia Beach among its walks and tours, and the beach itself is well suited to long shoreline walks when tide and weather conditions allow.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Choose your access point in advance, as the beach is long and facilities vary by section.",
    "Arrive early in summer if using the main Açoteias or Alfamar access areas.",
    "For photography, late afternoon light brings out the warm tones of the cliffs.",
    "Keep away from cliff bases and edges, even when the beach appears calm.",
    "Check local signage before swimming or using any seasonal services.",
    "For a longer outing, combine Falésia with Olhos de Água, Rocha Baixinha or Vilamoura."
  ],
  "photography_notes": "Best photographed from the sand or designated viewpoints when the low sun warms the red and golden tones of the cliffs. Avoid unsafe cliff edges and do not stand close to the base of the cliffs for photographs.",
  "family_notes": "The long sandy beach and serviced sections can suit families, especially near concessioned areas. Families should still check sea conditions, local flags and seasonal surveillance before swimming.",
  "safety_notes": "Sea conditions can vary. Follow beach flags, lifeguard or surveillance instructions where present, and avoid cliff bases and cliff edges due to potential instability.",
  "accessibility_notes": "Accessibility information is not fully verified for all Falésia access points. Visitors with reduced mobility should confirm current access conditions for the specific section they plan to use before visiting.",
  "seo": {
    "meta_title": "Praia da Falésia, Albufeira | Algarve Beach Guide",
    "meta_description": "Praia da Falésia in Albufeira is a long sandy Algarve beach known for red cliffs, resort access, scenic walks and international recognition.",
    "keywords": [
      "Praia da Falésia",
      "Praia da Falesia",
      "Falésia Beach",
      "Albufeira beaches",
      "Olhos de Água",
      "Açoteias",
      "Alfamar",
      "Vilamoura beaches",
      "Algarve beaches",
      "Portugal beaches",
      "long beach walks Algarve",
      "red cliffs Algarve"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia da Falésia trip ideas",
      "links": [
        { "label": "Praia da Falésia" },
        { "label": "Falésia Beach" },
        { "label": "Albufeira beaches" },
        { "label": "Olhos de Água" },
        { "label": "Açoteias" },
        { "label": "red cliffs Algarve" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Barranco das Belharucas Beach" },
        { "label": "Rocha Baixinha" },
        { "label": "Vilamoura Marina" },
        { "label": "Quarteira" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Falésia - Açoteias / Alfamar",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-fal%C3%A9sia-a%C3%A7oteias-alfamar",
      "facts_verified": [
        "Beach name",
        "Beach category",
        "Albufeira location",
        "Setting between Olhos de Água and Vilamoura",
        "Red, copper and golden cliff landscape",
        "Several kilometres of sand",
        "Concessioned areas",
        "Road access and Alfamar access reference",
        "Listed services including Blue Flag, surveillance, rentals, showers, parking, bar and restaurant"
      ]
    },
    {
      "source_name": "Visit Albufeira - Falésia Beach",
      "source_url": "https://visitalbufeira.pt/destaques/praia-da-falesia/",
      "facts_verified": [
        "International recognition wording",
        "Vast stretch of golden sand",
        "Red cliffs",
        "Albufeira coastline location",
        "Visitor appeal for seaside walks and nature"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Falésia Açoteias",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/falesia-acoteias/",
      "facts_verified": [
        "Falésia Açoteias Blue Flag listing",
        "Coastal beach classification",
        "Municipality of Albufeira",
        "Coordinates",
        "2026 bathing season",
        "2026 Blue Flag season"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Falésia Alfamar",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/falesia-alfamar/",
      "facts_verified": [
        "Falésia Alfamar Blue Flag listing",
        "2026 bathing season",
        "2026 Blue Flag season"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia da Falésia",
      "source_url": "https://visitalgarve.pt/equipamento/8733/Praia%20da%20Falesia",
      "facts_verified": [
        "Almost six-kilometre continuous sandy stretch",
        "High cliffs in strong red and pale tones",
        "Road access through Aldeia das Açoteias",
        "Parking information by section"
      ]
    },
    {
      "source_name": "Forbes Portugal - Praia da Falésia in 2026 international beach ranking",
      "source_url": "https://www.forbespt.com/praia-da-falesia-entra-no-ranking-das-melhores-praias-do-mundo-em-2026/",
      "facts_verified": [
        "Recent international recognition in 2026 beach ranking coverage",
        "Praia da Falésia listed in global and European beach rankings"
      ]
    },
    {
      "source_name": "VisitPortugal - Vilamoura e a sua marina",
      "source_url": "https://www.visitportugal.com/pt-pt/destinos/algarve/73801",
      "facts_verified": [
        "Vilamoura Marina as a nearby resort and marina attraction"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Albufeira municipality, landscape, long sandy character and resort-area access were verified from official tourism sources.",
    "Official beach records checked list Falésia Açoteias and Falésia Alfamar under Albufeira. The public visitor geography connects the beach with Vilamoura to the east, but Loulé was not used as the official concelho for this listing.",
    "ABAAE provides separate official coordinates for Falésia Açoteias and Falésia Alfamar, so both coordinate points are included rather than inventing a single central coordinate.",
    "Blue Flag information is season-specific. ABAAE lists the 2026 bathing season and Blue Flag season, but visitors should verify current status before visiting.",
    "Facilities are included only where listed by official tourism sources and are marked Seasonal where they may depend on the bathing season or concession operation.",
    "Accessibility across all access points could not be fully verified from authoritative sources and is therefore marked as requiring confirmation.",
    "No prohibited third-party platform names, public review scores or unsupported award claims were included in the public listing text."
  ]
}
$json$::jsonb;
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
  where slug = 'olhos-de-agua-acoteias-near-vilamoura'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city olhos-de-agua-acoteias-near-vilamoura was not found';
  end if;

  select id, slug
    into v_listing_id, v_old_slug
  from public.listings
  where slug in (v_slug, v_previous_slug)
     or lower(name) = lower(v_name)
  order by case when slug = v_slug then 0 when slug = v_previous_slug then 1 else 2 end, updated_at desc
  limit 1;

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
      'https://www.visitportugal.com/pt-pt/content/praia-da-fal%C3%A9sia-a%C3%A7oteias-alfamar',
      'Praia da Falésia, Olhos de Água / Açoteias, Albufeira, Algarve, Portugal',
      37.086149,
      -8.168335,
      array[
        'Praia da Falésia',
        'Praia da Falesia',
        'Falésia Beach',
        'Albufeira beaches',
        'Olhos de Água',
        'Açoteias',
        'Alfamar',
        'Vilamoura beaches',
        'long beach walks Algarve',
        'red cliffs Algarve'
      ],
      v_category_data,
      'Praia da Falésia, Albufeira | Algarve Beach Guide',
      'Praia da Falésia in Albufeira is a long sandy Algarve beach known for red cliffs, resort access, scenic walks and international recognition.',
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
      website_url = 'https://www.visitportugal.com/pt-pt/content/praia-da-fal%C3%A9sia-a%C3%A7oteias-alfamar',
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
      address = 'Praia da Falésia, Olhos de Água / Açoteias, Albufeira, Algarve, Portugal',
      latitude = 37.086149,
      longitude = -8.168335,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia da Falésia',
        'Praia da Falesia',
        'Falésia Beach',
        'Albufeira beaches',
        'Olhos de Água',
        'Açoteias',
        'Alfamar',
        'Vilamoura beaches',
        'long beach walks Algarve',
        'red cliffs Algarve'
      ],
      category_data = v_category_data,
      meta_title = 'Praia da Falésia, Albufeira | Algarve Beach Guide',
      meta_description = 'Praia da Falésia in Albufeira is a long sandy Algarve beach known for red cliffs, resort access, scenic walks and international recognition.',
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
    values (v_listing_id, v_previous_slug, false)
    on conflict (slug) do update set
      listing_id = excluded.listing_id,
      is_current = false
    where public.listing_slugs.listing_id = excluded.listing_id;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, v_slug, true)
    on conflict (slug) do update set
      listing_id = excluded.listing_id,
      is_current = true
    where public.listing_slugs.listing_id = excluded.listing_id;
  end if;
end $$;

commit;
