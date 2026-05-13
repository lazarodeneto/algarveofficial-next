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
  'Central Algarve resort city with eastern village beaches including Olhos de Água and the Falésia coast.',
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
  v_slug text := 'praia-dos-olhos-de-agua-albufeira';
  v_name text := 'Praia dos Olhos de Água';
  v_address text := 'Praia dos Olhos de Água, Olhos de Água / Albufeira, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/en/content/praia-dos-olhos-de-agua';
  v_latitude numeric := 37.089726;
  v_longitude numeric := -8.189878;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia dos Olhos de Água",
  "slug": "praia-dos-olhos-de-agua-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Olhos de Água / Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia dos Olhos de Água is a popular village and resort beach in Albufeira, known for its freshwater springs visible at low tide. It combines traditional fishing character, ochre cliffs, restaurants and easy access from the Olhos de Água resort area.",
  "full_description": "Praia dos Olhos de Água is one of Albufeira’s most distinctive village beaches, located in the former fishing settlement of Olhos de Água east of the city centre. Its name comes from the freshwater springs that emerge among the rocks and through the sand at low tide, a natural feature confirmed by official tourism sources and still central to the beach’s identity.\n\nThe beach has a compact, cove-like setting framed by ochre cliffs, with the village immediately behind the sand. Traditional fishing boats can still be seen on the shore, giving Olhos de Água a more local character than many resort-only beaches, although the area is now well developed for tourism. Restaurants, bars, beach surveillance and a small artisanal fishing area are listed by official local tourism, while VisitPortugal also identifies a strong range of facilities and services.\n\nThis is a popular, high-use beach rather than a secluded escape. The municipal beach page describes it as an urban bathing area with intensive use and strong demand, so visitors should expect busy conditions in peak summer, especially around the main access points, restaurants and serviced beach sections.\n\nPraia dos Olhos de Água is well suited to visitors staying locally, families using supervised seasonal sections, couples, and anyone wanting a beach with village atmosphere, natural detail and resort convenience. To see the springs, plan around low tide; to reduce crowding, visit early, later in the day or outside July and August.",
  "coordinates": {
    "latitude": 37.089726,
    "longitude": -8.189878,
    "label": "Praia dos Olhos de Água / Olhos d’Água",
    "notes": "Coordinates were taken from the official ABAAE Olhos d’Água beach entry."
  },
  "beach_type": "Compact sandy urban village beach",
  "landscape": "A sandy beach set below ochre-toned cliffs, with rocky sections, freshwater springs at low tide, traditional fishing boats and a developed village-resort backdrop.",
  "access": "Official local tourism describes access as straightforward. VisitPortugal lists access by car or motorbike and on foot, and the beach is located directly beside the village of Olhos de Água. Visitors with mobility needs should confirm the most suitable current access point before travelling.",
  "highlights": [
    "Freshwater springs visible in the sand and rocks at low tide",
    "Traditional fishing-village character with small boats on the beach",
    "Compact sandy beach framed by ochre cliffs",
    "Popular village and resort beach with restaurants and bars nearby",
    "Official 2026 Blue Flag listing for Olhos d’Água",
    "Accessible-beach recognition supported by official tourism and municipal accessible-beach material"
  ],
  "best_for": [
    "Village beach atmosphere",
    "Families using serviced sections",
    "Couples",
    "Low-tide nature interest",
    "Restaurants nearby",
    "Photography",
    "Resort-stay visitors",
    "Accessible beach access, subject to current confirmation"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Beach surveillance / lifeguards", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Small artisanal fishing area", "status": "Verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Seasonal sunshade rental",
    "Showers",
    "Car parking",
    "Bar and restaurant",
    "Small artisanal fishing area",
    "Freshwater springs visible at low tide"
  ],
  "important_information": {
    "best_time_to_visit": "May to October for the official bathing season. Visit at low tide to see the freshwater springs, and choose early morning or late afternoon in July and August for a calmer experience.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Olhos d’Água as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for Olhos d’Água as 1 July 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nThe freshwater springs are best seen at low tide, especially around the eastern rocky section.\nThe beach is officially described by the municipality as an urban bathing area with intensive use and strong demand.\nFacilities and surveillance may vary by season and concession operation.\nThe beach includes rocky areas and cliffs; visitors should avoid cliff bases and take care around rocks, especially at low tide.\nSea conditions can vary; visitors should follow beach flags, local signage and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Olhos d’Água as 15 May 2026 to 15 October 2026.",
      "ABAAE lists the 2026 Blue Flag season for Olhos d’Água as 1 July 2026 to 30 September 2026.",
      "At the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "The freshwater springs are best seen at low tide, especially around the eastern rocky section.",
      "The beach is officially described by the municipality as an urban bathing area with intensive use and strong demand.",
      "Facilities and surveillance may vary by season and concession operation.",
      "The beach includes rocky areas and cliffs; visitors should avoid cliff bases and take care around rocks, especially at low tide.",
      "Sea conditions can vary; visitors should follow beach flags, local signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Olhos d’Água as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for Olhos d’Água as 1 July 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nThe freshwater springs are best seen at low tide, especially around the eastern rocky section.\nThe beach is officially described by the municipality as an urban bathing area with intensive use and strong demand.\nFacilities and surveillance may vary by season and concession operation.\nThe beach includes rocky areas and cliffs; visitors should avoid cliff bases and take care around rocks, especially at low tide.\nSea conditions can vary; visitors should follow beach flags, local signage and official safety guidance.",
  "best_time_to_visit": "May to October for the official bathing season. Visit at low tide to see the freshwater springs, and choose early morning or late afternoon in July and August for a calmer experience.",
  "suitable_for": [
    "Visitors staying in Olhos de Água",
    "Families wanting a serviced village beach",
    "Couples looking for a scenic beach with restaurants nearby",
    "Visitors interested in local fishing heritage",
    "Photographers",
    "Low-tide explorers",
    "Visitors wanting beach access close to resort accommodation"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Those wishing to avoid busy village-resort beaches in summer",
    "Visitors expecting a large open beach with extensive space",
    "Anyone intending to sit close to cliff bases",
    "Visitors requiring accessibility support without confirming current seasonal arrangements"
  ],
  "nearby_attractions": [
    {
      "name": "Olhos de Água Viewpoint",
      "type": "Viewpoint",
      "description": "An elevated viewpoint near the centre of Olhos de Água, offering views over the beach, cliffs, village houses and eastern Albufeira coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Torre da Medronheira",
      "type": "Historic watchtower",
      "description": "A 16th-century coastal watchtower on an elevated cliffside in Olhos de Água, linked to Algarve coastal defence and maritime surveillance.",
      "verification_status": "Verified"
    },
    {
      "name": "Olhos de Água Market",
      "type": "Local market",
      "description": "A local market where visitors can find fresh produce, food items and traditional goods in the village area.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia Maria Luísa",
      "type": "Nearby beach",
      "description": "A neighbouring beach west of Olhos de Água, framed by golden cliffs and Mediterranean vegetation.",
      "verification_status": "Verified"
    },
    {
      "name": "Barranco das Belharucas Beach",
      "type": "Nearby beach",
      "description": "A nearby beach east of Olhos de Água, forming part of the wider eastern Albufeira coastal route towards Falésia.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Olhos de Água",
    "Albufeira",
    "Santa Eulália",
    "Açoteias",
    "Ferreiras",
    "Vilamoura"
  ],
  "walking_trails_nearby": [
    {
      "name": "Olhos de Água village, viewpoint and beach walk",
      "description": "A short local walk linking the beach, village centre and Olhos de Água Viewpoint. It is geographically sensible and supported by official nearby attraction listings, but should not be treated as a formal signed trail unless confirmed locally.",
      "verification_status": "Not verified"
    },
    {
      "name": "Low-tide shoreline walk towards Barranco das Belharucas",
      "description": "A coastal beach walk that may be possible in suitable low-tide and calm conditions. Visitors should check tide, sea state and cliff safety before attempting it.",
      "verification_status": "Not verified"
    }
  ],
  "visitor_tips": [
    "Check the tide table if you want to see the freshwater springs clearly.",
    "Arrive early in July and August, as the beach is compact and the village area can become busy.",
    "Use official access points and avoid climbing on unstable rocks or cliffs.",
    "Keep a safe distance from cliff bases, especially after rain or strong sea conditions.",
    "Book restaurants or arrive outside peak meal times in high season.",
    "For photographs, combine the beach with the Olhos de Água Viewpoint."
  ],
  "photography_notes": "Praia dos Olhos de Água is especially photogenic at low tide, when the freshwater springs can be seen bubbling through the sand and rocks. The fishing boats, ochre cliffs and elevated viewpoint also give strong village-coast compositions.",
  "family_notes": "The beach can suit families who want services, restaurants and village access close by. Families should still choose supervised seasonal areas where available, check flags before swimming and watch children around rocks and fishing equipment.",
  "safety_notes": "Sea conditions can vary. Follow local beach flags, signage and lifeguard instructions where present. Take care around rocks at low tide and keep away from cliff bases and cliff edges.",
  "accessibility_notes": "VisitPortugal lists Praia dos Olhos de Água as an accessible beach, and Albufeira’s 2025 accessible-beach material includes Olhos de Água. Current seasonal support, adapted equipment and the best access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia dos Olhos de Água, Albufeira | Beach Guide",
    "meta_description": "Praia dos Olhos de Água in Albufeira is a popular village beach with freshwater springs, fishing boats, cliffs, restaurants and Blue Flag status.",
    "keywords": [
      "Praia dos Olhos de Água",
      "Praia de Olhos de Agua",
      "Olhos de Água beach",
      "Albufeira beaches",
      "Algarve beaches",
      "Portugal beaches",
      "freshwater springs Algarve",
      "village beach Albufeira",
      "family beach Albufeira",
      "Blue Flag Olhos de Água",
      "Praia Maria Luísa nearby",
      "Barranco das Belharucas"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia dos Olhos de Água trip ideas",
      "links": [
        { "label": "Praia dos Olhos de Água" },
        { "label": "Praia de Olhos de Agua" },
        { "label": "Olhos de Água beach" },
        { "label": "freshwater springs Algarve" },
        { "label": "village beach Albufeira" },
        { "label": "family beach Albufeira" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Olhos de Água Viewpoint" },
        { "label": "Torre da Medronheira" },
        { "label": "Olhos de Água Market" },
        { "label": "Praia Maria Luísa" },
        { "label": "Barranco das Belharucas" },
        { "label": "Açoteias" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia dos Olhos de Água",
      "source_url": "https://www.visitportugal.com/en/content/praia-dos-olhos-de-agua",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Olhos de Água, Albufeira",
        "Fishing-village origin",
        "Freshwater springs at the eastern end of the beach",
        "Springs visible at low tide",
        "Ochre cliff setting",
        "High-quality facilities and restaurants"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia dos Olhos de Água service listing",
      "source_url": "https://www.visitportugal.com/pt-pt/NR/exeres/D0C9757B-CE8B-41F7-A7C2-8181C30746B1",
      "facts_verified": [
        "Blue Flag listed by VisitPortugal",
        "Safety or surveillance listed",
        "Sunshade rental listed",
        "Showers listed",
        "Parking listed",
        "Bar and restaurant listed",
        "Accessible beach listed",
        "Access by car, motorbike and on foot"
      ]
    },
    {
      "source_name": "Visit Albufeira - Praia de Olhos de Água",
      "source_url": "https://visitalbufeira.pt/praia/praia-de-olhos-de-agua",
      "facts_verified": [
        "Freshwater springs emerging from the sand at low tide",
        "Traditional fishing heritage",
        "Small traditional boats on the beach",
        "Authentic local character with moderate tourism",
        "Straightforward access",
        "Cove-like beach sheltered by cliffs",
        "Beach bars, restaurants, lifeguards and small artisanal fishing area"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Olhos d’Água",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/olhos-dagua/",
      "facts_verified": [
        "Official Olhos d’Água beach entry",
        "Coastal beach classification",
        "Municipality of Albufeira",
        "Coordinates",
        "Beach code PTCV9U",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at the time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Olhos d’Água listed among Albufeira’s 2026 Blue Flag locations",
        "Albufeira listed with 25 awarded 2026 locations"
      ]
    },
    {
      "source_name": "Câmara Municipal de Albufeira - Olhos de Água",
      "source_url": "https://www.cm-albufeira.pt/praias/olhos-de-agua",
      "facts_verified": [
        "Municipal beach page for Olhos de Água",
        "Coastal bathing water in an urban beach setting",
        "Intensive use and strong demand",
        "Consolidated urban surroundings"
      ]
    },
    {
      "source_name": "Câmara Municipal de Albufeira - Tabela Praias Acessíveis 2025",
      "source_url": "https://www.cm-albufeira.pt/sites/default/files/inline-files/Tabela%20Praias%20Acess%C3%ADveis_2025.pdf",
      "facts_verified": [
        "Olhos de Água included in Albufeira’s 2025 accessible-beach table",
        "Accessible-beach recognition treated as requiring current seasonal confirmation"
      ]
    },
    {
      "source_name": "Visit Albufeira - Olhos de Água Viewpoint",
      "source_url": "https://visitalbufeira.pt/visita/miradouro-de-olhos-de-agua/",
      "facts_verified": [
        "Nearby viewpoint in Olhos de Água",
        "Views over eastern Albufeira coastline",
        "Beach, cliffs and traditional village houses visible from the viewpoint"
      ]
    },
    {
      "source_name": "Visit Albufeira - Torre da Medronheira",
      "source_url": "https://visitalbufeira.pt/visita/torre-da-medronheira/",
      "facts_verified": [
        "Nearby historic coastal watchtower",
        "16th-century origin",
        "Elevated cliffside position in Olhos de Água",
        "Historic coastal surveillance and defence purpose"
      ]
    },
    {
      "source_name": "Visit Albufeira - Mercado de Olhos de Água",
      "source_url": "https://visitalbufeira.pt/visita/mercado-de-olhos-de-agua/",
      "facts_verified": [
        "Nearby local market",
        "Fresh products, food items and traditional goods"
      ]
    },
    {
      "source_name": "Visit Albufeira - Praia Maria Luísa",
      "source_url": "https://visitalbufeira.pt/praia/praia-maria-luisa",
      "facts_verified": [
        "Nearby Maria Luísa Beach",
        "Golden cliff and Mediterranean vegetation setting"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia dos Olhos d’Água",
      "source_url": "https://visitalgarve.pt/equipamento/8824/praia-dos-olhos-dgua",
      "facts_verified": [
        "Regional tourism listing for Praia dos Olhos d’Água",
        "Fishing-village setting",
        "Fishing boats on the sand",
        "Freshwater springs known locally as olhos d’água or olheiros"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, fishing-village origin, freshwater springs, cliff setting, resort-village character, facilities, coordinates and 2026 Blue Flag season were verified from official tourism, municipal and ABAAE sources.",
    "The phrase “popular village/resort beach” is supported cautiously by the verified urban beach setting, intensive-use municipal description, strong demand and developed village-resort surroundings.",
    "ABAAE verifies the 2026 bathing season for Olhos d’Água as 15 May 2026 to 15 October 2026 and the 2026 Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is supported by VisitPortugal and Albufeira’s 2025 accessible-beach material, but current seasonal support should be manually confirmed before publication.",
    "The Câmara Municipal de Albufeira page returned a temporary fetch error when opened, so municipal facts are used cautiously from the official search-result summary and supported by other official sources where possible.",
    "Walking route suggestions are geographically sensible but not verified as official signed trails, so they are marked Not verified.",
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
