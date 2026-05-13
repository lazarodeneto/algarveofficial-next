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
  'Lagos',
  'lagos',
  'Historic western Algarve city close to Praia de Dona Ana, Costa d''Oiro beaches and Ponta da Piedade.',
  37.091611,
  -8.669377,
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
  v_slug text := 'praia-de-dona-ana-lagos';
  v_previous_slug text := 'praia-dona-ana-lagos';
  v_name text := 'Praia de Dona Ana';
  v_short_description text := $short$
Praia de Dona Ana is a famous postcard beach in Lagos, sheltered by golden cliffs and sculpted rock formations. It is one of the Algarve's most recognisable coastal images, with clear scenery, stair access and strong visitor appeal.
$short$;
  v_description text := $description$
Praia de Dona Ana is one of Lagos' most recognisable beach settings, located close to the city and framed by the warm-toned cliffs of the Costa d'Oiro. Official tourism sources describe it as a maritime beach sheltered between cliffs, with clean-looking waters, carved rocks emerging from the sea and scattered rock formations across the sand.

This is a classic Algarve postcard beach rather than a remote escape. From above, visitors look down over golden sand, blue-green water and limestone shapes that make Dona Ana one of the most photographed places on the Lagos coast. Its proximity to the city also makes it practical: Lagos can be reached on foot in around 25 minutes according to VisitPortugal, and the surrounding coastline links naturally with Praia do Pinhão, Praia do Camilo and Ponta da Piedade.

Access is an important part of the visitor experience. Lagos municipality confirms that the beach is reached exclusively by existing staircases, described as extensive and winding, with safety considerations because of the narrow access. During the bathing season, municipal rules restrict people carrying surf, SUP, windsurf, kitesurf, kayak, canoe or diving equipment on the stairs between 09:00 and 19:00.

