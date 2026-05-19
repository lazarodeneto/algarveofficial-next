begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Senhora da Rocha",
  "slug": "praia-da-senhora-da-rocha-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Porches",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Senhora da Rocha is a small cliff-framed beach in Porches, Lagoa, set below the chapel and headland of Nossa Senhora da Rocha. Official sources verify its tunnel connection to Praia Nova, seasonal beach services, accessible-beach recognition and 2026 Blue Flag status.",
  "full_description": "Praia da Senhora da Rocha is a compact maritime beach in Porches, in the municipality of Lagoa. It sits below the rocky promontory of Nossa Senhora da Rocha, where the chapel and former fort form one of the most recognisable coastal viewpoints in this part of the Algarve.\n\nVisitPortugal describes Senhora da Rocha as a small sandy beach set between tall cliffs, with calm and clear sea conditions in its official summary and a role as a departure point for boat excursions to nearby grottoes. Sea conditions can still vary, so visitors should use local flags and signage rather than assuming swimming is always suitable.\n\nThe beach has a distinctive layout. To the west, rock separates Senhora da Rocha from Praia Nova, but VisitPortugal verifies a tunnel through the rock connecting the two beaches. The sand is compact, with cliffs, boats, beach-service areas and the chapel headland shaping the visitor experience.\n\nABAAE verifies Senhora da Rocha as a 2026 Blue Flag coastal beach, with the bathing season from 1 June to 30 September 2026 and the Blue Flag season from 1 July to 30 September 2026. VisitPortugal lists surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant and accessible-beach recognition. These services are seasonal or conditions-dependent unless confirmed locally.\n\nVisitors should also treat cliff and access safety seriously. Lagoa municipality published a temporary road-circulation closure notice for 9 to 27 February 2026 due to rockfall risk at Praia da Senhora da Rocha. That notice refers to a past date range, but it supports a cautious approach: check current access, obey local signage and keep away from cliff edges and cliff bases.",
  "highlights": [
    "Small sandy beach below the Nossa Senhora da Rocha chapel headland",
    "Cliff-framed cove in Porches, municipality of Lagoa",
    "Tunnel connection to Praia Nova verified by VisitPortugal",
    "Outdoor parking, bar, restaurant, showers and rental services listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "2026 Blue Flag status verified by ABAAE"
  ],
  "best_time_to_visit": "June to September aligns with the official 2026 bathing season and the main seasonal beach-service period. Spring, early summer and September are practical for chapel-headland views, photography and less intense heat. In summer, arrive earlier where possible because the beach is compact, and check current road access, local flags and cliff-safety signage before settling in.",
  "parking_info": "VisitPortugal lists outdoor parking for Praia da Senhora da Rocha. Current capacity, payment conditions and peak-season restrictions were not independently verified. Lagoa municipality published a temporary road-circulation closure notice for 9 to 27 February 2026 because of rockfall risk, so visitors should check current access and signage before relying on vehicle access.",
  "accessibility_info": "VisitPortugal lists Praia da Senhora da Rocha as an accessible beach. Current step-free route conditions, adapted equipment, accessible toilets and assisted-bathing support were not independently verified for this review. Because this is a cliff-backed beach with past access restrictions nearby, visitors with reduced mobility should confirm current access arrangements before travelling.",
  "lifeguard_info": "VisitPortugal lists security or surveillance, and ABAAE lists the 2026 bathing season from 1 June to 30 September. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 via ABAAE. The official ABAAE page lists the Blue Flag season from 1 July to 30 September 2026 and showed the flag as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "1 June 2026 to 30 September 2026",
    "notes": "VisitPortugal lists security or surveillance, but exact daily lifeguard staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.097206%2C-8.385787",
  "coordinates": {
    "latitude": 37.097206,
    "longitude": -8.385787,
    "source": "ABAAE official Senhora da Rocha beach entry."
  },
  "latitude": 37.097206,
  "longitude": -8.385787,
  "beach_type": "Small sandy maritime beach below limestone cliffs",
  "landscape": "A compact sandy cove enclosed by limestone cliffs, set beneath the Nossa Senhora da Rocha chapel headland and connected to Praia Nova by a tunnel through the rock.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Outdoor parking is listed, but current access should be checked locally because Lagoa municipality issued a temporary road-circulation closure notice in February 2026 due to rockfall risk.",
  "facilities": [
    { "name": "Blue Flag 2026", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "1 June to 30 September 2026" },
    { "name": "Security or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Accessible beach recognition listed by VisitPortugal", "status": "Verified recognition / current support should be checked" },
    { "name": "Outdoor parking", "status": "Verified by VisitPortugal / access should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Small craft hire", "status": "Seasonal / conditions dependent" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / seasonal operation should be checked" }
  ],
  "includes": [
    "2026 Blue Flag status verified by ABAAE",
    "Seasonal security or surveillance listed by VisitPortugal",
    "Outdoor parking listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "Tunnel connection to Praia Nova",
    "Boat-excursion departure context listed by VisitPortugal"
  ],
  "important_information": {
    "best_time_to_visit": "June to September aligns with the official 2026 bathing season and the main seasonal beach-service period. Spring, early summer and September are practical for chapel-headland views, photography and less intense heat. In summer, arrive earlier where possible because the beach is compact, and check current road access, local flags and cliff-safety signage before settling in.",
    "know_before_you_go": "ABAAE verifies Senhora da Rocha as a 2026 Blue Flag beach. VisitPortugal lists parking, surveillance, rentals, showers, bar, restaurant and accessible-beach recognition, but current seasonal operation and adapted support should be checked locally. Lagoa municipality published a temporary road-access closure notice in February 2026 due to rockfall risk, so visitors should check current access and avoid cliff bases and edges.",
    "notes": [
      "ABAAE lists the 2026 bathing season as 1 June to 30 September.",
      "ABAAE lists the 2026 Blue Flag season as 1 July to 30 September.",
      "VisitPortugal lists outdoor parking, bar, restaurant, showers, small craft hire, sunshade rental, surveillance and accessible-beach recognition.",
      "Current daily lifeguard staffing and accessibility support were not independently verified.",
      "Lagoa municipality published a temporary road-circulation closure notice for 9 to 27 February 2026 because of rockfall risk.",
      "Visitors should keep away from cliff bases, cliff edges and any restricted areas."
    ]
  },
  "important_notes": "ABAAE verifies Senhora da Rocha as a 2026 Blue Flag beach, with bathing season from 1 June to 30 September and Blue Flag season from 1 July to 30 September. VisitPortugal lists parking, surveillance, showers, bar, restaurant, rentals and accessible-beach recognition. Current daily lifeguard staffing, adapted support and road access should be checked locally.",
  "suitable_for": [
    "Visitors staying in Porches, Alporchinhos or Armação de Pêra",
    "Couples and photographers",
    "Visitors interested in chapel-headland views and coastal heritage",
    "Beachgoers wanting a compact serviced cove",
    "Families using supervised seasonal areas",
    "Visitors needing accessible-beach recognition, subject to current confirmation"
  ],
  "not_suitable_for": [
    "Visitors seeking a large open sandy beach",
    "Visitors wanting a remote beach with no services",
    "Visitors requiring accessibility support without confirming current arrangements",
    "Anyone planning to sit beneath cliff faces or ignore access restrictions",
    "Visitors expecting guaranteed calm sea conditions"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Short beach visits",
    "Chapel-headland views",
    "Boat excursions when conditions allow",
    "Accessible-beach recognition, subject to current confirmation"
  ],
  "nearby_beaches": [
    {
      "name": "Praia da Albandeira",
      "type": "Nearby beach",
      "distance": "~1.5 km",
      "description": "A published AlgarveOfficial small natural cliff-cove listing west of Senhora da Rocha.",
      "href": "/listing/praia-da-albandeira-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Marinha",
      "type": "Nearby beach",
      "distance": "~2.5 km",
      "description": "A published AlgarveOfficial Lagoa beach listing and official Seven Hanging Valleys route endpoint.",
      "href": "/listing/praia-da-marinha-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia de Armação de Pêra",
      "type": "Nearby beach",
      "distance": "~2.6 km",
      "description": "A published AlgarveOfficial urban beach listing east of Senhora da Rocha in the neighbouring Silves municipality.",
      "href": "/listing/praia-de-armacao-de-pera",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia de Benagil",
      "type": "Nearby beach",
      "distance": "~3.8 km",
      "description": "A published AlgarveOfficial fishing-village beach listing west of Senhora da Rocha on the Lagoa cave coastline.",
      "href": "/listing/praia-de-benagil-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia do Carvalho",
      "type": "Nearby beach",
      "distance": "~4.3 km",
      "description": "A published AlgarveOfficial natural cove listing between Benagil and the Marinha coastline.",
      "href": "/listing/praia-do-carvalho-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia dos Salgados",
      "type": "Nearby beach",
      "distance": "~5.1 km",
      "description": "A published AlgarveOfficial western Albufeira beach listing beside the Salgados Lagoon area.",
      "href": "/listing/praia-dos-salgados-albufeira",
      "verification_status": "Verified internal listing"
    }
  ],
  "nearby_restaurants": [],
  "nearby_attractions": [],
  "walking_trails_nearby": [
    {
      "name": "Senhora da Rocha promontory area",
      "description": "A short viewpoint walk around the chapel and headland area. It should be kept to safe, authorised paths because the coastline is cliff-backed and may be subject to safety restrictions.",
      "verification_status": "Verified with caution"
    },
    {
      "name": "Senhora da Rocha to Praia Nova tunnel connection",
      "description": "A short beach-to-beach connection through the rock formation between Senhora da Rocha and Praia Nova, verified by VisitPortugal. Use only when open and safe.",
      "verification_status": "Verified"
    },
    {
      "name": "Vale do Olival cliff-side trail",
      "description": "VisitPortugal notes a cliff-side trail around Praia do Vale do Olival with sea views and pedestrian connection to Praia dos Beijinhos.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Check current road access and local safety notices before driving to the beach.",
    "Arrive early in summer because the sand is compact.",
    "Use the chapel headland only from safe, authorised viewpoints.",
    "Stay away from cliff bases, cliff edges and restricted areas.",
    "Use the Praia Nova tunnel only when local conditions and signage allow.",
    "Confirm accessible-beach support before travelling if adapted equipment or assistance is needed.",
    "Use internal AlgarveOfficial nearby business cards rather than external competitor links."
  ],
  "photography_notes": "The strongest views are from safe points around the Nossa Senhora da Rocha headland, with the white chapel, limestone cliffs and small cove below. Keep well back from cliff edges and respect any access restrictions.",
  "family_notes": "Praia da Senhora da Rocha can suit families using serviced seasonal areas, especially because VisitPortugal lists surveillance, showers, parking, bar and restaurant. Families should still plan around compact sand, cliff safety, boat activity and changing sea conditions.",
  "safety_notes": "Sea conditions can vary. Follow local flags, signage and instructions from surveillance teams where present. Keep away from cliff bases and cliff edges, and check current municipal access information because a temporary road-circulation closure was published in February 2026 due to rockfall risk.",
  "accessibility_notes": "VisitPortugal lists Praia da Senhora da Rocha as an accessible beach. Current adapted equipment, route details, assisted bathing and toilets were not independently verified, so visitors with reduced mobility should confirm arrangements before travelling.",
  "faq_items": [
    {
      "question": "Where is Praia da Senhora da Rocha?",
      "answer": "Praia da Senhora da Rocha is in Porches, in the municipality of Lagoa, below the Nossa Senhora da Rocha chapel headland on the central Algarve coast."
    },
    {
      "question": "Is Praia da Senhora da Rocha a Blue Flag beach?",
      "answer": "Yes. ABAAE verifies Senhora da Rocha as a 2026 Blue Flag beach, with the Blue Flag season listed from 1 July to 30 September 2026."
    },
    {
      "question": "Are there lifeguards at Praia da Senhora da Rocha?",
      "answer": "VisitPortugal lists security or surveillance, and ABAAE lists the 2026 bathing season from 1 June to 30 September. Exact daily lifeguard staffing was not independently verified."
    },
    {
      "question": "Is there parking at Praia da Senhora da Rocha?",
      "answer": "VisitPortugal lists outdoor parking for Praia da Senhora da Rocha. Current capacity, payment conditions and peak-season restrictions were not independently verified."
    },
    {
      "question": "Is Praia da Senhora da Rocha accessible?",
      "answer": "VisitPortugal lists Praia da Senhora da Rocha as an accessible beach. Current route details, adapted equipment and assisted-bathing support should be confirmed locally before travelling."
    },
    {
      "question": "Is Praia da Senhora da Rocha connected to Praia Nova?",
      "answer": "Yes. VisitPortugal verifies that a tunnel cut through the rock connects Senhora da Rocha with Praia Nova. It should only be used when open and safe."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings?",
      "answer": "Nearby published AlgarveOfficial beach listings include Praia da Albandeira, Praia da Marinha, Praia de Armação de Pêra, Praia de Benagil, Praia do Carvalho and Praia dos Salgados."
    },
    {
      "question": "What is the best time to visit Praia da Senhora da Rocha?",
      "answer": "June to September matches the official bathing season. Spring, early summer and September are practical for chapel-headland views, photography and a less intense visit."
    }
  ],
  "image_gallery_notes": {
    "status": "Existing AlgarveOfficial/Supabase gallery retained after visual inspection on 18 May 2026. Alt text updated from the two available images.",
    "duplicate_check": "No duplicate canonical image filenames or visually repeated gallery images were found during this review."
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Senhora da Rocha",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/8F33EF00-2ED5-43F5-A2DC-B571C9AC6AE1",
      "facts_verified": [
        "Beach name and maritime beach classification",
        "Location in Porches, Lagoa",
        "Small sandy beach between tall cliffs",
        "Boat-excursion departure point for nearby grottoes",
        "Tunnel connection to Praia Nova",
        "Chapel on the rocky promontory",
        "Facilities including Blue Flag, security or surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Senhora da Rocha",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/senhora-da-rocha/",
      "facts_verified": [
        "Official Senhora da Rocha coastal beach entry",
        "Municipality of Lagoa",
        "Coordinates 37.097206, -8.385787",
        "Beach code PTCE2H",
        "2026 bathing season from 1 June to 30 September",
        "2026 Blue Flag season from 1 July to 30 September",
        "Blue Flag shown as not hoisted at time checked"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Senhora da Rocha listed among Lagoa's 2026 Blue Flag locations",
        "Lagoa listed with six 2026 Blue Flag locations"
      ]
    },
    {
      "source_name": "Diario da Republica - Portaria n.º 204-A/2026/1",
      "source_url": "https://files.diariodarepublica.pt/1s/2026/04/08401/0000200039.pdf",
      "facts_verified": [
        "Senhora da Rocha bathing water code PTCE2H",
        "Official 2026 bathing season from 1 June to 30 September",
        "Praia Nova da Senhora da Rocha also listed in Lagoa for the 2026 bathing season"
      ]
    },
    {
      "source_name": "Camara Municipal de Lagoa - Forte e Capela de Nossa Senhora da Rocha, Porches",
      "source_url": "https://www.cm-lagoa.pt/conhecer/patrimonio-cultural/patrimonio-imovel/poi/forte-e-capela-de-nossa-senhora-da-rocha-porches",
      "facts_verified": [
        "Forte e Capela de Nossa Senhora da Rocha as a municipal heritage site",
        "Location in Porches",
        "Classification as Imovel de Interesse Publico since 1963"
      ]
    },
    {
      "source_name": "Camara Municipal de Lagoa - temporary road-circulation closure notice",
      "source_url": "https://www.cm-lagoa.pt/evento/interdicao-temporaria-de-circulacao-rodoviaria-risco-de-derrocada",
      "facts_verified": [
        "Temporary road-circulation closure at Praia da Senhora da Rocha from 9 to 27 February 2026",
        "Rockfall-risk reason for the closure",
        "Municipal safety guidance to follow existing signage"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Cova Redonda - Porches",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-cova-redonda-porches",
      "facts_verified": [
        "Nearby Praia da Cova Redonda",
        "Location in Porches, Lagoa",
        "Position east of Praia da Senhora da Rocha",
        "High cliff setting and long staircase access"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia do Vale do Olival - Alporchinhos",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-vale-do-olival-alporchinhos",
      "facts_verified": [
        "Nearby Praia do Vale do Olival",
        "Location at the western end of Praia de Armacao de Pera",
        "Cliff-side trail with sea views and pedestrian connection to Praia dos Beijinhos"
      ]
    },
    {
      "source_name": "Junta de Freguesia de Porches - Turismo",
      "source_url": "https://www.jf-porches.pt/freguesia/2-turismo/0",
      "facts_verified": [
        "Capela da Nossa Senhora da Rocha listed among Porches places to visit",
        "Praia da Senhora da Rocha, Praia Nova and Praia de Albandeira listed among Porches coastal places"
      ]
    },
    {
      "source_name": "AlgarveOfficial internal published listings",
      "source_url": "https://algarveofficial.com/listing/praia-da-senhora-da-rocha-lagoa",
      "facts_verified": [
        "Nearby beach cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026",
        "Approximate nearby distances calculated from internal listing coordinates"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, chapel/headland setting, cliff landscape, Praia Nova tunnel, listed facilities, coordinates and 2026 Blue Flag status were verified from official tourism, municipal, ABAAE and Diario da Republica sources.",
    "ABAAE verifies Senhora da Rocha's 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time checked on 18 May 2026, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "A Lagoa municipal notice confirms temporary road-circulation closure from 9 to 27 February 2026 due to rockfall risk. Because this was a past date range, public wording advises visitors to check current access instead of stating that the beach is currently closed.",
    "Facilities are included only where listed by official sources and marked seasonal or verify locally where operation may depend on bathing season, concessions, sea conditions or access restrictions.",
    "Accessibility is verified at recognition level through VisitPortugal, but current route details, adapted equipment, toilets and assisted bathing should be confirmed before visiting.",
    "Nearby restaurants and attractions are intentionally left to internal published AlgarveOfficial business/attraction cards generated by the app; no external competitor website cards were added.",
    "No third-party review, booking, map or social media platform names were used in the public listing text."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00"
}
$json$;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-da-senhora-da-rocha-lagoa'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-senhora-da-rocha-lagoa not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         latitude = 37.097206,
         longitude = -8.385787,
         meta_title = 'Praia da Senhora da Rocha, Lagoa | Beach Guide',
         meta_description = 'Praia da Senhora da Rocha in Lagoa is a small cliff cove below the chapel headland with tunnel access, services and 2026 Blue Flag status.',
         category_data = coalesce(category_data, '{}'::jsonb)
           || v_patch
           || jsonb_build_object(
             'localized_content',
             coalesce(category_data->'localized_content', '{}'::jsonb)
             || jsonb_build_object('en', v_patch)
           ),
         updated_at = now()
   where id = v_listing_id;

  update public.listing_images
     set alt_text = 'Nossa Senhora da Rocha chapel headland above the sandy beach cove'
   where id = '70b29f5d-3d3f-4154-a25f-0c832be9bca7'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia da Senhora da Rocha cove with beach umbrellas and small boats'
   where id = 'b6d731c9-ac02-4bb3-844d-48dff842de4a'
     and listing_id = v_listing_id;
end $$;

commit;
