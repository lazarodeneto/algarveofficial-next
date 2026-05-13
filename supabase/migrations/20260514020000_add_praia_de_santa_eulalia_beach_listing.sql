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
  'Central Algarve resort city with historic centre beaches and eastern resort beaches including Santa Eulália.',
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
  v_slug text := 'praia-de-santa-eulalia-albufeira';
  v_name text := 'Praia de Santa Eulália';
  v_address text := 'Praia de Santa Eulália, Santa Eulália / Albufeira, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/en/NR/exeres/41D48896-9E0D-4B2E-B572-76CDE0A3EE1C';
  v_latitude numeric := 37.087917;
  v_longitude numeric := -8.214625;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Santa Eulália",
  "slug": "praia-de-santa-eulalia-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Santa Eulália / Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Santa Eulália is a resort-oriented beach in Albufeira, known for its golden cliffs, pine-framed setting and strong visitor facilities. It offers boardwalk and stair access, nearby restaurants, seasonal beach support and verified accessible-beach recognition.",
  "full_description": "Praia de Santa Eulália is one of Albufeira’s most polished resort beaches, set east of the city centre between the Oura and Maria Luísa coastal areas. Official tourism sources describe it as a maritime beach framed by golden cliffs, pine trees and landscaped areas, giving it a greener and more composed setting than many busier urban beaches.\n\nThe beach is closely connected with surrounding hotels, leisure facilities and visitor services, making it especially useful for families, resort guests and visitors who want comfort without moving far from Albufeira’s eastern accommodation zones. Visit Albufeira describes Santa Eulália as a wide sandy beach with clear water, gentle cliffs, boardwalks and stairways leading to the sand, as well as restaurants, lifeguards, water-sports activities and landscaped areas.\n\nThis is not a remote or undeveloped beach. Official environmental and municipal references classify Santa Eulália as a high-use bathing area with strong demand, so summer crowding should be expected, particularly around the easiest access points and serviced sections. Even so, the beach’s pine-backed cliffs, soft rock formations and organised facilities give it a calmer resort feel than the more nightlife-heavy Oura area nearby.\n\nABAAE lists Santa Eulália as a 2026 Blue Flag beach, with the bathing season running from 15 May to 15 October 2026 and the Blue Flag season from 1 July to 30 September 2026. Accessibility support is verified through official accessible-beach material, but current seasonal support should still be checked before travelling.",
  "coordinates": {
    "latitude": 37.087917,
    "longitude": -8.214625,
    "label": "Praia de Santa Eulália",
    "notes": "Coordinates were taken from the official ABAAE Albufeira municipality page for Santa Eulália."
  },
  "beach_type": "Sandy resort beach below low golden cliffs",
  "landscape": "A wide sandy beach framed by gentle golden cliffs, pine trees, landscaped areas and soft rock formations.",
  "access": "Visit Albufeira verifies boardwalks and stairways leading directly to the sand. Accessible-beach recognition is listed by official sources, but visitors with reduced mobility should confirm current seasonal support and the most suitable access point before visiting.",
  "highlights": [
    "Resort-oriented Albufeira beach with strong visitor infrastructure",
    "Golden cliffs, pine trees and landscaped surroundings",
    "Boardwalks and stairways leading directly to the sand",
    "Restaurants, lifeguards and water-sports activity listed by official local tourism",
    "Accessible-beach recognition verified from official sources",
    "Official 2026 Blue Flag listing for Santa Eulália"
  ],
  "best_for": [
    "Families",
    "Resort beach days",
    "Accessible beach access",
    "Couples",
    "Restaurants nearby",
    "Water sports",
    "Photography",
    "Visitors staying in eastern Albufeira",
    "Comfort-focused beach days"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Beach surveillance / lifeguards", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Boardwalk access", "status": "Verified" },
    { "name": "Stairway access", "status": "Verified" },
    { "name": "Restaurants", "status": "Verified / Seasonal" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Water-sports activities", "status": "Seasonal / conditions dependent" },
    { "name": "Landscaped areas", "status": "Verified" },
    { "name": "Leisure complex nearby", "status": "Verified" },
    { "name": "Car parking", "status": "Not verified" },
    { "name": "Showers", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Boardwalk and stairway access",
    "Restaurants and bar",
    "Seasonal water-sports activities",
    "Landscaped areas",
    "Nearby leisure complex",
    "Golden cliffs and pine-framed scenery"
  ],
  "important_information": {
    "best_time_to_visit": "May to October for the official bathing season. June and September are usually more comfortable for visitors who want the resort facilities with less peak-summer pressure than July and August.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Santa Eulália as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for Santa Eulália as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nOfficial environmental and municipal references identify Santa Eulália as a high-use beach with strong demand.\nFacilities, surveillance and water-sports services may vary by season and concession operation.\nAccess includes boardwalks and stairways; visitors with reduced mobility should confirm current access arrangements before travelling.\nThe beach is backed by cliffs and rock formations, so visitors should avoid cliff edges and cliff bases.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Santa Eulália as 15 May 2026 to 15 October 2026.",
      "ABAAE lists the 2026 Blue Flag season for Santa Eulália as 1 July 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Official environmental and municipal references identify Santa Eulália as a high-use beach with strong demand.",
      "Facilities, surveillance and water-sports services may vary by season and concession operation.",
      "Access includes boardwalks and stairways; visitors with reduced mobility should confirm current access arrangements before travelling.",
      "The beach is backed by cliffs and rock formations, so visitors should avoid cliff edges and cliff bases.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Santa Eulália as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for Santa Eulália as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nOfficial environmental and municipal references identify Santa Eulália as a high-use beach with strong demand.\nFacilities, surveillance and water-sports services may vary by season and concession operation.\nAccess includes boardwalks and stairways; visitors with reduced mobility should confirm current access arrangements before travelling.\nThe beach is backed by cliffs and rock formations, so visitors should avoid cliff edges and cliff bases.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "May to October for the official bathing season. June and September are usually more comfortable for visitors who want the resort facilities with less peak-summer pressure than July and August.",
  "suitable_for": [
    "Families using serviced beach areas",
    "Visitors staying in Santa Eulália, Oura or eastern Albufeira",
    "Couples wanting a polished resort beach",
    "Visitors needing accessible-beach support, subject to current confirmation",
    "Water-sports users when conditions are suitable",
    "Visitors who value restaurants and beach services nearby"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors who want to avoid high-use resort areas",
    "Those expecting guaranteed quiet in peak summer",
    "Visitors requiring accessibility support without confirming current arrangements",
    "Anyone intending to sit close to cliff bases"
  ],
  "nearby_attractions": [
    {
      "name": "Praia da Oura",
      "type": "Nearby beach and resort area",
      "description": "A lively Albufeira beach west of Santa Eulália, associated with restaurants, bars, nightlife and water-sports activity.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia Maria Luísa",
      "type": "Nearby beach",
      "description": "A neighbouring Albufeira beach east of Santa Eulália, listed by official tourism sources and known for its cliff-framed setting.",
      "verification_status": "Verified"
    },
    {
      "name": "Parque Aventura Albufeira",
      "type": "Outdoor activity park",
      "description": "A nearby outdoor activity park in a green area of Albufeira, with tree-top courses, bridges, nets, tunnels and zip lines.",
      "verification_status": "Verified"
    },
    {
      "name": "Albufeira Historic Centre",
      "type": "Historic town centre",
      "description": "The old town of Albufeira lies west of Santa Eulália, with central beaches, viewpoints, restaurants and cultural streets.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia dos Olhos de Água",
      "type": "Nearby beach and coastal village",
      "description": "A nearby Albufeira beach area east of Santa Eulália, referenced by VisitPortugal for its freshwater springs on the sand.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Albufeira",
    "Santa Eulália",
    "Oura",
    "Areias de São João",
    "Olhos de Água",
    "Ferreiras"
  ],
  "walking_trails_nearby": [
    {
      "name": "Albufeira - Oura walk",
      "description": "Visit Albufeira lists Albufeira - Oura among its walks and tours, making the nearby Oura area a practical starting point for exploring the eastern resort coast.",
      "verification_status": "Verified"
    },
    {
      "name": "Santa Eulália to Maria Luísa coastal-resort walk",
      "description": "A short local beach-and-resort walk between neighbouring coastal areas. Route condition, tide, access and cliff safety should be checked locally.",
      "verification_status": "Not verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August if you want easier access to the most convenient serviced sections.",
    "Confirm accessible-beach support before travelling if mobility assistance is required.",
    "Use official boardwalks, stairways and signed access routes.",
    "Expect a resort-beach setting with high seasonal demand rather than a secluded beach.",
    "Check local flags before swimming or using water-sports services.",
    "For a quieter outing, consider morning visits or shoulder-season dates."
  ],
  "photography_notes": "Praia de Santa Eulália photographs well for its pine-framed cliffs, golden sand, landscaped resort setting and softer rock formations. Morning or late-afternoon light is usually best, and visitors should stay on safe paths and avoid cliff edges.",
  "family_notes": "Santa Eulália is a strong family option because of its wide sand, organised access, restaurants and seasonal support services. Families should still check beach flags, supervise children near rocks and steps, and plan around summer demand.",
  "safety_notes": "Sea conditions can vary. Follow local flags, signage and instructions from beach surveillance where present. Keep away from cliff bases and edges, and take care around rock formations and water-sports zones.",
  "accessibility_notes": "Accessible-beach recognition is verified from official sources, and Visit Albufeira confirms boardwalk access as well as stairways. Current seasonal support, adapted equipment and the most suitable access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia de Santa Eulália, Albufeira | Beach Guide",
    "meta_description": "Praia de Santa Eulália in Albufeira is a resort beach with golden cliffs, pine scenery, facilities, accessibility support and Blue Flag status.",
    "keywords": [
      "Praia de Santa Eulália",
      "Santa Eulália Beach",
      "Praia de Santa Eulalia Albufeira",
      "Albufeira beaches",
      "Algarve beaches",
      "Portugal beaches",
      "resort beach Albufeira",
      "accessible beach Albufeira",
      "Blue Flag Santa Eulália",
      "family beach Albufeira",
      "Praia da Oura nearby",
      "Praia Maria Luísa nearby"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de Santa Eulália trip ideas",
      "links": [
        { "label": "Praia de Santa Eulália" },
        { "label": "Santa Eulália Beach" },
        { "label": "Praia de Santa Eulalia Albufeira" },
        { "label": "resort beach Albufeira" },
        { "label": "accessible beach Albufeira" },
        { "label": "family beach Albufeira" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Praia da Oura" },
        { "label": "Praia Maria Luísa" },
        { "label": "Parque Aventura Albufeira" },
        { "label": "Albufeira Historic Centre" },
        { "label": "Praia dos Olhos de Água" },
        { "label": "Areias de São João" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Santa Eulália",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/41D48896-9E0D-4B2E-B572-76CDE0A3EE1C",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Albufeira",
        "Golden cliffs covered with pine trees and gardens",
        "Leisure complex nearby",
        "Bar, restaurant and disco reference"
      ]
    },
    {
      "source_name": "Visit Albufeira - Praia de Santa Eulália",
      "source_url": "https://visitalbufeira.pt/praia/praia-de-santa-eulalia",
      "facts_verified": [
        "Wide sandy area",
        "Gentle cliffs",
        "Boardwalks and stairways to the sand",
        "Restaurants",
        "Lifeguards",
        "Water-sports activities",
        "Landscaped areas",
        "Pine trees and soft rock formations"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Santa Eulália",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/santa-eulalia/",
      "facts_verified": [
        "Official Santa Eulália beach entry",
        "Municipality of Albufeira",
        "Beach code PTCT8C",
        "2026 bathing season",
        "2026 Blue Flag season"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Albufeira municipality page",
      "source_url": "https://bandeiraazul.abaae.pt/municipio/albufeira/",
      "facts_verified": [
        "Santa Eulália listed among Albufeira’s 2026 Blue Flag locations",
        "Coordinates",
        "Blue Flag shown as not hoisted at time of verification",
        "Hydrographic region and beach code"
      ]
    },
    {
      "source_name": "Agência Portuguesa do Ambiente - ARH do Algarve",
      "source_url": "https://apambiente.pt/apa/arh-do-algarve",
      "facts_verified": [
        "Santa Eulália listed as a bathing area in Albufeira",
        "Beach code PTCT8C",
        "Bathing season reference",
        "Blue Flag and accessible beach reference from official search result"
      ]
    },
    {
      "source_name": "Câmara Municipal de Albufeira - Santa Eulália",
      "source_url": "https://www.cm-albufeira.pt/praias/santa-eulalia",
      "facts_verified": [
        "Official municipal beach page located",
        "Coastal bathing water in Albufeira",
        "High-use / strong-demand beach classification from official search result",
        "Golden sand reference"
      ]
    },
    {
      "source_name": "Câmara Municipal de Albufeira - Tabela Praias Acessíveis 2025",
      "source_url": "https://www.cm-albufeira.pt/sites/default/files/inline-files/Tabela%20Praias%20Acess%C3%ADveis_2025.pdf",
      "facts_verified": [
        "Santa Eulália listed in the municipal accessible-beach table for 2025",
        "Accessible-beach status treated as requiring current seasonal confirmation"
      ]
    },
    {
      "source_name": "VisitPortugal - Albufeira e as praias",
      "source_url": "https://www.visitportugal.com/pt-pt/node/73802",
      "facts_verified": [
        "Albufeira coastal context",
        "Oura, Santa Eulália, Maria Luísa and Olhos de Água as eastern Albufeira beaches",
        "Oura to Montechoro nightlife-area context",
        "Nearby beach sequence"
      ]
    },
    {
      "source_name": "Visit Albufeira - Parque Aventura",
      "source_url": "https://visitalbufeira.pt/experiencias/parque-aventura/",
      "facts_verified": [
        "Parque Aventura as a nearby outdoor activity park",
        "Green-area setting",
        "Tree-top courses, suspended bridges, nets, tunnels and zip lines",
        "Family and group suitability"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, landscape, boardwalk and stair access, resort/leisure setting, facilities, Blue Flag season and coordinates were verified from official tourism and Blue Flag sources.",
    "The phrase “resort-heavy” is expressed as “resort-oriented” and “connected with surrounding hotels, leisure facilities and visitor services”, based on verified official descriptions of leisure infrastructure and high-use visitor demand.",
    "ABAAE verifies Santa Eulália’s 2026 bathing season as 15 May 2026 to 15 October 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "Accessible-beach recognition is supported by official APA and municipal accessible-beach material, but current seasonal support should be manually confirmed before publication updates.",
    "Parking and showers were not fully verified from authoritative current sources and are marked Not verified.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "The Câmara Municipal de Albufeira Santa Eulália page and accessible-beach PDF returned fetch errors when opened, so those facts are used cautiously from official search-result summaries.",
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
