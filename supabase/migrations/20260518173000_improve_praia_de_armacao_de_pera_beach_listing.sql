begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Armação de Pêra",
  "slug": "praia-de-armacao-de-pera-silves",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Armação de Pêra",
  "concelho": "Silves",
  "municipality": "Silves",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Armação de Pêra is a large urban beach in Silves, fronting the resort town of Armação de Pêra. Official sources verify its extensive sand, fishing-beach section, seasonal services, accessible-beach recognition and 2026 Blue Flag status.",
  "full_description": "Praia de Armação de Pêra is the main beach of Armação de Pêra, in the municipality of Silves. VisitPortugal describes the town as a former small fishing village that is now one of the Algarve's busiest localities, with varied tourist facilities and an extensive sandy beach directly in front of the older part of town.\n\nThe beach has a practical urban character rather than a secluded natural feel. The town, promenade areas, restaurants, accommodation and beach services sit close behind the sand, making it convenient for visitors staying in Armação de Pêra or nearby parts of Silves and Lagoa. The eastern part of the sand is identified by VisitPortugal as Praia dos Pescadores, reflecting the local fishing activity that remains part of the beach setting.\n\nOfficial sources list beach services including surveillance, sunshade rental, light boat rental, parking, bars, restaurants and accessible-beach recognition. ABAAE verifies Armação de Pêra as a 2026 Blue Flag coastal beach, and Diário da República lists the 2026 bathing season from 1 June to 30 September.\n\nVisitors should plan around the beach's urban demand in summer, respect working fishing areas, and follow local flags, signage and lifeguard instructions. For a broader coastal day, internal AlgarveOfficial listings nearby include Praia da Senhora da Rocha to the west and Praia dos Salgados to the east.",
  "highlights": [
    "Large urban sandy beach in Armação de Pêra, municipality of Silves",
    "Extensive town-front beach listed by VisitPortugal",
    "Eastern section identified as Praia dos Pescadores",
    "Parking, bars, restaurants, rentals and accessible-beach recognition listed by VisitPortugal",
    "2026 Blue Flag status verified by ABAAE",
    "Nearby internal AlgarveOfficial beach listings include Senhora da Rocha and Salgados"
  ],
  "best_time_to_visit": "June to September matches the official 2026 bathing season and the main seasonal beach-service period. May, June and September are practical for beach walks and town access with less heat than peak midsummer. In July and August, arrive earlier where possible because this is a central urban beach, and always check local flags before swimming or using seasonal nautical services.",
  "parking_info": "VisitPortugal lists parking for Praia de Armação de Pêra. Current capacity, payment conditions, traffic restrictions and the most convenient access point were not independently verified during this review.",
  "accessibility_info": "VisitPortugal lists Praia de Armação de Pêra as an accessible beach. Current step-free route details, adapted equipment, accessible toilets and assisted-bathing arrangements were not independently verified; visitors with reduced mobility should confirm the best access point before travelling.",
  "lifeguard_info": "Diário da República lists Armação de Pêra as a 2026 bathing beach from 1 June to 30 September, and VisitPortugal lists safety or surveillance. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 via ABAAE. The official ABAAE page lists the Blue Flag season from 1 June to 30 September 2026 and showed the flag as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "1 June 2026 to 30 September 2026",
    "notes": "Diário da República qualifies Armação de Pêra as a bathing beach for this period, and VisitPortugal lists safety or surveillance. Exact daily staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.100591%2C-8.356549",
  "coordinates": {
    "latitude": 37.100591,
    "longitude": -8.356549,
    "source": "ABAAE official Armação de Pêra beach entry."
  },
  "latitude": 37.100591,
  "longitude": -8.356549,
  "beach_type": "Large sandy urban maritime beach",
  "landscape": "A broad sandy beach in a wide urban bay, backed by the Armação de Pêra seafront, town services and the fishing-beach section at the eastern end.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Parking is listed, but current access conditions and peak-season traffic arrangements should be checked locally.",
  "facilities": [
    { "name": "Blue Flag 2026", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "1 June to 30 September 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Accessible beach recognition listed by VisitPortugal", "status": "Verified recognition / current support should be checked" },
    { "name": "Parking", "status": "Verified by VisitPortugal / current conditions not verified" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal / conditions dependent" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / seasonal operation should be checked" },
    { "name": "Showers", "status": "Not verified for this review" }
  ],
  "includes": [
    "2026 Blue Flag status verified by ABAAE",
    "Seasonal surveillance listed by VisitPortugal",
    "Parking listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "Bars and restaurants listed by VisitPortugal",
    "Sunshade and light boat rental listed by VisitPortugal"
  ],
  "important_information": {
    "best_time_to_visit": "June to September matches the official 2026 bathing season and the main seasonal beach-service period. May, June and September are practical for beach walks and town access with less heat than peak midsummer. In July and August, arrive earlier where possible because this is a central urban beach, and always check local flags before swimming or using seasonal nautical services.",
    "know_before_you_go": "ABAAE verifies Armação de Pêra as a 2026 Blue Flag beach. Diário da República lists the 2026 bathing season from 1 June to 30 September. VisitPortugal lists parking, surveillance, rentals, bars, restaurants and accessible-beach recognition, but current daily staffing, adapted support, parking conditions and concession operation should be checked locally.",
    "notes": [
      "ABAAE lists the 2026 bathing season and Blue Flag season as 1 June to 30 September.",
      "Diário da República lists Armação de Pêra as a 2026 bathing beach from 1 June to 30 September.",
      "VisitPortugal lists parking, surveillance, sunshade rental, light boat rental, bar, restaurant and accessible-beach recognition.",
      "Current daily lifeguard staffing, adapted equipment, parking payment and access restrictions were not independently verified.",
      "The eastern section is associated with fishing activity; visitors should respect working boats, equipment and signed areas.",
      "Sea conditions can vary; use local flags and signage before entering the water."
    ]
  },
  "important_notes": "ABAAE verifies Armação de Pêra as a 2026 Blue Flag beach, and Diário da República lists the 2026 bathing season from 1 June to 30 September. VisitPortugal lists parking, surveillance, rentals, bars, restaurants and accessible-beach recognition. Current parking conditions, daily lifeguard staffing and adapted support should be checked locally.",
  "suitable_for": [
    "Visitors staying in Armação de Pêra",
    "Beachgoers wanting a large serviced urban beach",
    "Families using supervised seasonal areas",
    "Visitors who value restaurants and town services nearby",
    "Beach walkers",
    "Accessible-beach users, subject to current confirmation"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors wanting a quiet wild cove in peak summer",
    "Visitors requiring accessibility support without confirming current arrangements",
    "Anyone planning to ignore fishing areas, boat activity or local safety signage",
    "Visitors expecting guaranteed calm sea conditions"
  ],
  "best_for": [
    "Urban beach days",
    "Town access",
    "Restaurants nearby",
    "Long beach walks",
    "Fishing heritage",
    "Accessible-beach recognition, subject to current confirmation"
  ],
  "nearby_beaches": [
    {
      "name": "Praia da Senhora da Rocha",
      "type": "Nearby beach",
      "distance": "~2.6 km",
      "description": "A published AlgarveOfficial cliff-cove listing west of Armação de Pêra.",
      "href": "/listing/praia-da-senhora-da-rocha-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia dos Salgados",
      "type": "Nearby beach",
      "distance": "~2.8 km",
      "description": "A published AlgarveOfficial beach listing east of Armação de Pêra near the Salgados coastal area.",
      "href": "/listing/praia-dos-salgados-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Albandeira",
      "type": "Nearby beach",
      "distance": "~4.0 km",
      "description": "A published AlgarveOfficial small natural cliff-cove listing on the Lagoa coast.",
      "href": "/listing/praia-da-albandeira-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Galé",
      "type": "Nearby beach",
      "distance": "~4.2 km",
      "description": "A published AlgarveOfficial Albufeira beach listing east of Salgados.",
      "href": "/listing/praia-da-gale-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Marinha",
      "type": "Nearby beach",
      "distance": "~5.1 km",
      "description": "A published AlgarveOfficial Lagoa beach listing and official Seven Hanging Valleys route endpoint.",
      "href": "/listing/praia-da-marinha-lagoa",
      "verification_status": "Verified internal listing"
    }
  ],
  "nearby_restaurants": [
    {
      "name": "The Sea Wolf",
      "type": "Restaurant",
      "distance": "~0.1 km",
      "description": "Published AlgarveOfficial restaurant listing close to Praia de Armação de Pêra, based on stored listing coordinates.",
      "href": "/listing/the-sea-wolf-vale-do-lobo",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Restaurante Praia Dourada",
      "type": "Restaurant",
      "distance": "~0.2 km",
      "description": "Published AlgarveOfficial restaurant listing close to Praia de Armação de Pêra, based on stored listing coordinates.",
      "href": "/listing/restaurante-praia-dourada-almancil",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Aladin Grill",
      "type": "Restaurant",
      "distance": "~1.9 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia de Armação de Pêra, based on stored listing coordinates.",
      "href": "/listing/aladin-grill-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Restaurante Ocean",
      "type": "Restaurant",
      "distance": "~2.0 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia de Armação de Pêra, based on stored listing coordinates.",
      "href": "/listing/restaurante-ocean-almancil",
      "verification_status": "Verified internal listing"
    }
  ],
  "nearby_attractions": [
    {
      "name": "Tridente Boat Trips",
      "type": "Experience",
      "distance": "~0.1 km",
      "description": "Published AlgarveOfficial experience listing close to Praia de Armação de Pêra, based on stored listing coordinates.",
      "href": "/listing/tridente-boat-trips-almancil",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Blue Xperiences SUP & Surf School",
      "type": "Experience",
      "distance": "~0.3 km",
      "description": "Published AlgarveOfficial experience listing close to Praia de Armação de Pêra, based on stored listing coordinates.",
      "href": "/listing/blue-xperiences-sup-surf-school-almancil",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Salgados Golf Course",
      "type": "Golf",
      "distance": "~2.7 km",
      "description": "Published AlgarveOfficial golf listing east of Armação de Pêra, based on stored listing coordinates.",
      "href": "/listing/salgados-golf-course",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Zoomarine Algarve, Portugal",
      "type": "Family attraction",
      "distance": "~4.8 km",
      "description": "Published AlgarveOfficial family-attraction listing inland from the Armação de Pêra and Salgados coast.",
      "href": "/listing/zoomarine-algarve-portugal-almancil",
      "verification_status": "Verified internal listing"
    }
  ],
  "walking_trails_nearby": [
    {
      "name": "Armação de Pêra beachfront walk",
      "description": "A practical town-front walk along the seafront and sand. VisitPortugal verifies the extensive beach and town-front setting.",
      "verification_status": "Verified with caution"
    },
    {
      "name": "Armação de Pêra to Salgados shoreline walk",
      "description": "A beach walk east towards the Salgados side when tide, heat, wind and local access conditions allow. Nearby Salgados is represented by an internal AlgarveOfficial listing.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Arrive earlier in July and August for easier access to the most convenient beach areas.",
    "Respect fishing boats and working maritime areas around Praia dos Pescadores.",
    "Confirm accessibility support before travelling if adapted equipment or assistance is required.",
    "Check local flags before swimming or using seasonal nautical services.",
    "Use internal AlgarveOfficial nearby cards for restaurants, attractions and beaches rather than external competitor links."
  ],
  "photography_notes": "Praia de Armação de Pêra is best photographed for its long sandy bay, town-front setting and fishing-beach section. Early morning is usually the most practical time for quieter seafront photographs.",
  "family_notes": "The beach can suit families using supervised seasonal sections because official sources list an extensive sandy beach, surveillance and town-front services. Families should still check flags, plan around summer demand and respect fishing or boat areas.",
  "safety_notes": "Sea conditions can vary. Follow local beach flags, signage and instructions from surveillance teams where present. Keep clear of working fishing areas, boat movement and any signed restrictions.",
  "accessibility_notes": "VisitPortugal lists Praia de Armação de Pêra as an accessible beach. Current adapted equipment, route details, toilets and assisted-bathing availability were not independently verified, so visitors with reduced mobility should confirm arrangements before travelling.",
  "faq_items": [
    {
      "question": "Where is Praia de Armação de Pêra?",
      "answer": "Praia de Armação de Pêra is in the town of Armação de Pêra, in the municipality of Silves, on the central Algarve coast."
    },
    {
      "question": "Is Praia de Armação de Pêra a Blue Flag beach?",
      "answer": "Yes. ABAAE verifies Armação de Pêra as a 2026 Blue Flag coastal beach, with the Blue Flag season listed from 1 June to 30 September 2026."
    },
    {
      "question": "Are there lifeguards at Praia de Armação de Pêra?",
      "answer": "Diário da República lists Armação de Pêra as a 2026 bathing beach from 1 June to 30 September, and VisitPortugal lists safety or surveillance. Exact daily lifeguard staffing was not independently verified."
    },
    {
      "question": "Is there parking at Praia de Armação de Pêra?",
      "answer": "VisitPortugal lists parking for Praia de Armação de Pêra. Current capacity, payment conditions and access restrictions were not independently verified."
    },
    {
      "question": "Is Praia de Armação de Pêra accessible?",
      "answer": "VisitPortugal lists Praia de Armação de Pêra as an accessible beach. Current route details, adapted equipment and assisted-bathing support should be confirmed locally before travelling."
    },
    {
      "question": "Are there restaurants near Praia de Armação de Pêra?",
      "answer": "Yes. VisitPortugal lists bars and restaurants for the beach, and AlgarveOfficial shows nearby published restaurant listings using internal listing links."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings?",
      "answer": "Nearby published AlgarveOfficial beach listings include Praia da Senhora da Rocha, Praia dos Salgados, Praia da Albandeira, Praia da Galé and Praia da Marinha."
    },
    {
      "question": "What is the best time to visit Praia de Armação de Pêra?",
      "answer": "June to September matches the official bathing season. May, June and September are practical for beach walks and town access with less heat than peak midsummer."
    }
  ],
  "image_gallery_notes": {
    "status": "Existing AlgarveOfficial/Supabase gallery retained after visual inspection on 18 May 2026. Alt text updated for both available images.",
    "duplicate_check": "No duplicate canonical image filenames or visually repeated gallery images were found during this review."
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Armação de Pêra",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-armacao-de-pera",
      "facts_verified": [
        "Beach name and maritime beach classification",
        "Location in Armação de Pêra, Silves",
        "Former fishing-village origin",
        "Armação de Pêra described as one of the Algarve's busiest localities",
        "Extensive sandy beach in front of the old town",
        "Eastern section known as Praia dos Pescadores",
        "Facilities including Blue Flag, safety or surveillance, sunshade rental, light boat rental, parking, bar, restaurant and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Armação de Pêra",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/armacao-de-pera/",
      "facts_verified": [
        "Official Armação de Pêra coastal beach entry",
        "Municipality of Silves",
        "Coordinates 37.100591, -8.356549",
        "Beach code PTCN7V",
        "2026 bathing season from 1 June to 30 September",
        "2026 Blue Flag season from 1 June to 30 September",
        "Blue Flag shown as not hoisted at time checked"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Armação de Pêra listed among Silves 2026 Blue Flag locations",
        "Praia Grande Poente also listed among Silves 2026 Blue Flag locations"
      ]
    },
    {
      "source_name": "Diario da Republica - Portaria n.º 204-A/2026/1",
      "source_url": "https://files.diariodarepublica.pt/1s/2026/04/08401/0000200039.pdf",
      "facts_verified": [
        "Armação de Pêra bathing water code PTCN7V",
        "Official 2026 bathing season from 1 June to 30 September",
        "Barcos / Armação de Pêra Nascente also listed for Silves in the 2026 bathing season"
      ]
    },
    {
      "source_name": "APA - Armação de Pêra beach monitoring page",
      "source_url": "https://rmsl.apambiente.pt/content/arma%C3%A7%C3%A3o-de-p%C3%AAra",
      "facts_verified": [
        "Beach code PTCN7V",
        "Coordinates 37.101460000, -8.366030000 for APA monitoring",
        "Municipality of Silves",
        "Bathing beach name Armação de Pêra",
        "Bathing season shown as 01 June to 30 September",
        "Limited-use status shown as No"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia Grande - Pêra",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-grande-pera",
      "facts_verified": [
        "Nearby Praia Grande - Pêra east of the urban Armação de Pêra area",
        "Boundary context between Ribeira de Alcantarilha and Lagoa dos Salgados",
        "Salgados Lagoon ecological context"
      ]
    },
    {
      "source_name": "AlgarveOfficial internal published listings",
      "source_url": "https://algarveofficial.com/listing/praia-de-armacao-de-pera-silves",
      "facts_verified": [
        "Nearby beach, restaurant and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026",
        "Approximate nearby distances calculated from internal listing coordinates"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, extensive sandy beach, fishing-section context, listed facilities, coordinates and 2026 Blue Flag status were verified from official tourism, ABAAE, Diario da Republica and APA sources.",
    "ABAAE verifies Armação de Pêra's 2026 bathing season and Blue Flag season as 1 June 2026 to 30 September 2026.",
    "At the time checked on 18 May 2026, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "VisitPortugal lists accessible-beach recognition, but current route details, adapted equipment, toilets and assisted bathing were not independently verified.",
    "Parking is verified only at the level that VisitPortugal lists parking. Payment, capacity and current restrictions were not independently verified.",
    "Showers and named external restaurants were not added because they were not verified from the official sources used for this review.",
    "Nearby beaches, restaurants and attractions in card sections use only internal published AlgarveOfficial listings. Some nearby business listing slugs include legacy locality names; cards are still internal published listings and are shown based on stored coordinates.",
    "No external competitor website CTA was retained; website_url and google_business_url are cleared for this beach listing."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00"
}
$json$;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-armacao-de-pera-silves'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-armacao-de-pera-silves not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         latitude = 37.100591,
         longitude = -8.356549,
         meta_title = 'Praia de Armação de Pêra, Silves | Beach Guide',
         meta_description = 'Praia de Armação de Pêra in Silves is a large urban beach with extensive sand, services, fishing heritage and verified 2026 Blue Flag status.',
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
     set alt_text = 'Praia de Armação de Pêra sandy shoreline beside the town seafront'
   where id = 'fde92fce-1db4-4b01-afd2-4008b1727d60'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Aerial view of Praia de Armação de Pêra and the urban beachfront'
   where id = 'f75edf4b-eba1-4bdc-b374-496a658ebac8'
     and listing_id = v_listing_id;
end $$;

commit;
