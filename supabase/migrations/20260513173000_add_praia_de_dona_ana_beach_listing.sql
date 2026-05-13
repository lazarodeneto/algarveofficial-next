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
  'Historic western Algarve city close to Costa d''Oiro beaches, Praia de Dona Ana and Ponta da Piedade.',
  37.091377,
  -8.669423,
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
  v_slug text := 'praia-dona-ana-lagos';
  v_name text := 'Praia de Dona Ana';
  v_short_description text := $short$
Praia de Dona Ana is a famous cliff-framed beach in Lagos, recognised as one of the Algarve's classic postcard coastal scenes for its sculpted rocks, clear water, and proximity to the city.
$short$;
  v_description text := $description$
Praia de Dona Ana sits on the Costa d'Oiro side of Lagos, between the historic city and the Ponta da Piedade headland. Sheltered between rocky cliffs, it is one of the Algarve images most associated with Lagos: golden rock formations, small offshore stacks, blue-green water, and a sandy cove reached from above by stairs.

VisitPortugal describes Praia de Dona Ana as a maritime beach and one of the Algarve's high-profile coastal landmarks, while Lagos Municipality places it among the Costa d'Oiro beaches, a stretch named for the colour of the rocks between Praia da Batata and Ponta da Piedade. The beach is close enough to Lagos to be reached on foot by many visitors, but its staircase access means it should not be treated as an easy flat-access beach.

Visitors can expect a scenic but popular setting, especially in high season. The rocks and cliffs give the beach much of its character, but they also require caution: stay away from cliff edges, avoid lingering directly below unstable rock faces, and follow local signage. Municipal access rules also apply to Dona Ana and Camilo during the bathing season, particularly for visitors carrying bulky nautical-sports equipment through the stairs.

