begin;

do $$
declare
  v_listing_id uuid;
  v_existing_category_data jsonb;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Benagil",
  "slug": "praia-de-benagil-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Benagil / Lagoa",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Benagil is a small fishing-village beach in Lagoa, set below limestone cliffs and beside the regulated Benagil cave coastline. It is known for fishing boats, compact sand, boat-trip activity and practical access pressure in busy periods.",
  "full_description": "Praia de Benagil sits in the coastal village of Benagil, in the municipality of Lagoa. VisitPortugal classifies it as a maritime beach and describes a small area of sand, fishing boats and a cliff landscape shaped by grottoes and caverns.\n\nThe beach has a working coastal character rather than a broad resort-beach feel. Visit Algarve describes access through the area reserved for fishing boats, and official tourism material links the beach with boat trips along nearby sea caves and beaches that cannot be reached by land. This makes Benagil especially useful for visitors interested in the Lagoa cave coastline, but it also means the beach can feel compact and operational around boat activity.\n\nVisitPortugal lists safety or surveillance, small craft hire, showers, outdoor parking, a bar and a restaurant. The official 2026 bathing-water list names Benagil with a bathing season from 1 June to 30 September. Current opening, daily supervision and concession operation should still be checked locally before planning a full beach day.\n\nThe nearby Benagil cave area is regulated by the Portuguese Maritime Authority. Rules checked for this review include restrictions on swimming or using flotation aids to access Algar de Benagil, guided requirements for non-motorised platforms, safety-equipment requirements and limits inside the cave. Visitors should use authorised, legal options only and check current rules before any boat, kayak or SUP activity.\n\nFor a wider coastal itinerary, Benagil sits close to Praia do Carvalho, Praia da Marinha, Praia da Albandeira and the Seven Hanging Valleys cliff landscape. Lagoa municipality has also reported access, parking and overcrowding pressure along the Albandeira-Benagil coastal zone, so early planning is important in busy periods.",
  "highlights": [
    "Small maritime beach in Benagil, municipality of Lagoa",
    "Fishing boats and compact sand below limestone cliffs",
    "Boat-trip context to nearby cave coastline listed by official tourism sources",
    "Official 2026 bathing season listed from 1 June to 30 September",
    "Parking, showers, bar, restaurant and surveillance listed by VisitPortugal",
    "Benagil cave navigation regulated by the Portuguese Maritime Authority"
  ],
  "best_time_to_visit": "June to September matches the official 2026 bathing season. Spring, early summer and early autumn are usually more practical for coastal walks and lower-pressure visits. In busy periods, go early for parking and allow extra time around boat-tour departures. Boat, kayak and SUP activity should depend on current sea conditions, operator guidance and Maritime Authority rules.",
  "parking_info": "VisitPortugal lists outdoor parking for Praia de Benagil. Lagoa municipality has reported circulation difficulties and disordered parking in the Albandeira-Benagil coastal zone during busy periods, so parking should not be assumed to be easy. Current capacity, payment conditions and traffic restrictions were not independently verified for this review.",
  "accessibility_info": "Step-free access and accessible-beach support were not verified. Official tourism information describes access through the fishing-boat area, and the beach is compact, operational and cliff-backed. Visitors with reduced mobility should confirm current access, drop-off and beach-entry conditions before travelling.",
  "lifeguard_info": "VisitPortugal lists safety or surveillance for Praia de Benagil, and the official 2026 bathing season is 1 June to 30 September. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: not verified for 2026. Benagil was not found in the ABAAE 2026 awarded list checked on 18 May 2026.",
  "blue_flag_status": "not_verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "1 June 2026 to 30 September 2026",
    "notes": "VisitPortugal lists safety or surveillance, but exact daily lifeguard staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.087775%2C-8.426675",
  "coordinates": {
    "latitude": 37.087775,
    "longitude": -8.426675,
    "source": "Existing verified listing coordinates retained; Google Maps URL generated from stored coordinates."
  },
  "beach_type": "Small sandy maritime beach beside a fishing village",
  "landscape": "A compact sandy beach framed by limestone cliffs, with fishing boats, sea-cave scenery and nearby grottoes along the Lagoa coast.",
  "access": "Road access reaches the Benagil beach area, with beach access through the fishing-boat zone described by official regional tourism. Parking and access conditions should be checked locally in busy periods.",
  "facilities": [
    { "name": "Official 2026 bathing season", "status": "1 June to 30 September 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Small craft hire listed by VisitPortugal", "status": "Seasonal / regulated" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "Outdoor parking", "status": "Verified by VisitPortugal" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / seasonal operation should be checked" },
    { "name": "Blue Flag 2026", "status": "Not verified" }
  ],
  "includes": [
    "Seasonal safety or surveillance listed by VisitPortugal",
    "Regulated small craft or boat activity listed by official tourism sources",
    "Showers",
    "Outdoor parking",
    "Seasonal bar",
    "Seasonal restaurant"
  ],
  "nearby_beaches": [
    {
      "name": "Praia do Carvalho",
      "type": "Nearby beach",
      "description": "A small Lagoa cove west of Benagil, verified from the existing published AlgarveOfficial beach listing and official Lagoa beach research.",
      "href": "/listing/praia-do-carvalho-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Marinha",
      "type": "Nearby beach",
      "description": "A cliff-framed Lagoa beach east of Benagil, verified by VisitPortugal and linked with the Seven Hanging Valleys route.",
      "href": "/listing/praia-da-marinha-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Albandeira",
      "type": "Nearby beach",
      "description": "A small natural Lagoa beach toward the Albandeira side of the same cliff coast, verified from official tourism and municipal sources.",
      "href": "/listing/praia-da-albandeira-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia de Vale Centeanes",
      "type": "Nearby beach and trail endpoint",
      "description": "A cliff-backed beach near Carvoeiro and endpoint of the official Seven Hanging Valleys route.",
      "href": "/listing/praia-de-vale-centeanes-lagoa",
      "verification_status": "Verified internal listing"
    }
  ],
  "nearby_restaurants": [],
  "nearby_attractions": [],
  "important_information": {
    "best_time_to_visit": "June to September matches the official 2026 bathing season. Spring, early summer and early autumn are usually more practical for coastal walks and lower-pressure visits.",
    "know_before_you_go": "Do not assume unrestricted cave access from the beach.\nSwimming or using flotation aids to access Algar de Benagil is prohibited under the Maritime Authority rules checked for this review.\nUnguided non-motorised platform activity in the regulated cave area is not permitted under the amended 2025 rules checked for this review.\nParking and road circulation can be difficult in busy periods along the Albandeira-Benagil coastal zone.\nFacilities, surveillance and concessions may operate seasonally.\nKeep away from cliff edges, cliff bases, cave mouths and restricted areas.",
    "notes": [
      "Do not assume unrestricted cave access from the beach.",
      "Swimming or using flotation aids to access Algar de Benagil is prohibited under the Maritime Authority rules checked for this review.",
      "Unguided non-motorised platform activity in the regulated cave area is not permitted under the amended 2025 rules checked for this review.",
      "Parking and road circulation can be difficult in busy periods along the Albandeira-Benagil coastal zone.",
      "Facilities, surveillance and concessions may operate seasonally.",
      "Keep away from cliff edges, cliff bases, cave mouths and restricted areas."
    ]
  },
  "important_notes": "Do not assume unrestricted cave access from the beach.\nSwimming or using flotation aids to access Algar de Benagil is prohibited under the Maritime Authority rules checked for this review.\nUnguided non-motorised platform activity in the regulated cave area is not permitted under the amended 2025 rules checked for this review.\nParking and road circulation can be difficult in busy periods along the Albandeira-Benagil coastal zone.\nFacilities, surveillance and concessions may operate seasonally.\nKeep away from cliff edges, cliff bases, cave mouths and restricted areas.",
  "suitable_for": [
    "Visitors interested in regulated cave-coast boat activity",
    "Photographers using safe viewpoints or authorised sea approaches",
    "Couples",
    "Coastal walkers",
    "Nature-focused visitors",
    "Visitors comfortable with a compact, active beach setting"
  ],
  "not_suitable_for": [
    "Visitors seeking a quiet or spacious beach day in busy periods",
    "Visitors expecting unrestricted access to Benagil Cave",
    "Visitors with reduced mobility unless current access conditions are confirmed",
    "Families wanting a simple beach day away from boat activity",
    "Anyone planning to swim independently to the cave"
  ],
  "visitor_tips": [
    "Do not plan to swim to Benagil Cave; check official maritime rules and use legal authorised options only.",
    "Book regulated cave activity ahead in busy periods if you plan to use a licensed operator.",
    "Arrive early if travelling by car.",
    "Expect a working beach environment with fishing boats and tour activity.",
    "Wear suitable footwear if combining Benagil with cliff-top walking.",
    "Keep away from cliff bases, cave mouths, restricted areas and informal cliff paths.",
    "Check weather and sea conditions before any boat, kayak or SUP activity."
  ],
  "photography_notes": "Benagil is photogenic from the beach, authorised cliff-top areas and legal sea approaches. For safe photography, use marked routes and authorised activity providers; do not swim to the cave or stand close to unstable cliff edges.",
  "family_notes": "Families may enjoy the village setting and scenery, but the beach is small and linked to active boat movement. Adults should supervise children closely near the waterline, boats, roads, cliffs and any restricted areas.",
  "safety_notes": "The Benagil caves area is regulated because of maritime traffic, conservation requirements and rockfall risk. Visitors should follow Maritime Authority rules, use required safety equipment, avoid cliff bases and never attempt unsafe independent access to caves.",
  "accessibility_notes": "Step-free access and accessible-beach support were not verified. Confirm current access and assistance locally before travelling.",
  "parking_notes": "Outdoor parking is listed by VisitPortugal, but capacity, pricing and peak-period restrictions were not independently verified.",
  "image_gallery_notes": "Existing Supabase-hosted AlgarveOfficial gallery retained. No new external images were added because source and licence metadata could not be independently verified during this review. No duplicate gallery files were found on 18 May 2026. Alt text was updated after visual review of the stored images.",
  "faq_items": [
    {
      "question": "Where is Praia de Benagil?",
      "answer": "Praia de Benagil is in the coastal village of Benagil, in the municipality of Lagoa, on the central Algarve coast."
    },
    {
      "question": "Is there parking at Praia de Benagil?",
      "answer": "VisitPortugal lists outdoor parking for Praia de Benagil. Lagoa municipality has reported parking and circulation pressure in the Albandeira-Benagil coastal zone during busy periods, so current conditions should be checked before travelling."
    },
    {
      "question": "Are there lifeguards at Praia de Benagil?",
      "answer": "VisitPortugal lists safety or surveillance, and the official 2026 bathing season is 1 June to 30 September. Exact daily lifeguard staffing was not independently verified, so check local flags and signage before swimming."
    },
    {
      "question": "Is Praia de Benagil a Blue Flag beach?",
      "answer": "Blue Flag status was not verified for 2026. Benagil was not found in the ABAAE 2026 awarded list checked on 18 May 2026."
    },
    {
      "question": "Can you swim to Benagil Cave from Praia de Benagil?",
      "answer": "Do not plan to swim to Benagil Cave. Maritime Authority rules checked for this review prohibit access to Algar de Benagil by swimming or flotation aids."
    },
    {
      "question": "Is Praia de Benagil accessible for visitors with reduced mobility?",
      "answer": "Step-free access and accessible-beach support were not verified. Visitors with reduced mobility should confirm current access, drop-off and assistance arrangements before travelling."
    },
    {
      "question": "What are the nearest beaches to Praia de Benagil?",
      "answer": "Nearby published AlgarveOfficial beach listings include Praia do Carvalho, Praia da Marinha, Praia da Albandeira and Praia de Vale Centeanes."
    },
    {
      "question": "What is the best time to visit Praia de Benagil?",
      "answer": "June to September matches the official 2026 bathing season. Spring, early summer and early autumn are usually more practical for coastal walks and lower-pressure visits."
    }
  ],
  "seo": {
    "meta_title": "Praia de Benagil, Lagoa | Algarve Beach Guide",
    "meta_description": "Praia de Benagil in Lagoa: verified beach guide with cave rules, parking, lifeguard season, Blue Flag check, nearby beaches and FAQs.",
    "keywords": [
      "Praia de Benagil",
      "Benagil Beach",
      "Benagil Lagoa",
      "Lagoa beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Benagil cave rules",
      "Algar de Benagil",
      "Seven Hanging Valleys",
      "Praia do Carvalho",
      "Praia da Marinha nearby"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Benagil",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/980AF7E1-613C-426C-9B2F-E3A68794E514",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Benagil, Lagoa",
        "Small sandy beach character",
        "Fishing boats",
        "Cliffs, grottoes and caverns",
        "Boat-trip relevance",
        "Facilities including surveillance, small craft hire, showers, outdoor parking, bar and restaurant"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia de Benagil",
      "source_url": "https://visitalgarve.pt/en/equipamento/8760/praia-de-benagil",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Beach access through the fishing-boat area",
        "Fishing boats also taking visitors to sea caves and beaches not reachable by land",
        "Benagil as a sea-cave departure context"
      ]
    },
    {
      "source_name": "Diário da República - Portaria n.º 204-A/2026/1",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Benagil bathing water listed for Lagoa",
        "Bathing water code PTCW3J",
        "2026 bathing season from 1 June to 30 September"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "2026 Blue Flag awarded list checked",
        "Benagil not found among the listed 2026 awarded beach entries during this review"
      ]
    },
    {
      "source_name": "Autoridade Marítima Nacional / Capitania do Porto de Portimão - Edital 019/2024",
      "source_url": "https://www.amn.pt/DGAM/Capitanias/Portimao/Lists/Documentos_AMN/20240730%20Edital%20019-2024%20-%20Instru%C3%A7%C3%A3o%20Navega%C3%A7%C3%A3o%20Grutas%20de%20Benagil_signed.pdf",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Navigation rules for the Benagil caves maritime area",
        "Area between Vale do Lapa and Albandeira in Lagoa",
        "Rockfall-risk zone",
        "Conservation status reference",
        "Restriction on visitor access to Algar de Benagil by swimming or flotation aids",
        "Night navigation restriction",
        "Limits on boats and non-motorised platforms",
        "Time limits for cave visits"
      ]
    },
    {
      "source_name": "Autoridade Marítima Nacional / Capitania do Porto de Portimão - Edital 009/2025",
      "source_url": "https://www.amn.pt/DGAM/Capitanias/Portimao/Lists/Documentos_AMN/20250702%20Eidtal%20009-2025%2C%20alt1%20ao%20Edital%20019-2024_signed.pdf",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "2025 amendment to Benagil caves navigation rules",
        "Guided requirement for non-motorised nautical platforms",
        "Mandatory safety equipment references",
        "Revised simultaneous-access limits inside Algar de Benagil"
      ]
    },
    {
      "source_name": "AMAL - Novas Regras para as Grutas de Benagil",
      "source_url": "https://amal.pt/comunicacao/978-novas-regras-para-a-ca-lagoa",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Regional communication on Benagil cave rules",
        "Ban on kayak rental without guide in the Benagil caves area",
        "Ban on cave access by swimming or flotation aids",
        "Limits on vessels and kayaks inside the cave",
        "Maximum visit times and guided kayak ratio"
      ]
    },
    {
      "source_name": "Município de Lagoa - Coastal management between Albandeira and Benagil",
      "source_url": "https://www.cm-lagoa.pt/noticia/municipio-de-lagoa-reune-com-varias-entidades-para-ordenar-zona-costeira-entre-albandeira-e-benagil",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Municipal concern over the Albandeira-Benagil coastal zone",
        "Reported circulation difficulties",
        "Disordered parking",
        "Sensitive-area occupation",
        "Small accidents and beach overcrowding pressure"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Sete Vales Suspensos",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/sete-vales-suspensos",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Official Seven Hanging Valleys route context in Lagoa",
        "Route linking Praia de Vale Centeanes and Praia da Marinha",
        "Cliff and hanging-valley landscape context near Benagil"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, beach type, fishing-village setting, cliff and cave landscape, boat-trip relevance, facilities and 2026 bathing season were verified from official tourism, Diário da República and Maritime Authority sources.",
    "Blue Flag status was checked against the official 2026 ABAAE awarded list and not verified for Benagil.",
    "Cave-access rules are operational safety rules and may change; visitors should recheck Maritime Authority guidance before booking or attempting any nautical activity.",
    "Nearby beach cards were limited to existing published internal AlgarveOfficial listings.",
    "Nearby restaurants and attractions are not manually populated unless they are existing published internal listings; the page may also render nearby published business listings from stored AlgarveOfficial location data.",
    "Step-free access, accessible equipment, public toilet status, paid/free parking terms and exact daily lifeguard staffing were not independently verified.",
    "Existing gallery images are Supabase-hosted AlgarveOfficial media; no new external images were added.",
    "No public website URL is set for this beach listing, avoiding competitor/source CTAs."
  ],
  "last_verified_at": "2026-05-18"
}
$json$::jsonb;
begin
  select id, coalesce(category_data::jsonb, '{}'::jsonb)
    into v_listing_id, v_existing_category_data
  from public.listings
  where slug = 'praia-de-benagil-lagoa'
    and status = 'published'
  limit 1;

  if v_listing_id is null then
    raise exception 'Published listing not found for slug praia-de-benagil-lagoa';
  end if;

  update public.listings
  set
    short_description = v_patch->>'short_description',
    description = v_patch->>'full_description',
    website_url = null,
    address = 'Praia de Benagil, Benagil, Lagoa, Algarve, Portugal',
    latitude = 37.087775,
    longitude = -8.426675,
    tags = array(select jsonb_array_elements_text(v_patch #> '{seo,keywords}')),
    category_data = jsonb_set(
      (v_existing_category_data || v_patch)
        || jsonb_build_object('localized_content', coalesce(v_existing_category_data->'localized_content', '{}'::jsonb)),
      '{localized_content,en}',
      coalesce(v_existing_category_data #> '{localized_content,en}', '{}'::jsonb) || v_patch,
      true
    ),
    meta_title = v_patch #>> '{seo,meta_title}',
    meta_description = v_patch #>> '{seo,meta_description}',
    updated_at = now()
  where id = v_listing_id;

  update public.listing_images
  set alt_text = case id
    when '48da5caf-b6c9-4658-8454-8fda47e85d9c'::uuid
      then 'Interior of the Benagil sea cave near Praia de Benagil in Lagoa'
    when '59797728-5149-40fa-b941-e9c930dc3433'::uuid
      then 'Water and sand inside the Benagil sea cave near Praia de Benagil'
    else alt_text
  end
  where listing_id = v_listing_id
    and id in (
      '48da5caf-b6c9-4658-8454-8fda47e85d9c'::uuid,
      '59797728-5149-40fa-b941-e9c930dc3433'::uuid
    );
end $$;

commit;
