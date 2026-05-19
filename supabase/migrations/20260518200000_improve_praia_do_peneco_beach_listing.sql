begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Peneco",
  "slug": "praia-do-peneco-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Peneco is a central Albufeira beach, also known as Praia do Túnel, set below the old town beside Praia dos Pescadores. Official sources verify its tunnel access, urban-cliff setting, parking, seasonal support, accessible-beach recognition and 2026 Blue Flag status.",
  "full_description": "Praia do Peneco is a central maritime beach in Albufeira, set directly below the old town on the same urban seafront as Praia dos Pescadores. VisitPortugal identifies it as Praia do Túnel ou Peneco and describes access through a tunnel from the centre of Albufeira, with the beach forming part of the broad sandy strip between the city and the sea.\n\nThe beach is defined by its old-town access and cliff-framed urban setting. Visit Albufeira describes Peneco as the natural extension of Praia dos Pescadores, with a rock tunnel linking the historic centre to the sand and high cliffs forming part of the backdrop. It is a practical choice for visitors staying in central Albufeira who want beach time without leaving the historic centre area.\n\nOfficial sources verify a strong service base, while some details still need local confirmation. VisitPortugal lists safety or surveillance, parking, showers, bar, restaurant, sunshade rental, light boat rental, windsurfing and accessible-beach recognition. ABAAE verifies Peneco as a 2026 Blue Flag beach, with the bathing season from 15 May to 15 October and the Blue Flag season from 1 July to 30 September.\n\nVisitors should treat daily lifeguard staffing, concession opening, parking rules and accessibility support as seasonal or locally variable. Use the tunnel, official access points and local signage, take care around cliffs, steps and lift areas, and follow beach flags before entering the water. Nearby cards on AlgarveOfficial link only to already-published internal listings.",
  "highlights": [
    "Central Albufeira beach directly below the old town",
    "Also officially identified as Praia do Túnel ou Peneco",
    "Rock tunnel access from the historic centre verified by official tourism sources",
    "Parking, showers, bar, restaurant and seasonal surveillance listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "2026 Blue Flag status verified by ABAAE"
  ],
  "best_time_to_visit": "The official 2026 bathing season for Peneco runs from 15 May to 15 October. June to September is the main period for seasonal beach services, while May, June and September are practical for old-town beach walks and lower heat. Early morning is useful for a calmer central-beach visit, and late afternoon suits seafront views and photography. Check beach flags, wind and sea conditions before swimming or using water-sports services.",
  "parking_info": "VisitPortugal lists parking for Praia do Peneco, and the municipal beach page references parking in the old urban-centre access context. Current capacity, payment rules, traffic restrictions and the easiest parking approach were not independently verified during this review. Because Peneco is a central old-town beach, visitors should confirm local parking conditions before driving in peak periods.",
  "accessibility_info": "VisitPortugal lists Praia do Peneco as an accessible beach. Official local sources also reference old-town pedestrian access, tunnel access, stairs and lift/viewpoint context around Peneco. Current step-free route conditions, lift operation, beach wheelchair availability, accessible toilets and assisted bathing were not independently verified; visitors with reduced mobility should confirm the best current access point locally.",
  "lifeguard_info": "ABAAE lists the 2026 bathing season for Peneco from 15 May to 15 October, and VisitPortugal lists safety or surveillance. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 via ABAAE. The official ABAAE page lists the Blue Flag season from 1 July to 30 September 2026 and showed the flag as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "15 May 2026 to 15 October 2026",
    "notes": "ABAAE lists Peneco for this bathing-season period, and VisitPortugal lists safety or surveillance. Exact daily staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.088991%2C-8.252283",
  "coordinates": {
    "latitude": 37.088991,
    "longitude": -8.252283,
    "source": "ABAAE official Peneco beach entry."
  },
  "latitude": 37.088991,
  "longitude": -8.252283,
  "beach_code": "PTCL2Q",
  "beach_type": "Central urban maritime sandy beach",
  "landscape": "A sandy urban beach below Albufeira's old town, framed by cliffs and central seafront viewpoints, with the beach continuing towards Praia dos Pescadores.",
  "access": "VisitPortugal describes access through a tunnel in the centre of Albufeira and lists access by car, motorcycle and on foot. Official Albufeira tourism references the Rua 5 de Outubro tunnel, Peneco stairway and lift/viewpoint context. Current lift operation, stair access and any temporary restrictions should be checked locally.",
  "facilities": [
    { "name": "Blue Flag 2026", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "15 May to 15 October 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Accessible beach recognition listed by VisitPortugal", "status": "Verified recognition / current support should be checked" },
    { "name": "Parking", "status": "Verified by VisitPortugal / current conditions not verified" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / nearby opening should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Windsurfing", "status": "Conditions dependent" },
    { "name": "Beach wheelchair or assisted bathing", "status": "Not verified for current season" }
  ],
  "includes": [
    "2026 Blue Flag status verified by ABAAE",
    "2026 bathing season verified by ABAAE",
    "Seasonal surveillance listed by VisitPortugal",
    "Parking listed by VisitPortugal",
    "Showers, bar, restaurant and sunshade rental listed by VisitPortugal",
    "Internal nearby listing cards only"
  ],
  "important_information": {
    "best_time_to_visit": "The official 2026 bathing season for Peneco runs from 15 May to 15 October. June to September is the main period for seasonal beach services, while May, June and September are practical for old-town beach walks and lower heat.",
    "know_before_you_go": "ABAAE verifies Peneco as a 2026 Blue Flag beach. VisitPortugal lists parking, surveillance, showers, accessible-beach recognition, bar, restaurant, sunshade rental, light boat rental and windsurfing. Current daily staffing, concession operation, parking rules and accessibility support should be checked locally.",
    "notes": [
      "ABAAE lists the 2026 bathing season as 15 May to 15 October.",
      "ABAAE lists the 2026 Blue Flag season as 1 July to 30 September.",
      "VisitPortugal identifies the beach as Praia do Túnel ou Peneco and describes access through a tunnel in central Albufeira.",
      "VisitPortugal lists parking, surveillance, showers, accessible-beach recognition, bar, restaurant, sunshade rental, light boat rental and windsurfing.",
      "Current daily lifeguard staffing, accessible equipment, assisted bathing and parking rules were not independently verified.",
      "Visitors should take care around cliffs, steps, lift areas and busy old-town access points.",
      "Nearby card sections use only internal published AlgarveOfficial listings."
    ]
  },
  "important_notes": "ABAAE verifies Peneco as a 2026 Blue Flag beach, with the 2026 bathing season from 15 May to 15 October and the Blue Flag season from 1 July to 30 September. VisitPortugal lists parking, safety or surveillance, accessible-beach recognition, showers, bar, restaurant, sunshade rental, light boat rental and windsurfing. Current daily staffing, parking rules and accessibility support were not independently verified.",
  "suitable_for": [
    "Visitors staying in Albufeira old town",
    "Short central beach visits",
    "Families using supervised seasonal areas",
    "Visitors wanting restaurants and bars nearby",
    "Accessible-beach users, subject to current confirmation",
    "Old-town seafront walks",
    "Photography from the beach and nearby viewpoints"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors wanting a quiet natural cove in high season",
    "Visitors requiring confirmed assisted bathing without checking current arrangements",
    "Anyone relying on lift access without confirming current operation",
    "Visitors expecting guaranteed calm sea conditions"
  ],
  "best_for": [
    "Central Albufeira beach access",
    "Old-town beach visits",
    "Tunnel access",
    "Restaurants nearby",
    "Families using supervised seasonal areas",
    "Accessible-beach recognition, subject to current confirmation"
  ],
  "nearby_beaches": [
    {
      "name": "Praia dos Pescadores",
      "type": "Nearby internal beach listing",
      "distance": "Same central seafront",
      "description": "A published AlgarveOfficial central Albufeira beach listing beside Praia do Peneco, linked internally from this page.",
      "href": "/listing/praia-dos-pescadores-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia da Oura",
      "type": "Nearby internal beach listing",
      "distance": "~2.3 km",
      "description": "A published AlgarveOfficial Albufeira resort beach listing east of the old-town seafront.",
      "href": "/listing/praia-da-oura-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia de São Rafael",
      "type": "Nearby internal beach listing",
      "distance": "~3.0 km",
      "description": "A published AlgarveOfficial cliff-backed beach listing west of central Albufeira.",
      "href": "/listing/praia-de-sao-rafael-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia de Santa Eulália",
      "type": "Nearby internal beach listing",
      "distance": "~3.3 km",
      "description": "A published AlgarveOfficial Albufeira beach listing east of Praia do Peneco.",
      "href": "/listing/praia-de-santa-eulalia-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_restaurants": [
    {
      "name": "Restaurante Os Arcos",
      "type": "Restaurant",
      "distance": "~0.1 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia do Peneco, based on stored listing coordinates.",
      "href": "/listing/restaurante-os-arcos-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Ambrosio",
      "type": "Restaurant",
      "distance": "~0.1 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia do Peneco, based on stored listing coordinates.",
      "href": "/listing/ambrosio-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Taberna Saudade",
      "type": "Restaurant",
      "distance": "~0.2 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia do Peneco, based on stored listing coordinates.",
      "href": "/listing/taberna-saudade-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Casa da Fonte",
      "type": "Restaurant",
      "distance": "~0.2 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia do Peneco, based on stored listing coordinates.",
      "href": "/listing/casa-da-fonte-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Cabana Fresca",
      "type": "Restaurant",
      "distance": "~0.3 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia do Peneco, based on stored listing coordinates.",
      "href": "/listing/cabana-fresca-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_attractions": [
    {
      "name": "Coast and Country Tours",
      "type": "Experience",
      "distance": "~0.5 km",
      "description": "Published AlgarveOfficial experience listing near central Albufeira, based on stored listing coordinates.",
      "href": "/listing/coast-and-country-tours-almancil",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Algarve Charters",
      "type": "Experience",
      "distance": "~1.3 km",
      "description": "Published AlgarveOfficial experience listing near the Albufeira Marina area, based on stored listing coordinates.",
      "href": "/listing/algarve-charters-quinta-do-lago",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "X Ride Algarve",
      "type": "Experience",
      "distance": "~1.3 km",
      "description": "Published AlgarveOfficial experience listing near the Albufeira Marina area, based on stored listing coordinates.",
      "href": "/listing/x-ride-algarve-almancil",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Algarexperience",
      "type": "Experience",
      "distance": "~1.4 km",
      "description": "Published AlgarveOfficial experience listing near the Albufeira Marina area, based on stored listing coordinates.",
      "href": "/listing/algarexperience-almancil",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_towns": [
    "Albufeira",
    "Sesmarias",
    "Galé",
    "Guia",
    "Olhos de Água"
  ],
  "walking_trails_nearby": [
    {
      "name": "Urban Front Beaches",
      "description": "Visit Albufeira identifies the central urban beach context that includes Praia dos Pescadores, Praia do Peneco and Praia do Inatel. Route conditions and any access changes should be checked locally.",
      "verification_status": "Verified"
    },
    {
      "name": "Albufeira old-town seafront walk",
      "description": "A practical short walk around Praia do Peneco, Praia dos Pescadores, old-town access points and central viewpoints. Individual places are verified by official tourism sources, but route conditions should be checked locally.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Use the tunnel from the old-town side for the beach's most distinctive access point.",
    "Check local flags and signage before swimming or windsurfing.",
    "Confirm current parking conditions before driving into the old-town seafront area.",
    "Confirm the most suitable accessible route before travelling if step-free access or assistance is required.",
    "Use the internal nearby cards for published AlgarveOfficial restaurants and experiences around central Albufeira.",
    "Visit early or later in the day for a calmer central beach walk."
  ],
  "photography_notes": "Praia do Peneco is strongest for old-town coastal views, cliff-framed beach scenes, tunnel access context and broad sandy seafront perspectives. Early morning and late afternoon usually provide softer light across the bay.",
  "family_notes": "Praia do Peneco can suit families who want a central beach with facilities nearby and who use supervised seasonal areas. Families should still check beach flags, watch children around busy access points and confirm current access or assistance needs before travelling.",
  "safety_notes": "Sea and wind conditions can vary. Follow local beach flags, signage and instructions from surveillance teams where present. Take care around cliffs, steps, lift areas, water-sports zones and busy old-town access points.",
  "accessibility_notes": "VisitPortugal lists Praia do Peneco as an accessible beach. Current accessible route conditions, lift operation, assisted bathing, adapted equipment and accessible toilets were not independently verified; confirm locally before relying on accessibility support.",
  "gallery_notes": {
    "status": "Existing Supabase-hosted listing images retained; no new external images added.",
    "duplicates_checked": true,
    "duplicate_images_found": false,
    "rights_note": "Image source and licence were not independently re-verified during this content update; no scraped or hotlinked images were added."
  },
  "weather_widget": {
    "enabled": true,
    "source": "Uses listing latitude and longitude in the existing AlgarveOfficial weather component.",
    "fallback": "Weather currently unavailable."
  },
  "faq_items": [
    {
      "question": "Where is Praia do Peneco?",
      "answer": "Praia do Peneco is in central Albufeira, directly below the old town and beside Praia dos Pescadores on the city's urban seafront."
    },
    {
      "question": "Is Praia do Peneco the same as Praia do Túnel?",
      "answer": "Yes. VisitPortugal identifies the beach as Praia do Túnel ou Peneco, and official Albufeira tourism references the tunnel access from the historic centre."
    },
    {
      "question": "Is there parking at Praia do Peneco?",
      "answer": "VisitPortugal lists parking for Praia do Peneco. Current capacity, payment rules and central Albufeira traffic conditions were not independently verified."
    },
    {
      "question": "Are there lifeguards at Praia do Peneco?",
      "answer": "VisitPortugal lists safety or surveillance, and ABAAE lists the 2026 bathing season from 15 May to 15 October. Exact daily lifeguard staffing was not independently verified, so check local flags and signage before swimming."
    },
    {
      "question": "Is Praia do Peneco a Blue Flag beach?",
      "answer": "Yes. ABAAE verifies Peneco as a 2026 Blue Flag beach, with the Blue Flag season listed from 1 July to 30 September 2026."
    },
    {
      "question": "Is Praia do Peneco accessible for visitors with reduced mobility?",
      "answer": "VisitPortugal lists Praia do Peneco as an accessible beach. Current step-free route details, lift operation, assisted bathing, adapted equipment and accessible toilets should be confirmed locally before travelling."
    },
    {
      "question": "Are there restaurants near Praia do Peneco?",
      "answer": "Yes. VisitPortugal lists bar and restaurant services, and this page links to nearby published AlgarveOfficial restaurant listings based on stored internal listing coordinates."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings to Praia do Peneco?",
      "answer": "Nearby published AlgarveOfficial beach listings linked from this page include Praia dos Pescadores, Praia da Oura, Praia de São Rafael and Praia de Santa Eulália."
    }
  ],
  "seo": {
    "meta_title": "Praia do Peneco, Albufeira | Beach Guide",
    "meta_description": "Praia do Peneco in Albufeira is a central old-town beach with tunnel access, cliffs, parking, facilities, accessible-beach recognition and 2026 Blue Flag status.",
    "keywords": [
      "Praia do Peneco",
      "Praia do Tunel",
      "Peneco Beach",
      "Albufeira beach",
      "Albufeira old town beach",
      "central Albufeira beach",
      "Algarve beaches",
      "Portugal beaches",
      "accessible beach Albufeira"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Túnel ou Peneco",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-t%C3%BAnel-ou-peneco",
      "facts_verified": [
        "Official name Praia do Túnel ou Peneco",
        "Maritime beach classification",
        "Location in Albufeira",
        "Tunnel access from the centre of Albufeira",
        "Broad sandy beach between the city and the sea",
        "Facilities including Blue Flag, safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurfing and accessible-beach recognition",
        "Access by car or motorcycle and on foot"
      ]
    },
    {
      "source_name": "Visit Albufeira - Praia do Peneco",
      "source_url": "https://visitalbufeira.pt/praia/praia-do-peneco",
      "facts_verified": [
        "Peneco Beach official Albufeira tourism listing",
        "Natural extension of Praia dos Pescadores",
        "Rock tunnel connecting the old town to the sand",
        "High cliffs framing the beach",
        "Facilities including lifeguards, beach bar and showers",
        "Central location and seafront visitor context"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Peneco",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/peneco/",
      "facts_verified": [
        "Official Peneco coastal beach entry",
        "Municipality of Albufeira",
        "Coordinates 37.088991, -8.252283",
        "Beach code PTCL2Q",
        "2026 bathing season from 15 May to 15 October",
        "2026 Blue Flag season from 1 July to 30 September",
        "Flag shown as not hoisted at time checked"
      ]
    },
    {
      "source_name": "Câmara Municipal de Albufeira - Peneco",
      "source_url": "https://www.cm-albufeira.pt/praias/peneco",
      "facts_verified": [
        "Praia do Peneco municipal beach listing",
        "Old urban-centre location",
        "Pedestrian access from the old centre",
        "Elevator access from the Rossio area",
        "Parking listed by the municipality"
      ]
    },
    {
      "source_name": "Visit Albufeira - Rua 5 de Outubro Tunnel",
      "source_url": "https://visitalbufeira.pt/visita/tunel-da-rua-5-de-outubro/",
      "facts_verified": [
        "Tunnel links the historic centre to Praia do Peneco",
        "Tunnel carved into the cliff",
        "Old-town pedestrian access context"
      ]
    },
    {
      "source_name": "Visit Albufeira - Urban Front Beaches",
      "source_url": "https://visitalbufeira.pt/experiencias/praias-da-frente-urbana/",
      "facts_verified": [
        "Urban-front beach context",
        "Central location near the historic centre",
        "Relationship with Praia dos Pescadores, Praia do Peneco and Praia do Inatel"
      ]
    },
    {
      "source_name": "AlgarveOfficial internal published listings",
      "source_url": "internal:listings",
      "facts_verified": [
        "Nearby beaches, restaurants and attractions linked only to published internal AlgarveOfficial listings",
        "Approximate distances calculated from stored listing coordinates"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, central location, tunnel access, urban beach setting and facilities were verified from official tourism sources.",
    "ABAAE verifies Peneco as a 2026 Blue Flag beach and lists the 2026 bathing season from 15 May to 15 October.",
    "ABAAE lists the 2026 Blue Flag season from 1 July to 30 September, with the flag shown as not hoisted at the time checked on 18 May 2026.",
    "Accessibility is verified at recognition level through VisitPortugal, but current assisted bathing, adapted equipment, accessible toilets and lift operation were not independently verified.",
    "Current daily lifeguard staffing, concession operation and parking rules were not independently verified.",
    "Nearby beaches, restaurants and attractions in card sections use only internal published AlgarveOfficial listing URLs, per editorial requirement.",
    "No external competitor website CTA was retained; website_url and google_business_url are cleared for this beach listing.",
    "Existing Supabase-hosted gallery images were visually checked and no duplicate image was found; no new external images were added."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00"
}
$json$;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-do-peneco-albufeira'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-do-peneco-albufeira not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         latitude = 37.088991,
         longitude = -8.252283,
         meta_title = 'Praia do Peneco, Albufeira | Beach Guide',
         meta_description = 'Praia do Peneco in Albufeira is a central old-town beach with tunnel access, cliffs, parking, facilities, accessible-beach recognition and 2026 Blue Flag status.',
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
     set alt_text = 'Praia do Peneco sunset view towards Albufeira cliffs'
   where id = '1afbc28b-22ba-4c9a-8f25-89c3556b112a'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia do Peneco sand and limestone cliffs'
   where id = '163ea4ef-0406-4780-8981-9afc1b529b36'
     and listing_id = v_listing_id;
end $$;

commit;