For a fuller Lagos coastal itinerary, combine Dona Ana with Praia do Pinhao, Praia do Camilo, the Ponta da Piedade boardwalks, or the historic centre of Lagos.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Dona Ana",
  "slug": "praia-dona-ana-lagos",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Lagos",
  "concelho": "Lagos",
  "municipality": "Lagos",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Dona Ana is a famous cliff-framed beach in Lagos, recognised as one of the Algarve's classic postcard coastal scenes for its sculpted rocks, clear water, and proximity to the city.",
  "full_description": "Praia de Dona Ana sits on the Costa d'Oiro side of Lagos, between the historic city and the Ponta da Piedade headland. Sheltered between rocky cliffs, it is one of the Algarve images most associated with Lagos: golden rock formations, small offshore stacks, blue-green water, and a sandy cove reached from above by stairs.\n\nVisitPortugal describes Praia de Dona Ana as a maritime beach and one of the Algarve's high-profile coastal landmarks, while Lagos Municipality places it among the Costa d'Oiro beaches, a stretch named for the colour of the rocks between Praia da Batata and Ponta da Piedade. The beach is close enough to Lagos to be reached on foot by many visitors, but its staircase access means it should not be treated as an easy flat-access beach.\n\nVisitors can expect a scenic but popular setting, especially in high season. The rocks and cliffs give the beach much of its character, but they also require caution: stay away from cliff edges, avoid lingering directly below unstable rock faces, and follow local signage. Municipal access rules also apply to Dona Ana and Camilo during the bathing season, particularly for visitors carrying bulky nautical-sports equipment through the stairs.\n\nFor a fuller Lagos coastal itinerary, combine Dona Ana with Praia do Pinhao, Praia do Camilo, the Ponta da Piedade boardwalks, or the historic centre of Lagos.",
  "coordinates": {
    "latitude": 37.091377,
    "longitude": -8.669423,
    "notes": "Coordinates were taken from the VisitPortugal map URL. Manual GIS confirmation is recommended before final map publication."
  },
  "beach_type": "Maritime beach / cliff-framed sandy cove",
  "landscape": "Sandy cove sheltered between rocky cliffs, with sculpted limestone formations, offshore rocks, clear blue-green water, and the golden Costa d'Oiro coastal character associated with Lagos.",
  "access": "Access to the sand is via a staircase. VisitPortugal notes that Praia de Dona Ana is close to Lagos and can be reached by an approximate 25-minute walk. Lagos Municipality confirms staircase access and municipal regulation of the access to Dona Ana and Camilo, particularly for bulky nautical-sports equipment during the bathing season.",
  "highlights": [
    "Famous Lagos postcard beach framed by golden Costa d'Oiro cliffs.",
    "Sculpted rock formations rising from the sand and sea.",
    "Officially listed by VisitPortugal as a maritime beach in Lagos.",
    "Close to Lagos city centre, with VisitPortugal noting an approximate 25-minute walk.",
    "Near the Ponta da Piedade boardwalks and Costa d'Oiro viewpoints.",
    "Good photography potential from the cliff-top approach, beach level, and nearby walking routes."
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Couples",
    "Families comfortable with stairs",
    "Swimming when conditions allow",
    "Coastal walks",
    "Nature lovers",
    "Lagos city break visitors"
  ],
  "facilities": [
    { "name": "Security or surveillance listed by VisitPortugal", "status": "Seasonal" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified" },
    { "name": "Outdoor parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified" },
    { "name": "Restaurant", "status": "Verified" },
    { "name": "Public toilets", "status": "Not verified" },
    { "name": "Step-free beach access", "status": "Not verified" }
  ],
  "includes": [
    "Showers",
    "Outdoor parking",
    "Bar",
    "Restaurant",
    "Seasonal surveillance listed by VisitPortugal",
    "Seasonal sunshade rental"
  ],
  "important_information": {
    "best_time_to_visit": "Spring, early summer, and early autumn are good for combining Praia de Dona Ana with Lagos walks and Ponta da Piedade viewpoints. In July and August, early morning or later afternoon is usually more comfortable for arrival and photography, but sea conditions and local signage should always take priority.",
    "know_before_you_go": "Praia de Dona Ana is reached by stairs, so access may be challenging for visitors with reduced mobility, pushchairs, or heavy beach equipment.\nLagos Municipality states that the access to Dona Ana and Camilo is regulated to improve safety on the stairways.\nDuring the bathing season, between 09:00 and 19:00, municipal rules prohibit access through the stairs for people carrying boards, nautical-sports craft, or scuba-diving equipment, and restrict placing equipment for surf, SUP, windsurf, kitesurf, kayak, or canoe activity on the sand.\nFacilities and surveillance may be seasonal; verify current conditions before visiting.\nSea conditions can vary, even at sheltered beaches. Visitors should check local signage before entering the water.\nKeep a safe distance from cliff edges, cliff bases, and rock formations, especially when taking photographs.\nThe beach is popular and can feel busy during peak summer periods."
  },
  "important_notes": "Praia de Dona Ana is reached by stairs, so access may be challenging for visitors with reduced mobility, pushchairs, or heavy beach equipment.\nLagos Municipality states that the access to Dona Ana and Camilo is regulated to improve safety on the stairways.\nDuring the bathing season, between 09:00 and 19:00, municipal rules prohibit access through the stairs for people carrying boards, nautical-sports craft, or scuba-diving equipment, and restrict placing equipment for surf, SUP, windsurf, kitesurf, kayak, or canoe activity on the sand.\nFacilities and surveillance may be seasonal; verify current conditions before visiting.\nSea conditions can vary, even at sheltered beaches. Visitors should check local signage before entering the water.\nKeep a safe distance from cliff edges, cliff bases, and rock formations, especially when taking photographs.\nThe beach is popular and can feel busy during peak summer periods.",
  "best_time_to_visit": "Spring, early summer, and early autumn are good for combining Praia de Dona Ana with Lagos walks and Ponta da Piedade viewpoints. In July and August, early morning or later afternoon is usually more comfortable for arrival and photography, but sea conditions and local signage should always take priority.",
  "suitable_for": [
    "Photographers",
    "Couples",
    "Families who can manage stairs",
    "Visitors staying in Lagos",
    "Coastal walkers",
    "Visitors exploring the Costa d'Oiro and Ponta da Piedade area"
  ],
  "not_suitable_for": [
    "Visitors requiring verified step-free beach access",
    "Visitors unable to manage stairs",
    "Large nautical-sports equipment during restricted bathing-season access times",
    "Anyone seeking a quiet beach during peak summer periods",
    "Unsupervised children near cliffs, rocks, or stair access"
  ],
  "nearby_attractions": [
    {
      "name": "Ponta da Piedade",
      "type": "Headland / viewpoint / coastal formation",
      "description": "A landmark Lagos headland with dramatic rock formations, grottoes, boat-trip scenery, and a boardwalk route with viewpoints.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Camilo",
      "type": "Beach",
      "description": "A small nearby cliff beach on the Ponta da Piedade side of Lagos, known for rock formations and staircase access.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Pinhao",
      "type": "Beach",
      "description": "A small rocky bay between Lagos and Ponta da Piedade, connected by a cliff-top footpath from Praia de Dona Ana according to Lagos Municipality.",
      "verification_status": "Verified"
    },
    {
      "name": "Lagos Historic Centre",
      "type": "Historic centre",
      "description": "The historic centre of Lagos is within walking distance for many visitors and offers streets, churches, museums, and city attractions before or after a beach visit.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Batata",
      "type": "Beach",
      "description": "A city-side Lagos beach near the Forte da Ponta da Bandeira and the historic centre, useful as part of a coastal route towards Dona Ana.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Lagos",
    "Praia da Luz"
  ],
  "walking_trails_nearby": [
    {
      "name": "Ponta da Piedade Boardwalks / Costa d'Oiro cliff route",
      "description": "A coastal boardwalk and viewpoint route around Ponta da Piedade, with municipal photo-library information noting viewpoints between Praia do Pinhao and Praia do Canavial, passing Praia D. Ana and the Ponta da Piedade lighthouse.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Dona Ana to Praia do Pinhao cliff-top path",
      "description": "Lagos Municipality states that Praia do Pinhao can be reached by a pedestrian trail starting at Praia D. Ana and following the top of the cliff.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Travel light because the beach is reached by stairs.",
    "Check the current municipal access rules if carrying surfboards, SUPs, kayaks, canoes, scuba equipment, or other bulky nautical-sports items.",
    "Arrive early in peak season if relying on parking or wanting quieter photographs.",
    "Use the cliff-top viewpoints and nearby boardwalks for wider coastal views, but stay behind barriers and away from cliff edges.",
    "Combine Dona Ana with Praia do Pinhao, Praia do Camilo, Ponta da Piedade, or Lagos historic centre for a stronger half-day itinerary.",
    "Verify seasonal operation of bar, restaurant, sunshade rental, and surveillance before planning a full beach day."
  ],
  "photography_notes": "Praia de Dona Ana is especially photogenic because of its layered cliffs, carved rock formations, clear-water colour, and elevated approach. The strongest compositions are often from the stairs and cliff-top viewpoints as well as from the sand. Do not climb unstable rocks, cross barriers, or stand beneath cliff faces for photographs.",
  "family_notes": "Families can enjoy Praia de Dona Ana, but the stairs, rocks, seasonal crowds, and natural sea conditions mean close supervision is important. It is better suited to families comfortable with cliff-beach access than to those needing easy step-free beach logistics.",
  "safety_notes": "Sea conditions can vary, and visitors should follow local signage and any seasonal surveillance instructions. Keep away from cliff edges and cliff bases, take care on the stairs, and respect the municipal restrictions on bulky nautical-sports equipment during the bathing season.",
  "accessibility_notes": "Accessibility information is not fully verified. Official and municipal sources confirm staircase access, and no verified step-free access to the sand was found in the sources checked. Visitors with reduced mobility should confirm current access conditions before visiting.",
  "seo": {
    "meta_title": "Praia de Dona Ana, Lagos | Algarve Beach Guide",
    "meta_description": "Explore Praia de Dona Ana in Lagos, a famous Algarve postcard beach with cliffs, rock formations, stairs and nearby Ponta da Piedade walks.",
    "keywords": [
      "Praia de Dona Ana",
      "Praia Dona Ana",
      "Dona Ana beach",
      "Lagos beach",
      "Lagos Algarve",
      "Algarve beaches",
      "Portugal beaches",
      "Costa d'Oiro",
      "Ponta da Piedade",
      "cliff beach Algarve",
      "Lagos postcard beach"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de Dona Ana trip ideas",
      "links": [
        { "label": "Praia de Dona Ana" },
        { "label": "Dona Ana beach" },
        { "label": "Lagos beach guide" },
        { "label": "Costa d'Oiro beaches" },
        { "label": "Ponta da Piedade walks" },
        { "label": "Algarve postcard beaches" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Ponta da Piedade" },
        { "label": "Praia do Camilo" },
        { "label": "Praia do Pinhao" },
        { "label": "Lagos Historic Centre" },
        { "label": "Praia da Batata" },
        { "label": "Praia da Luz" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Dona Ana",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/1DA0DBAD-63C6-4C88-824E-67A73820C647",
      "facts_verified": [
        "Official VisitPortugal beach listing.",
        "Beach name: Praia de Dona Ana.",
        "Beach category: maritime beach.",
        "Place: Lagos.",
        "Sheltered cliff setting and rock formations.",
        "High-profile Algarve landmark context.",
        "Approximate 25-minute walk from Lagos.",
        "Listed services: security or surveillance, sunshade rental, showers, outdoor parking, bar, and restaurant."
      ]
    },
    {
      "source_name": "VisitPortugal - Praia de Dona Ana map",
      "source_url": "https://www.visitportugal.com/en/mapas?lat=37.091377&loc=103&lon=-8.669423&processed=0&reg=93",
      "facts_verified": [
        "Latitude verified as 37.091377.",
        "Longitude verified as -8.669423."
      ]
    },
    {
      "source_name": "Camara Municipal de Lagos - Praias",
      "source_url": "https://www.cm-lagos.pt/descobrir-lagos/visitar/praias",
      "facts_verified": [
        "Municipal beach listing for Praia da Dona Ana.",
        "Costa d'Oiro context between Praia da Batata and Ponta da Piedade.",
        "Beach positioned among rocky cliffs with clean sands and blue-green water.",
        "Access to Praia da Dona Ana by staircase.",
        "Nearby Praia do Pinhao footpath from Praia D. Ana along the cliff top.",
        "Nearby Praia do Camilo and Ponta da Piedade context."
      ]
    },
    {
      "source_name": "Camara Municipal de Lagos - Access to Dona Ana and Camilo beaches regulated",
      "source_url": "https://www.cm-lagos.pt/municipio/noticias/12752-acesso-as-praias-dona-ana-e-camilo-passou-a-estar-regulamentado",
      "facts_verified": [
        "Municipal regulation entered into force on 16 August 2024.",
        "Regulation aims to improve safety on the stairways to Dona Ana and Camilo.",
        "Access concerns relate to sinuous stairways and bulky nautical-sports equipment.",
        "Restrictions during the bathing season between 09:00 and 19:00 for boards, nautical-sports craft, scuba equipment, and placement of equipment for surf, SUP, windsurf, kitesurf, kayak, or canoe activity."
      ]
    },
    {
      "source_name": "Fototeca Municipal de Lagos - Passadicos Ponta Piedade",
      "source_url": "https://fototeca.cm-lagos.pt/praias-e-costa/passadicos-ponta-piedade",
      "facts_verified": [
        "Ponta da Piedade boardwalks and viewpoint route.",
        "Route includes viewpoints between Praia do Pinhao and Praia do Canavial.",
        "Route passes Praia D. Ana and the Farol da Ponta da Piedade.",
        "Coastal scenery includes caves, tunnels, and rock formations."
      ]
    },
    {
      "source_name": "Fototeca Municipal de Lagos - Ponta da Piedade",
      "source_url": "https://fototeca.cm-lagos.pt/praias-e-costa/ponta-da-piedade-8",
      "facts_verified": [
        "Ponta da Piedade has boat-trip access to small coves, caves, and sea-carved formations.",
        "Ponta da Piedade also has a boardwalk circuit with views over the sea and rock formations."
      ]
    },
    {
      "source_name": "VisitPortugal - Lagos",
      "source_url": "https://www.visitportugal.com/en/destinos/algarve/73799",
      "facts_verified": [
        "Dona Ana included among the beaches accessible from Lagos city centre.",
        "Ponta da Piedade identified as a major regional highlight with rock formations, jagged shapes, and caves.",
        "Tourist mini-train and bus-route context for Lagos beaches."
      ]
    }
  ],
  "verification_notes": [
    "Official sources use variants including Praia de Dona Ana, Praia da Dona Ana, and Praia D. Ana. The listing title uses VisitPortugal's official form: Praia de Dona Ana.",
    "Beach name, municipality, maritime-beach category, landscape, staircase access, facilities listed by VisitPortugal, nearby walking context, municipal access restrictions, and coordinates were verified from official or municipal sources.",
    "The user-provided description of a famous Lagos postcard beach is supported by VisitPortugal's description of Dona Ana as one of the Algarve's high-profile coastal landmarks and by the municipal description of its distinctive cliff-and-water landscape.",
    "Coordinates were taken from the VisitPortugal map URL. Manual GIS confirmation is recommended before final map publication.",
    "Security or surveillance is listed by VisitPortugal, but exact lifeguard dates were not verified. Treat this as seasonal and confirm for the relevant bathing season.",
    "Current Blue Flag status, public toilets, dog rules, exact parking capacity, and verified step-free beach access were not confirmed from the sources checked.",
    "Some information could not be verified from authoritative sources. I have left those fields blank or marked them as Not verified.",
    "Listing structure and quality-control approach follow the uploaded BEACH GPT brief."
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
      'https://www.visitportugal.com/en/NR/exeres/1DA0DBAD-63C6-4C88-824E-67A73820C647',
      'Praia de Dona Ana, Lagos, Algarve, Portugal',
      37.091377,
      -8.669423,
      array[
        'Praia de Dona Ana',
        'Praia Dona Ana',
        'Dona Ana beach',
        'Lagos beach',
        'Lagos Algarve',
        'Costa d''Oiro',
        'Ponta da Piedade',
        'cliff beach Algarve',
        'Lagos postcard beach',
        'Portugal beaches'
      ],
      v_category_data,
      'Praia de Dona Ana, Lagos | Algarve Beach Guide',
      'Explore Praia de Dona Ana in Lagos, a famous Algarve postcard beach with cliffs, rock formations, stairs and nearby Ponta da Piedade walks.',
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
      website_url = 'https://www.visitportugal.com/en/NR/exeres/1DA0DBAD-63C6-4C88-824E-67A73820C647',
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
      latitude = 37.091377,
      longitude = -8.669423,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia de Dona Ana',
        'Praia Dona Ana',
        'Dona Ana beach',
        'Lagos beach',
        'Lagos Algarve',
        'Costa d''Oiro',
        'Ponta da Piedade',
        'cliff beach Algarve',
        'Lagos postcard beach',
        'Portugal beaches'
      ],
      category_data = v_category_data,
      meta_title = 'Praia de Dona Ana, Lagos | Algarve Beach Guide',
      meta_description = 'Explore Praia de Dona Ana in Lagos, a famous Algarve postcard beach with cliffs, rock formations, stairs and nearby Ponta da Piedade walks.',
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