Praia de Dona Ana can become very busy in summer, especially at the stairs, viewpoint areas and serviced beach sections. Visitors should plan around crowds, avoid cliff edges and cliff bases, and follow local signage, flags and seasonal safety instructions.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Dona Ana",
  "slug": "praia-de-dona-ana-lagos",
  "previous_slug": "praia-dona-ana-lagos",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Lagos",
  "concelho": "Lagos",
  "municipality": "Lagos",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Dona Ana is a famous postcard beach in Lagos, sheltered by golden cliffs and sculpted rock formations. It is one of the Algarve's most recognisable coastal images, with clear scenery, stair access and strong visitor appeal.",
  "full_description": "Praia de Dona Ana is one of Lagos' most recognisable beach settings, located close to the city and framed by the warm-toned cliffs of the Costa d'Oiro. Official tourism sources describe it as a maritime beach sheltered between cliffs, with clean-looking waters, carved rocks emerging from the sea and scattered rock formations across the sand.\n\nThis is a classic Algarve postcard beach rather than a remote escape. From above, visitors look down over golden sand, blue-green water and limestone shapes that make Dona Ana one of the most photographed places on the Lagos coast. Its proximity to the city also makes it practical: Lagos can be reached on foot in around 25 minutes according to VisitPortugal, and the surrounding coastline links naturally with Praia do Pinhão, Praia do Camilo and Ponta da Piedade.\n\nAccess is an important part of the visitor experience. Lagos municipality confirms that the beach is reached exclusively by existing staircases, described as extensive and winding, with safety considerations because of the narrow access. During the bathing season, municipal rules restrict people carrying surf, SUP, windsurf, kitesurf, kayak, canoe or diving equipment on the stairs between 09:00 and 19:00.\n\nPraia de Dona Ana can become very busy in summer, especially at the stairs, viewpoint areas and serviced beach sections. Visitors should plan around crowds, avoid cliff edges and cliff bases, and follow local signage, flags and seasonal safety instructions.",
  "coordinates": {
    "latitude": 37.091611,
    "longitude": -8.669377,
    "notes": "Coordinates were taken from the ABAAE D. Ana beach page."
  },
  "beach_type": "Sandy maritime beach below cliffs",
  "landscape": "A golden-sand beach sheltered by high, eroded limestone cliffs, with carved rock formations on the sand and in the water.",
  "access": "Access is exclusively by existing staircases, according to Lagos municipal regulations. The staircases are described as extensive and winding, so access may be challenging for visitors with reduced mobility, pushchairs or heavy beach equipment.",
  "highlights": [
    "One of Lagos' most famous postcard beaches",
    "Golden cliffs, sculpted rocks and blue-green coastal scenery",
    "Officially described as one of the Algarve beach images most widely circulated",
    "Close to Lagos city centre and the Costa d'Oiro coastline",
    "Nearby to Praia do Camilo, Praia do Pinhão and Ponta da Piedade",
    "Good for photography from both the cliff-top approach and the sand"
  ],
  "best_for": [
    "Photography",
    "Scenic views",
    "Couples",
    "Lagos city visitors",
    "Coastal walks",
    "Postcard Algarve scenery",
    "Short beach days",
    "Nature lovers"
  ],
  "facilities": [
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Seasonal" },
    { "name": "Restaurant", "status": "Seasonal" },
    { "name": "Blue Flag 2026 status", "status": "Not verified" }
  ],
  "includes": [
    "Seasonal safety or surveillance listed by official tourism source",
    "Seasonal sunshade rental",
    "Showers",
    "Car parking",
    "Seasonal bar",
    "Seasonal restaurant"
  ],
  "important_information": {
    "best_time_to_visit": "Spring, early summer and early autumn are best for photography and coastal walks. In July and August, early morning or late afternoon visits are usually more comfortable than peak midday periods.",
    "know_before_you_go": "Access to the beach is by staircases only, according to Lagos municipal regulation.\nThe municipal regulation describes the access staircases as extensive, winding and narrow in practical use.\nDuring the bathing season, access by the staircases with surf, SUP, windsurf, kitesurf, kayak, canoe or diving equipment is restricted between 09:00 and 19:00.\nThe beach can become very busy in summer because of its fame, city proximity and compact cliff setting.\nVisitors should keep away from cliff edges and cliff bases.\nFacilities and surveillance may be seasonal and should be checked before visiting.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nA current 2026 Blue Flag listing for Praia de Dona Ana was not verified during this research.",
    "notes": [
      "Access to the beach is by staircases only, according to Lagos municipal regulation.",
      "The municipal regulation describes the access staircases as extensive, winding and narrow in practical use.",
      "During the bathing season, access by the staircases with surf, SUP, windsurf, kitesurf, kayak, canoe or diving equipment is restricted between 09:00 and 19:00.",
      "The beach can become very busy in summer because of its fame, city proximity and compact cliff setting.",
      "Visitors should keep away from cliff edges and cliff bases.",
      "Facilities and surveillance may be seasonal and should be checked before visiting.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "A current 2026 Blue Flag listing for Praia de Dona Ana was not verified during this research."
    ]
  },
  "important_notes": "Access to the beach is by staircases only, according to Lagos municipal regulation.\nThe municipal regulation describes the access staircases as extensive, winding and narrow in practical use.\nDuring the bathing season, access by the staircases with surf, SUP, windsurf, kitesurf, kayak, canoe or diving equipment is restricted between 09:00 and 19:00.\nThe beach can become very busy in summer because of its fame, city proximity and compact cliff setting.\nVisitors should keep away from cliff edges and cliff bases.\nFacilities and surveillance may be seasonal and should be checked before visiting.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nA current 2026 Blue Flag listing for Praia de Dona Ana was not verified during this research.",
  "best_time_to_visit": "Spring, early summer and early autumn are best for photography and coastal walks. In July and August, early morning or late afternoon visits are usually more comfortable than peak midday periods.",
  "suitable_for": [
    "Photographers",
    "Couples",
    "Visitors staying in Lagos",
    "Coastal walkers",
    "Travellers looking for iconic Algarve scenery",
    "Visitors comfortable with stair access"
  ],
  "not_suitable_for": [
    "Visitors requiring step-free beach access",
    "Visitors with reduced mobility unless current access conditions are confirmed",
    "Visitors carrying bulky beach or nautical equipment during restricted periods",
    "Visitors seeking a quiet or spacious beach in peak summer",
    "Anyone uncomfortable with cliff-backed beaches"
  ],
  "nearby_attractions": [
    {
      "name": "Ponta da Piedade",
      "type": "Headland and coastal landmark",
      "description": "A famous Lagos headland with carved rock formations, grottos and sea views, located further along the Costa d'Oiro coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Camilo",
      "type": "Nearby beach",
      "description": "A small cliff-backed Lagos beach east of Dona Ana, commonly visited as part of the same coastal route.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Pinhão",
      "type": "Nearby beach",
      "description": "A neighbouring small beach between Lagos centre and Praia de Dona Ana, part of the compact cliff-coast sequence.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Batata",
      "type": "Nearby beach",
      "description": "A city-adjacent beach near central Lagos, useful as part of a walking route towards Dona Ana and Camilo.",
      "verification_status": "Verified"
    },
    {
      "name": "Lagos Historic Centre",
      "type": "Historic town centre",
      "description": "The nearby historic centre of Lagos offers streets, monuments, dining and cultural points within walking distance of the coast.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Lagos",
    "Meia Praia",
    "Praia da Luz",
    "Odiáxere",
    "Burgau"
  ],
  "walking_trails_nearby": [
    {
      "name": "Lagos coastal walk to Praia de Dona Ana and Ponta da Piedade",
      "description": "VisitPortugal notes that the smaller beaches of Batata, Pinhão, Dona Ana and Camilo can be reached from the city centre, with Ponta da Piedade further along the same coastal sequence.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in summer to avoid the busiest times around the staircase and beach entrance.",
    "Travel light, as the staircase access is not ideal for heavy equipment.",
    "Check current municipal restrictions before bringing boards, kayaks, canoes or diving equipment.",
    "Use the designated staircases and avoid informal cliff paths.",
    "For photography, visit early or late in the day for softer light on the cliffs.",
    "Combine Dona Ana with Praia do Camilo, Praia do Pinhão and Ponta da Piedade for a classic Lagos coastal route."
  ],
  "photography_notes": "Praia de Dona Ana is especially strong for postcard-style Algarve photography, with cliff-top views, golden rock formations and blue-green water. Use safe viewpoints and the official stair access; do not step beyond protected areas or approach unstable cliff edges for photographs.",
  "family_notes": "Families may enjoy the sheltered scenery and nearby services, but should plan carefully around the staircase, summer crowds and cliff environment. Children should be supervised closely near steps, rocks, water and cliff-backed sections.",
  "safety_notes": "Keep away from cliff edges and cliff bases, follow beach flags and local signage, and take care on the staircases. Municipal rules restrict bulky nautical equipment on the access stairs during bathing-season daytime hours.",
  "accessibility_notes": "Praia de Dona Ana is not verified as step-free. Lagos municipal information confirms staircase access, so visitors with reduced mobility should confirm current conditions before visiting.",
  "seo": {
    "meta_title": "Praia de Dona Ana, Lagos | Algarve Beach Guide",
    "meta_description": "Praia de Dona Ana in Lagos is a famous Algarve postcard beach with golden cliffs, sculpted rocks, stair access and coastal views.",
    "keywords": [
      "Praia de Dona Ana",
      "Praia Dona Ana",
      "Dona Ana Beach",
      "Lagos beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Lagos postcard beach",
      "Costa d'Oiro Lagos",
      "Ponta da Piedade",
      "Praia do Camilo",
      "Praia do Pinhão",
      "cliff beaches Algarve"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de Dona Ana trip ideas",
      "links": [
        { "label": "Praia de Dona Ana" },
        { "label": "Dona Ana Beach" },
        { "label": "Lagos beaches" },
        { "label": "Costa d'Oiro Lagos" },
        { "label": "Ponta da Piedade" },
        { "label": "cliff beaches Algarve" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Praia do Camilo" },
        { "label": "Praia do Pinhão" },
        { "label": "Praia da Batata" },
        { "label": "Lagos Historic Centre" },
        { "label": "Meia Praia" },
        { "label": "Praia da Luz" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Dona Ana",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-dona-ana",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Lagos",
        "Cliff-sheltered landscape",
        "Clear water and carved rock formations",
        "Description as one of the most widely circulated images of Algarve beaches",
        "Proximity to Lagos and approximate 25-minute walking distance",
        "Facilities listed including surveillance, sunshade rental, showers, parking, bar and restaurant"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagos - Regulamento de Acesso às Praias da Dona Ana e do Camilo",
      "source_url": "https://www.cm-lagos.pt/balcao-virtual/documentos/regulamentos/download/24351/12650/104",
      "facts_verified": [
        "Municipal access regulation for Praia da Dona Ana and Praia do Camilo",
        "Beach access exclusively through existing staircases",
        "Staircases described as extensive, winding and limited for bulky equipment",
        "Safety rationale for access management",
        "Bathing-season restrictions on nautical sports equipment through the staircases between 09:00 and 19:00",
        "Penalty framework for non-compliance"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagos - Access regulation news item",
      "source_url": "https://www.cm-lagos.pt/index.php?Itemid=657&cid=17%3Anoticias&id=12752%3Aacesso-as-praias-dona-ana-e-camilo-passou-a-estar-regulamentado&lang=pt&option=com_flexicontent&view=item",
      "facts_verified": [
        "2024 implementation of access rules",
        "Restrictions on boards, nautical sports equipment and diving equipment through the staircases during bathing season",
        "Purpose of rules: coastal resource management, landscape protection and risk prevention"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - D. Ana",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/d-ana/",
      "facts_verified": [
        "D. Ana coastal beach entry",
        "Municipality of Lagos",
        "Coordinates",
        "Legacy Blue Flag page showing non-hoisted flag and dated season information"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/wp-content/uploads/sites/2/2026/04/BA_listas-regioes_2026.pdf",
      "facts_verified": [
        "2026 Algarve Blue Flag list checked",
        "Lagos 2026 Blue Flag beach entries listed as Luz, Porto de Mós and Meia Praia",
        "Praia de Dona Ana not found among the listed Lagos 2026 Blue Flag beaches during verification"
      ]
    },
    {
      "source_name": "VisitPortugal - Lagos",
      "source_url": "https://www.visitportugal.com/pt-pt/destinos/algarve/73799",
      "facts_verified": [
        "Lagos coastal context",
        "Nearby beaches including Batata, Pinhão, Dona Ana and Camilo",
        "Ponta da Piedade as a nearby landmark with carved formations and grottos",
        "Access from the city centre to the smaller beaches",
        "Historic centre and marina context"
      ]
    },
    {
      "source_name": "Fototeca Municipal de Lagos - Praia Dona Ana",
      "source_url": "https://fototeca.cm-lagos.pt/praias-e-costa/praia-dona-ana-8",
      "facts_verified": [
        "Municipal description of Praia Dona Ana between rocky cliffs",
        "Sand and blue-green water landscape",
        "Access by stairs",
        "Beach support and surveillance reference",
        "Historic or municipal Blue Flag reference not treated as current 2026 status"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Lagos municipality, cliff-sheltered landscape, postcard image status, facilities and city proximity were verified from VisitPortugal.",
    "Access details and equipment restrictions were verified from Câmara Municipal de Lagos and the official 2024 municipal regulation.",
    "Coordinates were taken from the ABAAE D. Ana beach page.",
    "Current 2026 Blue Flag status was not verified. The ABAAE 2026 Algarve list checked shows Lagos entries for Luz, Porto de Mós and Meia Praia, but not Dona Ana.",
    "The ABAAE D. Ana page appears to show legacy season information, so it was not used as proof of current Blue Flag status.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is not marked as verified because access is via staircases.",
    "No prohibited third-party platform names, public review scores or unsupported ranking claims were included in the public listing text."
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
  where slug = 'lagos'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city lagos was not found';
  end if;

  select id, slug, tier, category_id
    into v_listing_id, v_old_slug, v_existing_tier, v_existing_category_id
  from public.listings
  where slug in (v_slug, v_previous_slug)
     or lower(name) = lower(v_name)
  order by case when slug = v_slug then 0 when slug = v_previous_slug then 1 else 2 end, updated_at desc
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
      where slug in (v_slug, v_previous_slug);
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
      'https://www.visitportugal.com/pt-pt/content/praia-de-dona-ana',
      'Praia de Dona Ana, Lagos, Algarve, Portugal',
      37.091611,
      -8.669377,
      array[
        'Praia de Dona Ana',
        'Praia Dona Ana',
        'Dona Ana Beach',
        'Lagos beaches',
        'Algarve beaches',
        'Portugal beaches',
        'Lagos postcard beach',
        'Costa d''Oiro Lagos',
        'Ponta da Piedade',
        'cliff beaches Algarve'
      ],
      v_category_data,
      'Praia de Dona Ana, Lagos | Algarve Beach Guide',
      'Praia de Dona Ana in Lagos is a famous Algarve postcard beach with golden cliffs, sculpted rocks, stair access and coastal views.',
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
      website_url = 'https://www.visitportugal.com/pt-pt/content/praia-de-dona-ana',
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
      address = 'Praia de Dona Ana, Lagos, Algarve, Portugal',
      latitude = 37.091611,
      longitude = -8.669377,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia de Dona Ana',
        'Praia Dona Ana',
        'Dona Ana Beach',
        'Lagos beaches',
        'Algarve beaches',
        'Portugal beaches',
        'Lagos postcard beach',
        'Costa d''Oiro Lagos',
        'Ponta da Piedade',
        'cliff beaches Algarve'
      ],
      category_data = v_category_data,
      meta_title = 'Praia de Dona Ana, Lagos | Algarve Beach Guide',
      meta_description = 'Praia de Dona Ana in Lagos is a famous Algarve postcard beach with golden cliffs, sculpted rocks, stair access and coastal views.',
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
