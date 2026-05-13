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
  'Caramujeira / Lagoa',
  'caramujeira-lagoa',
  'Lagoa coastal area around Caramujeira, Praia da Marinha and the central Algarve cliff coastline.',
  37.090038,
  -8.412492,
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
  v_slug text := 'praia-da-marinha-lagoa';
  v_name text := 'Praia da Marinha';
  v_short_description text := $short$
Praia da Marinha is an iconic cliff-framed beach in Lagoa, widely recognised for its limestone formations, clear coastal scenery and role as one of the Algarve's signature images. It is also one of the key points on the Seven Hanging Valleys Trail.
$short$;
  v_description text := $description$
Praia da Marinha is one of the Algarve's most recognisable coastal images, set in the municipality of Lagoa near Caramujeira. The beach is framed by high limestone cliffs shaped by erosion, with natural arches, sea stacks and viewpoints that have made this stretch of coast a defining visual symbol of the region.

Before reaching the sand, visitors look down from the cliff-top area across a dramatic natural amphitheatre of golden rock and blue-green water. Access to the beach involves a long staircase, so the experience is best suited to visitors comfortable with steps and cliff-side surroundings. Once below, the beach feels more intimate than its international reputation suggests, with a sandy cove enclosed by cliffs and rock formations.

Marinha is also closely linked with the Seven Hanging Valleys Trail, one of Lagoa's most important coastal walks. The official municipal route connects Praia de Vale Centeanes to Praia da Marinha over 5.7 km, following a near-continuous line of cliffs, ravines and hanging valleys. For many visitors, the beach works best as part of a wider Lagoa coastline itinerary, combining cliff views, walking, photography and nearby natural landmarks such as Benagil and Albandeira.

