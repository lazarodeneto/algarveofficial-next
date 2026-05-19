begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Galé",
  "slug": "praia-da-gale-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Galé / Guia, Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Galé is a large sandy beach west of Albufeira, divided into Galé-Leste and Galé-Oeste. Official sources verify its golden cliffs, rock formations, outdoor parking, beach services, accessible-beach recognition and 2026 Blue Flag status for both sections.",
  "full_description": "Praia da Galé is a broad maritime beach in western Albufeira, close to Galé and Guia. VisitPortugal describes the long sandy beach as divided into two sections, Galé-Leste and Galé-Oeste, because of the different access points from the parking area.\n\nThe beach combines open sand with low golden cliffs and natural rock formations. Galé-Leste has the more visible rocky scenery and small sandy corners, while Galé-Oeste opens into a wider, more continuous stretch of sand towards Praia dos Salgados. This gives the beach a practical balance: it works for longer beach walks and serviced summer beach days, while still keeping a more spacious feel than Albufeira's compact cliff coves.\n\nVisitPortugal lists Blue Flag recognition, surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant, windsurfing, sailing and accessible-beach status. ABAAE lists both Galé-Leste and Galé-Oeste among Albufeira's 2026 Blue Flag locations, and Diário da República lists both bathing waters for the 2026 bathing season from 15 May to 15 October.\n\nVisitors should still treat services as seasonal, check local beach flags before swimming or using water-sports services, and take care around rocks and low cliff sections. Internal AlgarveOfficial listings nearby include Praia dos Salgados, Praia de São Rafael and Praia de Armação de Pêra.",
  "highlights": [
    "Large sandy beach west of Albufeira, close to Galé and Guia",
    "Two recognised sections: Galé-Leste and Galé-Oeste",
    "Golden cliffs and natural rock formations verified by VisitPortugal",
    "Outdoor parking, showers, bar, restaurant and rentals listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "2026 Blue Flag status verified for Galé-Leste and Galé-Oeste via ABAAE"
  ],
  "best_time_to_visit": "The official 2026 bathing season for Galé-Leste and Galé-Oeste runs from 15 May to 15 October. June to September is the main period for seasonal beach services, while May, June and September are practical for beach walks, lower heat and easier access planning. Early morning and late afternoon are useful for softer light around the low cliffs and rock formations. Check wind, tide and local beach flags before swimming or using water-sports services.",
  "parking_info": "VisitPortugal lists outdoor parking for Praia da Galé and describes the beach sections as linked to different access points from the car park. Current capacity, payment conditions, traffic restrictions and the best access point for each section were not independently verified during this review.",
  "accessibility_info": "VisitPortugal lists Praia da Galé as an accessible beach. Visit Albufeira describes paved paths to the sand at Galé-Leste and nearby paths from parking areas at Galé-Oeste. Current beach-level step-free access, adapted equipment, accessible toilets and assisted-bathing support were not independently verified; visitors with reduced mobility should confirm the most suitable section before travelling.",
  "lifeguard_info": "Diário da República lists both Galé-Leste and Galé-Oeste as 2026 bathing beaches from 15 May to 15 October, and VisitPortugal lists safety or surveillance. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 via ABAAE for both Galé-Leste and Galé-Oeste. The official ABAAE pages list the Blue Flag season from 1 July to 30 September 2026 and showed the flags as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "15 May 2026 to 15 October 2026",
    "notes": "Diário da República qualifies Galé-Leste and Galé-Oeste as bathing beaches for this period, and VisitPortugal lists safety or surveillance. Exact daily staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.08062%2C-8.316371",
  "coordinates": {
    "latitude": 37.08062,
    "longitude": -8.316371,
    "source": "ABAAE official Galé-Leste beach entry. Galé-Oeste is separately listed by ABAAE at 37.084899, -8.323002."
  },
  "latitude": 37.08062,
  "longitude": -8.316371,
  "coordinate_points": [
    {
      "name": "Galé-Leste",
      "latitude": 37.08062,
      "longitude": -8.316371,
      "verification_status": "Verified via ABAAE"
    },
    {
      "name": "Galé-Oeste",
      "latitude": 37.084899,
      "longitude": -8.323002,
      "verification_status": "Verified via ABAAE"
    }
  ],
  "beach_type": "Large sandy maritime beach with two recognised sections",
  "landscape": "A broad sandy beach backed by low golden cliffs and rock formations, with a more open sandy character towards Galé-Oeste and Praia dos Salgados.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot and explains that access from the parking area differentiates the East and West sections. Visit Albufeira describes Galé-Leste access by paved paths and Galé-Oeste access by nearby parking areas and paths to the sand. Current access conditions should be checked locally.",
  "facilities": [
    { "name": "Blue Flag 2026 for Galé-Leste", "status": "Verified / seasonal display" },
    { "name": "Blue Flag 2026 for Galé-Oeste", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "15 May to 15 October 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Accessible beach recognition listed by VisitPortugal", "status": "Verified recognition / current support should be checked" },
    { "name": "Outdoor parking", "status": "Verified by VisitPortugal / current conditions not verified" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Small craft hire", "status": "Seasonal / conditions dependent" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / seasonal operation should be checked" },
    { "name": "Windsurfing", "status": "Conditions dependent" },
    { "name": "Sailing", "status": "Conditions dependent" }
  ],
  "includes": [
    "2026 Blue Flag status verified for Galé-Leste and Galé-Oeste",
    "Seasonal surveillance listed by VisitPortugal",
    "Outdoor parking listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "Bars, restaurants, showers and rentals listed by VisitPortugal",
    "Two official ABAAE coordinate points for the East and West sections"
  ],
  "important_information": {
    "best_time_to_visit": "The official 2026 bathing season for Galé-Leste and Galé-Oeste runs from 15 May to 15 October. June to September is the main period for seasonal beach services, while May, June and September are practical for beach walks, lower heat and easier access planning. Early morning and late afternoon are useful for softer light around the low cliffs and rock formations. Check wind, tide and local beach flags before swimming or using water-sports services.",
    "know_before_you_go": "ABAAE verifies both Galé-Leste and Galé-Oeste as 2026 Blue Flag beaches. Diário da República lists the 2026 bathing season from 15 May to 15 October for both sections. VisitPortugal lists parking, surveillance, showers, rentals, bar, restaurant, nautical activities and accessible-beach recognition, but current daily staffing, adapted support, parking conditions and concession operation should be checked locally.",
    "notes": [
      "ABAAE lists the 2026 Blue Flag season for Galé-Leste and Galé-Oeste as 1 July to 30 September.",
      "Diário da República lists both Galé-Leste and Galé-Oeste as 2026 bathing beaches from 15 May to 15 October.",
      "VisitPortugal lists outdoor parking, surveillance, showers, rentals, bar, restaurant, windsurfing, sailing and accessible-beach recognition.",
      "Current daily lifeguard staffing, adapted equipment, parking payment and access restrictions were not independently verified.",
      "ABAAE's Galé-Oeste page displayed a 2025 bathing-season line when checked, but Diário da República confirms the 2026 bathing season; this conflict is documented in verification notes.",
      "Visitors should avoid sitting close to cliff bases and should take care around rocks and water-sports zones."
    ]
  },
  "important_notes": "ABAAE verifies Galé-Leste and Galé-Oeste as 2026 Blue Flag beaches, and Diário da República lists both sections for the 2026 bathing season from 15 May to 15 October. VisitPortugal lists parking, surveillance, showers, rentals, bars, restaurants and accessible-beach recognition. Current parking conditions, daily lifeguard staffing and adapted support should be checked locally.",
  "suitable_for": [
    "Visitors staying in Galé, Guia or western Albufeira",
    "Beachgoers wanting a large serviced sandy beach",
    "Families using supervised seasonal areas",
    "Long beach walks",
    "Accessible-beach users, subject to current confirmation",
    "Water-sports users when conditions are suitable",
    "Photography around low cliffs and rock formations"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors wanting a small sheltered cove only",
    "Visitors requiring accessibility support without confirming current arrangements",
    "Anyone planning to climb rock formations or sit below cliff faces",
    "Visitors expecting guaranteed calm sea conditions"
  ],
  "best_for": [
    "Large sandy beach days",
    "Families using supervised areas",
    "Long beach walks",
    "Rock formation scenery",
    "Accessible-beach recognition, subject to current confirmation",
    "Water sports when conditions are suitable"
  ],
  "nearby_beaches": [
    {
      "name": "Praia dos Salgados",
      "type": "Nearby beach",
      "distance": "~1.4 km",
      "description": "A published AlgarveOfficial beach listing west of Praia da Galé, beside the Salgados Lagoon.",
      "href": "/listing/praia-dos-salgados-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia de São Rafael",
      "type": "Nearby beach",
      "distance": "~3.2 km",
      "description": "A published AlgarveOfficial Albufeira beach listing east of the Galé area.",
      "href": "/listing/praia-de-sao-rafael-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia de Armação de Pêra",
      "type": "Nearby beach",
      "distance": "~4.2 km",
      "description": "A published AlgarveOfficial urban beach listing west of Galé in the municipality of Silves.",
      "href": "/listing/praia-de-armacao-de-pera-silves",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia do Peneco",
      "type": "Nearby beach",
      "distance": "~5.8 km",
      "description": "A published AlgarveOfficial central Albufeira beach listing below the old town.",
      "href": "/listing/praia-do-peneco-albufeira",
      "verification_status": "Verified internal listing"
    }
  ],
  "nearby_restaurants": [
    {
      "name": "Vila Joya Sea",
      "type": "Restaurant",
      "distance": "~0.2 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia da Galé, based on stored listing coordinates.",
      "href": "/listing/vila-joya-sea-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Paper Moon Algarve",
      "type": "Restaurant",
      "distance": "~1.4 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia da Galé, based on stored listing coordinates.",
      "href": "/listing/paper-moon-algarve-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Restaurante São Domingos, Galé, Albufeira",
      "type": "Restaurant",
      "distance": "~1.4 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia da Galé, based on stored listing coordinates.",
      "href": "/listing/restaurante-sao-domingos-gale-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "A Casa do Avô",
      "type": "Restaurant",
      "distance": "~2.4 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia da Galé, based on stored listing coordinates.",
      "href": "/listing/a-casa-do-avo-albufeira",
      "verification_status": "Verified internal listing"
    }
  ],
  "nearby_attractions": [
    {
      "name": "Surf School - Albufeira Surf & Sup",
      "type": "Experience",
      "distance": "~0.1 km",
      "description": "Published AlgarveOfficial experience listing beside the Galé beach area, based on stored listing coordinates.",
      "href": "/listing/albufeira-surf-sup-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Salgados Golf Course",
      "type": "Golf",
      "distance": "~1.9 km",
      "description": "Published AlgarveOfficial golf listing inland from the Galé and Salgados beach area.",
      "href": "/listing/salgados-golf-course",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Dolphin Emotions by Zoomarine",
      "type": "Family attraction",
      "distance": "~5.0 km",
      "description": "Published AlgarveOfficial family-attraction listing inland from Galé and Guia.",
      "href": "/listing/dolphin-emotions-by-zoomarine-almancil",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Zoomarine Algarve, Portugal",
      "type": "Family attraction",
      "distance": "~5.2 km",
      "description": "Published AlgarveOfficial family-attraction listing inland from Galé and Guia.",
      "href": "/listing/zoomarine-algarve-portugal-almancil",
      "verification_status": "Verified internal listing"
    }
  ],
  "walking_trails_nearby": [
    {
      "name": "Galé to Salgados shoreline walk",
      "description": "A practical beach walk west from Galé-Oeste towards Praia dos Salgados, best planned according to tide, sea state and weather conditions.",
      "verification_status": "Verified from beach geography and internal listing coordinates"
    }
  ],
  "visitor_tips": [
    "Choose Galé-Leste for more visible rock formations and Galé-Oeste for a wider, more open sandy section.",
    "Confirm the most suitable parking and access point before travelling, especially in summer.",
    "Confirm accessible-beach support before travelling if adapted equipment or assistance is required.",
    "Check beach flags before swimming or using water-sports services.",
    "Use care around rocks and low cliffs, particularly with children.",
    "For a longer outing, combine Galé with Praia dos Salgados when tide and conditions allow."
  ],
  "photography_notes": "Praia da Galé photographs well for its contrast between broad sand, low golden cliffs and rock formations. Early morning and late afternoon are usually the most useful times for softer light around Galé-Leste and the broader Galé-Oeste shoreline.",
  "family_notes": "Praia da Galé can suit families because of its large sandy area, official services and accessible-beach recognition. Families should use supervised seasonal sections, check flags, and supervise children closely around rocks, low cliffs and water-sports zones.",
  "safety_notes": "Sea and wind conditions can vary. Follow local beach flags, signage and instructions from surveillance teams where present. Keep a safe distance from cliff bases and take care around rocks, especially when the tide changes.",
  "accessibility_notes": "VisitPortugal lists Praia da Galé as an accessible beach. Visit Albufeira describes paved paths at Galé-Leste and nearby paths from parking areas at Galé-Oeste. Current adapted equipment, accessible toilets, beach gradient and assisted bathing should be confirmed locally before visiting.",
  "faq_items": [
    {
      "question": "Where is Praia da Galé?",
      "answer": "Praia da Galé is in the municipality of Albufeira, west of the city centre, close to Galé and Guia."
    },
    {
      "question": "Is there parking at Praia da Galé?",
      "answer": "VisitPortugal lists outdoor parking for Praia da Galé, and describes the East and West sections as linked to different access points from the car park. Current capacity and payment conditions were not independently verified."
    },
    {
      "question": "Are there lifeguards at Praia da Galé?",
      "answer": "Diário da República lists Galé-Leste and Galé-Oeste as 2026 bathing beaches from 15 May to 15 October, and VisitPortugal lists safety or surveillance. Exact daily staffing should be checked locally."
    },
    {
      "question": "Is Praia da Galé a Blue Flag beach?",
      "answer": "Yes. ABAAE lists both Galé-Leste and Galé-Oeste among Albufeira's 2026 Blue Flag coastal beach locations, with the Blue Flag season from 1 July to 30 September 2026."
    },
    {
      "question": "Is Praia da Galé accessible for visitors with reduced mobility?",
      "answer": "VisitPortugal lists Praia da Galé as an accessible beach. Current adapted equipment, assisted bathing, beach gradient and the best access point should be confirmed before travelling."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings to Praia da Galé?",
      "answer": "Nearby internal AlgarveOfficial beach listings include Praia dos Salgados, Praia de São Rafael, Praia de Armação de Pêra and Praia do Peneco."
    },
    {
      "question": "Are there restaurants near Praia da Galé?",
      "answer": "VisitPortugal lists bars and restaurants for Praia da Galé. Nearby internal AlgarveOfficial restaurant listings include Vila Joya Sea, Paper Moon Algarve, Restaurante São Domingos and A Casa do Avô."
    },
    {
      "question": "What is the best time to visit Praia da Galé?",
      "answer": "The official 2026 bathing season runs from 15 May to 15 October. June to September is the main seasonal beach-service period, while May, June and September are practical for walks, access planning and lower heat."
    }
  ],
  "seo": {
    "meta_title": "Praia da Galé, Albufeira | Beach Guide",
    "meta_description": "Praia da Galé in Albufeira is a large sandy beach with Galé-Leste and Galé-Oeste sections, services, parking, accessibility recognition and 2026 Blue Flag status.",
    "keywords": [
      "Praia da Galé",
      "Gale Beach",
      "Galé-Leste",
      "Galé-Oeste",
      "Albufeira beaches",
      "Guia beaches",
      "Algarve beaches",
      "Blue Flag Galé",
      "accessible beach Albufeira",
      "Praia dos Salgados nearby"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Galé",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/D3060CF1-B43A-46DE-B32A-CF7C1ABD3A89",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Albufeira",
        "Long sandy beach divided into East and West sections by access from the car park",
        "Golden cliffs and rock formations",
        "Nearby restaurants and bars",
        "Facilities including Blue Flag, surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant, windsurfing, sailing and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "Visit Albufeira - Galé Beach East",
      "source_url": "https://visitalbufeira.pt/praia/praia-da-gale-leste",
      "facts_verified": [
        "Galé-Leste official tourism page",
        "Broad sandy section",
        "Low rounded cliffs",
        "Paved paths to the sand",
        "Beach walk and family-use context"
      ]
    },
    {
      "source_name": "Visit Albufeira - Galé Beach West",
      "source_url": "https://visitalbufeira.pt/praia/praia-da-gale-oeste",
      "facts_verified": [
        "Galé-Oeste official tourism page",
        "Wide uninterrupted sandy stretch",
        "Low smooth cliffs and golden sediment layers",
        "Nearby parking areas and paths to the sand",
        "Beach walk and family-use context"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galé-Leste",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/gale-leste/",
      "facts_verified": [
        "Official Galé-Leste beach entry",
        "Municipality of Albufeira",
        "Coordinates",
        "Beach code PTCP8F",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Flag shown as not hoisted at time checked"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galé-Oeste",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/gale-oeste/",
      "facts_verified": [
        "Official Galé-Oeste beach entry",
        "Municipality of Albufeira",
        "Coordinates",
        "Beach code PTCE9X",
        "2026 Blue Flag season",
        "Flag shown as not hoisted at time checked"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Galé-Leste listed among Albufeira's 2026 Blue Flag locations",
        "Galé-Oeste listed among Albufeira's 2026 Blue Flag locations",
        "Nearby Albufeira Blue Flag locations including Salgados and São Rafael"
      ]
    },
    {
      "source_name": "Diario da Republica - Portaria n.º 204-A/2026/1",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728",
      "facts_verified": [
        "Galé-Leste bathing water code PTCP8F",
        "Galé-Oeste bathing water code PTCE9X",
        "Official 2026 bathing season from 15 May to 15 October for both sections",
        "Galé-Leste and Galé-Oeste listed in Albufeira, Algarve"
      ]
    },
    {
      "source_name": "AlgarveOfficial internal published listings",
      "source_url": "https://algarveofficial.com/listing/praia-da-gale-albufeira",
      "facts_verified": [
        "Nearby beach, restaurant and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026",
        "Approximate nearby distances calculated from internal listing coordinates"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, East and West section distinction, large sandy character, golden cliffs, rock formations, listed facilities, coordinates and 2026 Blue Flag status were verified from official tourism, ABAAE and Diario da Republica sources.",
    "ABAAE verifies Galé-Leste's 2026 bathing season as 15 May 2026 to 15 October 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "ABAAE verifies Galé-Oeste's 2026 Blue Flag season as 1 July 2026 to 30 September 2026. The individual Galé-Oeste page displayed a 2025 bathing-season line when checked, so the 2026 bathing-season dates are taken from Diario da Republica.",
    "At the time checked on 18 May 2026, ABAAE showed the Blue Flag as not hoisted for both sections, so Blue Flag status is treated as seasonal rather than permanently active.",
    "VisitPortugal lists accessible-beach recognition, but current route details, adapted equipment, toilets and assisted bathing were not independently verified.",
    "Parking is verified only at the level that VisitPortugal lists outdoor parking and that Visit Albufeira references nearby parking for Galé-Oeste. Payment, capacity and current restrictions were not independently verified.",
    "Nearby beaches, restaurants and attractions in card sections use only internal published AlgarveOfficial listings.",
    "No external competitor website CTA was retained; website_url and google_business_url are cleared for this beach listing."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00"
}
$json$;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-da-gale-albufeira'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-gale-albufeira not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         latitude = 37.08062,
         longitude = -8.316371,
         meta_title = 'Praia da Galé, Albufeira | Beach Guide',
         meta_description = 'Praia da Galé in Albufeira is a large sandy beach with East and West sections, parking, services, accessibility recognition and 2026 Blue Flag status.',
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
     set alt_text = 'Praia da Galé wide sandy beach at sunset from the dunes'
   where id = 'bd705a2d-3dc9-40c4-ba05-da4e464dc306'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia da Galé sandy cove with low rock formations'
   where id = '86efb63f-a673-4a69-8b1a-c3361df632f5'
     and listing_id = v_listing_id;
end $$;

commit;