Because Praia da Marinha is internationally recognised and visually iconic, it can become busy in high season, particularly around the car park, viewpoint and beach access. Visitors should keep well away from cliff edges and cliff bases, follow signage, and treat sea conditions with caution.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Marinha",
  "slug": "praia-da-marinha-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Caramujeira / Lagoa",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Marinha is an iconic cliff-framed beach in Lagoa, widely recognised for its limestone formations, clear coastal scenery and role as one of the Algarve's signature images. It is also one of the key points on the Seven Hanging Valleys Trail.",
  "full_description": "Praia da Marinha is one of the Algarve's most recognisable coastal images, set in the municipality of Lagoa near Caramujeira. The beach is framed by high limestone cliffs shaped by erosion, with natural arches, sea stacks and viewpoints that have made this stretch of coast a defining visual symbol of the region.\n\nBefore reaching the sand, visitors look down from the cliff-top area across a dramatic natural amphitheatre of golden rock and blue-green water. Access to the beach involves a long staircase, so the experience is best suited to visitors comfortable with steps and cliff-side surroundings. Once below, the beach feels more intimate than its international reputation suggests, with a sandy cove enclosed by cliffs and rock formations.\n\nMarinha is also closely linked with the Seven Hanging Valleys Trail, one of Lagoa's most important coastal walks. The official municipal route connects Praia de Vale Centeanes to Praia da Marinha over 5.7 km, following a near-continuous line of cliffs, ravines and hanging valleys. For many visitors, the beach works best as part of a wider Lagoa coastline itinerary, combining cliff views, walking, photography and nearby natural landmarks such as Benagil and Albandeira.\n\nBecause Praia da Marinha is internationally recognised and visually iconic, it can become busy in high season, particularly around the car park, viewpoint and beach access. Visitors should keep well away from cliff edges and cliff bases, follow signage, and treat sea conditions with caution.",
  "coordinates": {
    "latitude": 37.090038,
    "longitude": -8.412492,
    "notes": "Map coordinates are retained from the existing verified Praia da Marinha listing data so the beach detail map remains available. The latest supplied research package did not add a new authoritative coordinate source."
  },
  "beach_type": "Small sandy maritime beach below limestone cliffs",
  "landscape": "A sheltered sandy cove framed by high eroded limestone cliffs, sea stacks, arches and blue-green coastal water.",
  "access": "Access is from the cliff-top area by a long staircase. This may be challenging for visitors with reduced mobility, pushchairs or heavy beach equipment.",
  "highlights": [
    "Iconic Algarve cliff beach in the municipality of Lagoa",
    "High limestone cliffs, natural arches and sea stacks",
    "Recognised internationally as one of the Algarve's signature coastal images",
    "Cliff-top viewpoints before descending to the sand",
    "Long staircase access from the cliff-top area",
    "Eastern endpoint of the Seven Hanging Valleys Trail"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Couples",
    "Nature lovers",
    "Coastal walks",
    "Seven Hanging Valleys Trail",
    "Snorkelling when conditions are suitable",
    "Iconic Algarve scenery"
  ],
  "facilities": [
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Seasonal" },
    { "name": "Restaurant", "status": "Seasonal" },
    { "name": "Blue Flag status", "status": "Not verified" }
  ],
  "includes": [
    "Seasonal safety or surveillance listed by official tourism source",
    "Seasonal sunshade rental",
    "Seasonal light boat rental",
    "Showers",
    "Car parking",
    "Seasonal bar",
    "Seasonal restaurant"
  ],
  "important_information": {
    "best_time_to_visit": "Spring, early summer and early autumn are ideal for walking and photography. In July and August, arrive early or later in the day to reduce crowding around the car park, viewpoints and stairs.",
    "know_before_you_go": "Access to the beach involves a long staircase from the cliff-top area.\nThe beach is backed by high cliffs; visitors should avoid cliff edges and keep away from cliff bases.\nPraia da Marinha is highly recognised and can become busy during peak summer.\nFacilities and surveillance may be seasonal and should be verified before visiting.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nThe Seven Hanging Valleys Trail runs along cliff-top terrain, so suitable footwear and caution are recommended.\nNo current official Blue Flag listing for Praia da Marinha was verified during this research.",
    "notes": [
      "Access to the beach involves a long staircase from the cliff-top area.",
      "The beach is backed by high cliffs; visitors should avoid cliff edges and keep away from cliff bases.",
      "Praia da Marinha is highly recognised and can become busy during peak summer.",
      "Facilities and surveillance may be seasonal and should be verified before visiting.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "The Seven Hanging Valleys Trail runs along cliff-top terrain, so suitable footwear and caution are recommended.",
      "No current official Blue Flag listing for Praia da Marinha was verified during this research."
    ]
  },
  "important_notes": "Access to the beach involves a long staircase from the cliff-top area.\nThe beach is backed by high cliffs; visitors should avoid cliff edges and keep away from cliff bases.\nPraia da Marinha is highly recognised and can become busy during peak summer.\nFacilities and surveillance may be seasonal and should be verified before visiting.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nThe Seven Hanging Valleys Trail runs along cliff-top terrain, so suitable footwear and caution are recommended.\nNo current official Blue Flag listing for Praia da Marinha was verified during this research.",
  "best_time_to_visit": "Spring, early summer and early autumn are ideal for walking and photography. In July and August, arrive early or later in the day to reduce crowding around the car park, viewpoints and stairs.",
  "suitable_for": [
    "Photographers",
    "Couples",
    "Visitors exploring Lagoa's cliff coast",
    "Hikers on the Seven Hanging Valleys Trail",
    "Nature-focused travellers",
    "Confident beachgoers comfortable with stair access"
  ],
  "not_suitable_for": [
    "Visitors requiring step-free beach access",
    "Visitors with limited mobility unless current access conditions are checked in advance",
    "Those carrying heavy beach equipment",
    "Visitors seeking a large resort beach with extensive space",
    "Anyone uncomfortable with cliff environments"
  ],
  "nearby_attractions": [
    {
      "name": "Seven Hanging Valleys Trail",
      "type": "Walking trail",
      "description": "A 5.7 km official nature trail linking Praia de Vale Centeanes and Praia da Marinha along Lagoa's cliff coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Benagil",
      "type": "Nearby beach and coastal village",
      "description": "A small fishing-beach setting in one of the Algarve's best-known cliff and cave areas, close to Praia da Marinha.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Albandeira",
      "type": "Nearby beach",
      "description": "A small cliff-framed beach near Benagil and Lagoa, known for distinctive rock formations.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Vale de Centeanes",
      "type": "Nearby beach and trail endpoint",
      "description": "A cliff-backed beach near Carvoeiro and the western endpoint of the Seven Hanging Valleys Trail.",
      "verification_status": "Verified"
    },
    {
      "name": "Carvoeiro",
      "type": "Nearby coastal town",
      "description": "A well-known Lagoa coastal town useful for dining, services and wider exploration of the municipality.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Caramujeira",
    "Benagil",
    "Carvoeiro",
    "Lagoa",
    "Porches",
    "Armação de Pêra"
  ],
  "walking_trails_nearby": [
    {
      "name": "Seven Hanging Valleys Trail",
      "description": "Officially listed by Câmara Municipal de Lagoa as a 5.7 km nature trail connecting Praia de Vale Centeanes to Praia da Marinha along a cliff line shaped by hanging valleys, ravines and limestone formations.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in peak season to avoid the busiest times at the car park, viewpoint and staircase.",
    "Wear suitable footwear if combining the beach with the Seven Hanging Valleys Trail.",
    "Carry water and sun protection, especially on the exposed cliff-top route.",
    "Use the official paths and avoid informal cliff-edge shortcuts.",
    "For photography, early morning and late afternoon usually offer softer light on the limestone cliffs.",
    "Check sea conditions and local signage before swimming or snorkelling."
  ],
  "photography_notes": "Praia da Marinha is one of the Algarve's most photographed coastal scenes. The cliff-top viewpoint is especially useful for wide shots of the beach, sea stacks and limestone formations, while the sand offers closer perspectives of the cliffs and rock shapes. Visitors should never step beyond protected or safe areas for photographs.",
  "family_notes": "Families can enjoy the scenery and beach when conditions are suitable, but the long staircase, cliffs and summer crowding require planning. Families with small children should take extra care on the steps, near rock formations and close to the waterline.",
  "safety_notes": "Keep away from cliff edges and cliff bases due to potential rockfall risk. Sea conditions can vary, and visitors should follow local beach flags, official signage and safety instructions. The Seven Hanging Valleys Trail includes exposed cliff-top sections.",
  "accessibility_notes": "Praia da Marinha is not verified as step-free. Official tourism information describes access by a long staircase, so visitors with reduced mobility should confirm current conditions before visiting.",
  "seo": {
    "meta_title": "Praia da Marinha, Lagoa | Algarve Beach Guide",
    "meta_description": "Praia da Marinha in Lagoa is an iconic Algarve beach with limestone cliffs, sea stacks and access to the Seven Hanging Valleys Trail.",
    "keywords": [
      "Praia da Marinha",
      "Praia da Marinha Lagoa",
      "Marinha Beach",
      "Lagoa beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Seven Hanging Valleys Trail",
      "Sete Vales Suspensos",
      "cliff beaches Algarve",
      "Benagil nearby beaches",
      "Carvoeiro beaches"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia da Marinha trip ideas",
      "links": [
        { "label": "Praia da Marinha" },
        { "label": "Marinha Beach" },
        { "label": "Lagoa beaches" },
        { "label": "Seven Hanging Valleys Trail" },
        { "label": "Sete Vales Suspensos" },
        { "label": "cliff beaches Algarve" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Praia de Benagil" },
        { "label": "Praia de Albandeira" },
        { "label": "Praia do Vale de Centeanes" },
        { "label": "Carvoeiro" },
        { "label": "Porches" },
        { "label": "Armação de Pêra" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Marinha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-marinha",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location at Caramujeira, Lagoa",
        "High eroded cliff setting",
        "Cliff-top viewpoint",
        "Long staircase access",
        "Facilities listed including surveillance, sunshade rental, light boat rental, showers, parking, bar and restaurant"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Sete Vales Suspensos",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/sete-vales-suspensos",
      "facts_verified": [
        "Seven Hanging Valleys Trail name",
        "Official municipal trail",
        "5.7 km distance",
        "Route connecting Praia de Vale Centeanes to Praia da Marinha",
        "Cliff-line landscape and hanging valleys",
        "Geomorphological and landscape relevance"
      ]
    },
    {
      "source_name": "Visit Algarve - Seven Hanging Valleys Trail",
      "source_url": "https://visitalgarve.pt/en/3593/percurso-dos-sete-vales-suspensos.aspx",
      "facts_verified": [
        "Trail relevance to the Algarve",
        "Hanging valleys landscape context",
        "Coastal walking association with Praia da Marinha"
      ]
    },
    {
      "source_name": "Welcome to Lagoa - Marinha Beach",
      "source_url": "https://welcometolagoa.pt/en/434/marinha-beach--natural-beach",
      "facts_verified": [
        "Municipal tourism page for Marinha Beach",
        "Recognition of Praia da Marinha as an iconic Lagoa beach",
        "Golden Flag and international recognition references"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Praias do concelho de Lagoa na lista das melhores do mundo",
      "source_url": "https://www.cm-lagoa.pt/viver/seguranca-e-protecao-civil/policia-municipal/noticia/praias-do-concelho-de-lagoa-na-lista-das-melhores-do-mundo",
      "facts_verified": [
        "Recent municipal recognition of Praia da Marinha in international beach coverage",
        "Historic recognition including Praia Dourada by the Portuguese Ministry of Environment in 1998",
        "Municipality context for Lagoa coastline"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia de Benagil",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-benagil",
      "facts_verified": [
        "Nearby Benagil beach",
        "Lagoa location",
        "Cliff and cave landscape context"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia de Albandeira",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/23553692-F8A3-46D0-9D03-435E520875F1",
      "facts_verified": [
        "Nearby Albandeira beach",
        "Lagoa location",
        "Small cliff-framed beach character"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia do Vale de Centeanes",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-vale-de-centeanes",
      "facts_verified": [
        "Praia de Vale Centeanes as a nearby Lagoa beach",
        "Cliff-backed landscape",
        "Trail endpoint relevance"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "2026 Blue Flag entries for Lagoa checked",
        "Praia da Marinha not found among the listed 2026 Lagoa Blue Flag beaches during verification"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, cliff landscape, staircase access, facilities and international recognition were verified from official tourism and municipal sources.",
    "The Seven Hanging Valleys Trail connection was verified from Câmara Municipal de Lagoa as a 5.7 km route linking Praia de Vale Centeanes to Praia da Marinha.",
    "The latest research package did not include a new authoritative coordinate source. Existing verified map coordinates from the current Praia da Marinha listing were retained for frontend map continuity.",
    "Blue Flag status was not included as verified. The 2026 ABAAE list checked did not show Praia da Marinha among Lagoa's listed Blue Flag beaches.",
    "Facilities are included only where listed by VisitPortugal and are marked Seasonal where operation may depend on the bathing season or concessions.",
    "Accessibility is not verified as step-free; official tourism information describes a long staircase.",
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
  where slug = 'caramujeira-lagoa'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city caramujeira-lagoa was not found';
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
      'https://www.visitportugal.com/pt-pt/content/praia-da-marinha',
      'Praia da Marinha, Caramujeira, Lagoa, Algarve, Portugal',
      37.090038,
      -8.412492,
      array[
        'Praia da Marinha',
        'Praia da Marinha Lagoa',
        'Marinha Beach',
        'Lagoa beaches',
        'Algarve beaches',
        'Portugal beaches',
        'Seven Hanging Valleys Trail',
        'Sete Vales Suspensos',
        'cliff beaches Algarve',
        'Carvoeiro beaches'
      ],
      v_category_data,
      'Praia da Marinha, Lagoa | Algarve Beach Guide',
      'Praia da Marinha in Lagoa is an iconic Algarve beach with limestone cliffs, sea stacks and access to the Seven Hanging Valleys Trail.',
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
      website_url = 'https://www.visitportugal.com/pt-pt/content/praia-da-marinha',
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
      address = 'Praia da Marinha, Caramujeira, Lagoa, Algarve, Portugal',
      latitude = 37.090038,
      longitude = -8.412492,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia da Marinha',
        'Praia da Marinha Lagoa',
        'Marinha Beach',
        'Lagoa beaches',
        'Algarve beaches',
        'Portugal beaches',
        'Seven Hanging Valleys Trail',
        'Sete Vales Suspensos',
        'cliff beaches Algarve',
        'Carvoeiro beaches'
      ],
      category_data = v_category_data,
      meta_title = 'Praia da Marinha, Lagoa | Algarve Beach Guide',
      meta_description = 'Praia da Marinha in Lagoa is an iconic Algarve beach with limestone cliffs, sea stacks and access to the Seven Hanging Valleys Trail.',
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
