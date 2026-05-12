-- Verification batch: 2026-05-11-next-5
-- Purpose: record exactly five externally checked listings as structured audits/proposals.
-- This migration intentionally does not update public.listings directly.

WITH inserted_audits AS (
  INSERT INTO public.listing_verification_audits (
    id,
    listing_id,
    batch_id,
    status,
    current_data,
    proposed_data,
    applied_data,
    sources,
    confidence_score,
    confidence_label,
    notes,
    needs_admin_review
  )
  VALUES
  (
    'bbc941ed-b0ac-4ee6-8784-9e42ed7b151d',
    'cca631cf-5448-410d-959a-adc0a593a663',
    'listing-verification-20260511-next-5',
    'completed_with_proposals',
    '{
      "name": "The 6 Hours of Portimão",
      "slug": "event-the-6-hours-of-portimao",
      "status": "archived",
      "category": "Concierge Services",
      "city": "Portimão",
      "address": null,
      "website_url": "https://winter-series.racing/6h-of-portimao/registration/",
      "contact_phone": null,
      "contact_email": null,
      "socials": {}
    }'::jsonb,
    '{
      "address": "Sítio do Escampadinho, Mexilhoeira Grande, 8500-148 Portimão, Portugal",
      "website_url": "https://autodromodoalgarve.com/pt/calendario-corridas/6-horas-winter-series/6-h/",
      "contact_phone": "+351 282 405 600",
      "contact_email": "tickets@autodromodoalgarve.com",
      "facebook_url": "https://www.facebook.com/AutodromodoAlgarve",
      "instagram_url": "https://www.instagram.com/autodromodoalgarve/",
      "twitter_url": "https://twitter.com/AIAPortimao",
      "youtube_url": "https://www.youtube.com/user/AutodromodoAlgarve"
    }'::jsonb,
    '{}'::jsonb,
    '[
      {
        "url": "https://autodromodoalgarve.com/pt/calendario-corridas/6-horas-winter-series/6-h/",
        "source_type": "official_venue_website",
        "confidence": "high",
        "notes": "Official AIA page confirms 6 Horas Portimão Winter Series, venue address, AIA contacts and footer social profiles.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://visitportimao.com/en/eventos/6-hours-from-portimao/",
        "source_type": "official_municipal_tourism",
        "confidence": "high",
        "notes": "Visit Portimão confirms the 7-8 February 2026 event at Autódromo Internacional do Algarve.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://winter-series.racing/6h-of-portimao/home/",
        "source_type": "official_organizer_website",
        "confidence": "medium",
        "notes": "Organizer page now focuses on the 2027 edition, but confirms the 6h Portimão event identity and organizer context.",
        "checked_at": "2026-05-11"
      }
    ]'::jsonb,
    85,
    'high',
    'Archived/past event was checked only for durable data quality. No direct updates were applied.',
    true
  ),
  (
    '5f43f1f5-1b8a-489d-8f8c-eed01adbd351',
    'c8a7e217-85e8-42be-a5a0-d09f624e9b5b',
    'listing-verification-20260511-next-5',
    'completed_with_proposals',
    '{
      "name": "Royal Indian Cuisine & Bar",
      "slug": "royal-indian-cuisine-bar-almancil",
      "status": "published",
      "category": "Restaurants",
      "city": "Almancil",
      "address": "Av. Alm. Mendes Cabeçadas no 12, 8135-106 Almancil",
      "website_url": null,
      "contact_phone": "920 450 031",
      "contact_email": null,
      "socials": {}
    }'::jsonb,
    '{
      "facebook_url": "https://www.facebook.com/royalindiancuisineandbar/",
      "category_data.opening_hours": {
        "monday": "18:00-00:00",
        "tuesday": "18:00-00:00",
        "wednesday": "18:00-00:00",
        "thursday": "18:00-00:00",
        "friday": "18:00-00:00",
        "saturday": "18:00-00:00",
        "sunday": "18:00-00:00"
      }
    }'::jsonb,
    '{}'::jsonb,
    '[
      {
        "url": "https://www.allaboutportugal.pt/fr/loule/restaurants/royal-indian-cuisine-bar",
        "source_type": "tourism_directory",
        "confidence": "medium",
        "notes": "Directory lists the Facebook profile and legacy business.site URL; business.site returned 404 during verification.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.top-rated.online/cities/Almancil/place/p/6856160/Royal%2BIndian%2BCuisine%2B%26%2BBar",
        "source_type": "directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Supports current address and phone +351 920 450 031.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://pt.restaurantguru.com/Royal-Indian-Cuisine-Loule",
        "source_type": "directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Recent directory supports active/open status and 18:00-00:00 opening hours, but phone differs from current listing.",
        "checked_at": "2026-05-11"
      }
    ]'::jsonb,
    55,
    'medium',
    'Official website could not be verified because the listed business.site page returns 404. Social and hours proposals require admin review.',
    true
  ),
  (
    'a854c570-72c7-4ad4-b376-ce7c9b119479',
    '3cc423cc-5f56-486b-a52e-0eef940bbcd4',
    'listing-verification-20260511-next-5',
    'completed_with_proposals',
    '{
      "name": "Salmora - Live Kitchen & Bar",
      "slug": "salmora-live-kitchen-bar-vale-do-lobo",
      "status": "published",
      "category": "Restaurants",
      "city": "Vale do Lobo",
      "address": "Rua do Clube Náutico, Edíficio Vila Lusa, Bloco2-B, loja 8, 8125-442",
      "website_url": null,
      "contact_phone": "926 808 099",
      "contact_email": null,
      "socials": {}
    }'::jsonb,
    '{
      "city_id": "e78664ac-bdde-4e8f-aa6d-8492e60f9b34",
      "city": "Vilamoura",
      "address": "Rua do Clube Náutico, Edifício Vila Lusa, Bloco 2-B, Loja 8, 8125-442 Quarteira, Portugal",
      "website_url": "http://salmora.pt",
      "contact_email": "reservas@salmora.pt",
      "facebook_url": "https://www.facebook.com/SalmoraLiveKitchen/",
      "instagram_url": "https://www.instagram.com/salmoralivekitchen/",
      "category_data.opening_hours": {
        "monday": "closed",
        "tuesday": "17:30-23:00",
        "wednesday": "17:30-23:00",
        "thursday": "17:30-23:30",
        "friday": "17:30-23:30",
        "saturday": "17:30-23:30",
        "sunday": "17:30-23:30"
      }
    }'::jsonb,
    '{}'::jsonb,
    '[
      {
        "url": "http://salmora.pt",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Current official site is in maintenance and lists reservas@salmora.pt and 289 315 154.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.cmjornal.pt/comunicados-de-imprensa/detalhe/salmora---live-kitchen--bar",
        "source_type": "press_release",
        "confidence": "medium",
        "notes": "Older press release identifies salmora.pt, Facebook and Instagram context, and Vilamoura location.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://restaurantguru.com/Salmora-Quarteira",
        "source_type": "directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Recent listing supports current phone +351 926 808 099, address, Instagram handle and opening hours.",
        "checked_at": "2026-05-11"
      }
    ]'::jsonb,
    70,
    'medium',
    'City appears misclassified as Vale do Lobo; verified location is Vilamoura/Quarteira. Phone evidence conflicts between official maintenance page and current directories.',
    true
  ),
  (
    'ebdb0223-6cb4-4500-96eb-4747e54c9800',
    '763e0db0-4a0e-46df-8ff1-87f626490cb7',
    'listing-verification-20260511-next-5',
    'completed_with_proposals',
    '{
      "name": "19th Hole",
      "slug": "19th-hole-vilamoura",
      "status": "published",
      "category": "Beach Clubs",
      "city": "Vilamoura",
      "address": "507, Marina de Vilamoura 31, Faro",
      "website_url": null,
      "contact_phone": "+351914 928 110",
      "contact_email": null,
      "socials": {}
    }'::jsonb,
    '{
      "category_id": "733906a9-9a0f-4799-9864-c706eb054e60",
      "category": "Restaurants",
      "website_url": "http://www.19holevilamoura.com",
      "facebook_url": "https://www.facebook.com/nineteenthhole.vilamoura/",
      "instagram_url": "https://www.instagram.com/19th_holevilamoura/",
      "category_data.opening_hours": {
        "monday": "10:00-03:00",
        "tuesday": "10:00-03:00",
        "wednesday": "10:00-03:00",
        "thursday": "10:00-03:00",
        "friday": "10:00-03:00",
        "saturday": "10:00-03:00",
        "sunday": "10:00-03:00"
      }
    }'::jsonb,
    '{}'::jsonb,
    '[
      {
        "url": "https://www.plotbiz.com/biz/19hole",
        "source_type": "directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Lists 19th Hole website, Facebook, Instagram, phone and Marina address.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://restaurantguru.com/19th-Hole-Quarteira-3",
        "source_type": "directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Recent page supports active status, phone, website, current-style Marina address and 10:00-03:00 hours.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://mapstr.com/place/4IZOcDvFgfg",
        "source_type": "directory_supporting_evidence",
        "confidence": "low",
        "notes": "Supports current address, website and phone.",
        "checked_at": "2026-05-11"
      }
    ]'::jsonb,
    65,
    'medium',
    'Beach Clubs category appears inaccurate for a marina pub/bar/restaurant; proposed category change requires admin review.',
    true
  ),
  (
    '441bff9e-67eb-46de-9726-b1f7e1d47374',
    'a588f5d2-ecc8-41f2-a31f-c1b914562de6',
    'listing-verification-20260511-next-5',
    'completed_with_proposals',
    '{
      "name": "Chinese Gourmet 美食",
      "slug": "chinese-gourmet-almancil",
      "status": "published",
      "category": "Restaurants",
      "city": "Almancil",
      "address": "R. da Casa do Povo 18, 8135-116 Almancil",
      "website_url": null,
      "contact_phone": "289 356 422",
      "contact_email": null,
      "socials": {}
    }'::jsonb,
    '{
      "website_url": "https://www.chinesegourmet.pt/",
      "facebook_url": "https://www.facebook.com/Chinese-Gourmet-606091586132197/",
      "category_data.opening_hours": {
        "monday": "18:00-23:00",
        "tuesday": "closed",
        "wednesday": "18:00-23:00",
        "thursday": "18:00-23:00",
        "friday": "18:00-23:00",
        "saturday": "18:00-23:00",
        "sunday": "18:00-23:00"
      }
    }'::jsonb,
    '{}'::jsonb,
    '[
      {
        "url": "https://www.findglocal.com/PT/Almancil/606091586132197/Chinese-Gourmet",
        "source_type": "official_social_mirror",
        "confidence": "high",
        "notes": "Mirrors the official Facebook profile and states the new website, phone and address.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.allaboutportugal.pt/pt/loule/restaurants/chinese-gourmet",
        "source_type": "tourism_directory",
        "confidence": "medium",
        "notes": "Supports address, phone, legacy website and official Facebook URL.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://chinese-gourmet-almancil.res-menu.net/",
        "source_type": "directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Supports address, phone and Tuesday-closed opening hours.",
        "checked_at": "2026-05-11"
      }
    ]'::jsonb,
    82,
    'high',
    'Website and Facebook are supported by the business social mirror and tourism directory. Opening hours are proposed for admin review due source conflict on Tuesday.',
    true
  )
  RETURNING id
)
SELECT count(*) FROM inserted_audits;

INSERT INTO public.listing_update_proposals (
  id,
  listing_id,
  audit_id,
  field_name,
  old_value,
  proposed_value,
  source_urls,
  source_type,
  confidence_label,
  status
)
VALUES
  (
    '05828dc5-e4eb-4023-8120-0ab832f6c1bc',
    'cca631cf-5448-410d-959a-adc0a593a663',
    'bbc941ed-b0ac-4ee6-8784-9e42ed7b151d',
    'address',
    'null'::jsonb,
    '"Sítio do Escampadinho, Mexilhoeira Grande, 8500-148 Portimão, Portugal"'::jsonb,
    '["https://autodromodoalgarve.com/pt/calendario-corridas/6-horas-winter-series/6-h/","https://visitportimao.com/en/eventos/6-hours-from-portimao/"]'::jsonb,
    'official_venue_website',
    'high',
    'pending'
  ),
  (
    '542afead-e74c-4cb2-85f5-c0fb8fc8739b',
    'cca631cf-5448-410d-959a-adc0a593a663',
    'bbc941ed-b0ac-4ee6-8784-9e42ed7b151d',
    'website_url',
    '"https://winter-series.racing/6h-of-portimao/registration/"'::jsonb,
    '"https://autodromodoalgarve.com/pt/calendario-corridas/6-horas-winter-series/6-h/"'::jsonb,
    '["https://autodromodoalgarve.com/pt/calendario-corridas/6-horas-winter-series/6-h/"]'::jsonb,
    'official_venue_website',
    'high',
    'pending'
  ),
  (
    '735b8b1a-7924-4b09-99eb-6ed2c2af284c',
    'cca631cf-5448-410d-959a-adc0a593a663',
    'bbc941ed-b0ac-4ee6-8784-9e42ed7b151d',
    'contact_phone',
    'null'::jsonb,
    '"+351 282 405 600"'::jsonb,
    '["https://autodromodoalgarve.com/pt/calendario-corridas/6-horas-winter-series/6-h/"]'::jsonb,
    'official_venue_website',
    'high',
    'pending'
  ),
  (
    'af29f755-025d-45b1-8f00-eaf655302fa5',
    'cca631cf-5448-410d-959a-adc0a593a663',
    'bbc941ed-b0ac-4ee6-8784-9e42ed7b151d',
    'contact_email',
    'null'::jsonb,
    '"tickets@autodromodoalgarve.com"'::jsonb,
    '["https://autodromodoalgarve.com/pt/calendario-corridas/6-horas-winter-series/6-h/"]'::jsonb,
    'official_venue_website',
    'high',
    'pending'
  ),
  (
    'c8580ccc-34cd-4f62-bb59-0727c00a324a',
    'cca631cf-5448-410d-959a-adc0a593a663',
    'bbc941ed-b0ac-4ee6-8784-9e42ed7b151d',
    'facebook_url',
    'null'::jsonb,
    '"https://www.facebook.com/AutodromodoAlgarve"'::jsonb,
    '["https://autodromodoalgarve.com/pt/calendario-corridas/6-horas-winter-series/6-h/"]'::jsonb,
    'official_venue_website_social_link',
    'high',
    'pending'
  ),
  (
    '49fd3f16-b9cb-413b-a0b8-ce71eb38689e',
    'cca631cf-5448-410d-959a-adc0a593a663',
    'bbc941ed-b0ac-4ee6-8784-9e42ed7b151d',
    'instagram_url',
    'null'::jsonb,
    '"https://www.instagram.com/autodromodoalgarve/"'::jsonb,
    '["https://autodromodoalgarve.com/pt/calendario-corridas/6-horas-winter-series/6-h/"]'::jsonb,
    'official_venue_website_social_link',
    'high',
    'pending'
  ),
  (
    'e03730ea-1671-4a97-904f-ad13974f02f8',
    'cca631cf-5448-410d-959a-adc0a593a663',
    'bbc941ed-b0ac-4ee6-8784-9e42ed7b151d',
    'twitter_url',
    'null'::jsonb,
    '"https://twitter.com/AIAPortimao"'::jsonb,
    '["https://autodromodoalgarve.com/pt/calendario-corridas/6-horas-winter-series/6-h/"]'::jsonb,
    'official_venue_website_social_link',
    'high',
    'pending'
  ),
  (
    'dbc1ca2b-3559-4d81-9cd1-989d7bcd513e',
    'cca631cf-5448-410d-959a-adc0a593a663',
    'bbc941ed-b0ac-4ee6-8784-9e42ed7b151d',
    'youtube_url',
    'null'::jsonb,
    '"https://www.youtube.com/user/AutodromodoAlgarve"'::jsonb,
    '["https://autodromodoalgarve.com/pt/calendario-corridas/6-horas-winter-series/6-h/"]'::jsonb,
    'official_venue_website_social_link',
    'high',
    'pending'
  ),
  (
    '7c83b3aa-b460-4639-803c-ed3c9bf152a8',
    'c8a7e217-85e8-42be-a5a0-d09f624e9b5b',
    '5f43f1f5-1b8a-489d-8f8c-eed01adbd351',
    'facebook_url',
    'null'::jsonb,
    '"https://www.facebook.com/royalindiancuisineandbar/"'::jsonb,
    '["https://www.allaboutportugal.pt/fr/loule/restaurants/royal-indian-cuisine-bar"]'::jsonb,
    'tourism_directory',
    'medium',
    'pending'
  ),
  (
    'cef34a29-fbc8-492f-a23f-2f781b0d6792',
    'c8a7e217-85e8-42be-a5a0-d09f624e9b5b',
    '5f43f1f5-1b8a-489d-8f8c-eed01adbd351',
    'category_data.opening_hours',
    '{}'::jsonb,
    '{"monday":"18:00-00:00","tuesday":"18:00-00:00","wednesday":"18:00-00:00","thursday":"18:00-00:00","friday":"18:00-00:00","saturday":"18:00-00:00","sunday":"18:00-00:00"}'::jsonb,
    '["https://pt.restaurantguru.com/Royal-Indian-Cuisine-Loule","https://www.allaboutportugal.pt/fr/loule/restaurants/royal-indian-cuisine-bar"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    '61182709-4205-4498-91b3-ee0b2cc1fe4f',
    '3cc423cc-5f56-486b-a52e-0eef940bbcd4',
    'a854c570-72c7-4ad4-b376-ce7c9b119479',
    'city_id',
    '"4636e0b4-7b32-4e7a-839e-fc1a616e2410"'::jsonb,
    '"e78664ac-bdde-4e8f-aa6d-8492e60f9b34"'::jsonb,
    '["http://salmora.pt","https://restaurantguru.com/Salmora-Quarteira","https://www.cmjornal.pt/comunicados-de-imprensa/detalhe/salmora---live-kitchen--bar"]'::jsonb,
    'official_website_and_supporting_directories',
    'medium',
    'pending'
  ),
  (
    '0b2591ae-48eb-464f-b641-63b0d1fc2d73',
    '3cc423cc-5f56-486b-a52e-0eef940bbcd4',
    'a854c570-72c7-4ad4-b376-ce7c9b119479',
    'address',
    '"Rua do Clube Náutico, Edíficio Vila Lusa, Bloco2-B, loja 8, 8125-442"'::jsonb,
    '"Rua do Clube Náutico, Edifício Vila Lusa, Bloco 2-B, Loja 8, 8125-442 Quarteira, Portugal"'::jsonb,
    '["https://restaurantguru.com/Salmora-Quarteira","https://www.cmjornal.pt/comunicados-de-imprensa/detalhe/salmora---live-kitchen--bar"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    'b0f9448e-2510-4e06-a02e-21e72cfb9f54',
    '3cc423cc-5f56-486b-a52e-0eef940bbcd4',
    'a854c570-72c7-4ad4-b376-ce7c9b119479',
    'website_url',
    'null'::jsonb,
    '"http://salmora.pt"'::jsonb,
    '["http://salmora.pt"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'b955ebdc-43b4-4259-b12e-851946a987a4',
    '3cc423cc-5f56-486b-a52e-0eef940bbcd4',
    'a854c570-72c7-4ad4-b376-ce7c9b119479',
    'contact_email',
    'null'::jsonb,
    '"reservas@salmora.pt"'::jsonb,
    '["http://salmora.pt"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'dfe1784f-f030-4a23-92cd-657222e30619',
    '3cc423cc-5f56-486b-a52e-0eef940bbcd4',
    'a854c570-72c7-4ad4-b376-ce7c9b119479',
    'facebook_url',
    'null'::jsonb,
    '"https://www.facebook.com/SalmoraLiveKitchen/"'::jsonb,
    '["https://www.cmjornal.pt/comunicados-de-imprensa/detalhe/salmora---live-kitchen--bar","https://www.plotbiz.com/biz/salmora"]'::jsonb,
    'press_release',
    'medium',
    'pending'
  ),
  (
    '8b697648-8113-4401-b215-98a31c22ff30',
    '3cc423cc-5f56-486b-a52e-0eef940bbcd4',
    'a854c570-72c7-4ad4-b376-ce7c9b119479',
    'instagram_url',
    'null'::jsonb,
    '"https://www.instagram.com/salmoralivekitchen/"'::jsonb,
    '["https://restaurantguru.com/Salmora-Quarteira","https://www.cmjornal.pt/comunicados-de-imprensa/detalhe/salmora---live-kitchen--bar"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    'f4627d07-29d8-4071-94e0-d6f811aeb134',
    '3cc423cc-5f56-486b-a52e-0eef940bbcd4',
    'a854c570-72c7-4ad4-b376-ce7c9b119479',
    'category_data.opening_hours',
    '{}'::jsonb,
    '{"monday":"closed","tuesday":"17:30-23:00","wednesday":"17:30-23:00","thursday":"17:30-23:30","friday":"17:30-23:30","saturday":"17:30-23:30","sunday":"17:30-23:30"}'::jsonb,
    '["https://restaurantguru.com/Salmora-Quarteira"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    'e935ae61-3e1c-4af7-8639-346a7027fc7a',
    '763e0db0-4a0e-46df-8ff1-87f626490cb7',
    'ebdb0223-6cb4-4500-96eb-4747e54c9800',
    'category_id',
    '"8b21154e-d2f8-4632-a5ef-47fb737f8e23"'::jsonb,
    '"733906a9-9a0f-4799-9864-c706eb054e60"'::jsonb,
    '["https://www.plotbiz.com/biz/19hole","https://restaurantguru.com/19th-Hole-Quarteira-3"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    '90d7c0a4-689c-4337-9ab1-28f2e637b206',
    '763e0db0-4a0e-46df-8ff1-87f626490cb7',
    'ebdb0223-6cb4-4500-96eb-4747e54c9800',
    'website_url',
    'null'::jsonb,
    '"http://www.19holevilamoura.com"'::jsonb,
    '["https://www.plotbiz.com/biz/19hole","https://restaurantguru.com/19th-Hole-Quarteira-3"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    'ae8fac25-44d3-4208-8123-76579887ed04',
    '763e0db0-4a0e-46df-8ff1-87f626490cb7',
    'ebdb0223-6cb4-4500-96eb-4747e54c9800',
    'facebook_url',
    'null'::jsonb,
    '"https://www.facebook.com/nineteenthhole.vilamoura/"'::jsonb,
    '["https://www.plotbiz.com/biz/19hole"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    'c028f996-1a05-41f8-9179-497408e02034',
    '763e0db0-4a0e-46df-8ff1-87f626490cb7',
    'ebdb0223-6cb4-4500-96eb-4747e54c9800',
    'instagram_url',
    'null'::jsonb,
    '"https://www.instagram.com/19th_holevilamoura/"'::jsonb,
    '["https://www.plotbiz.com/biz/19hole"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    '55dfc89e-68b4-4cc4-9435-35748fa5d68c',
    '763e0db0-4a0e-46df-8ff1-87f626490cb7',
    'ebdb0223-6cb4-4500-96eb-4747e54c9800',
    'category_data.opening_hours',
    '{}'::jsonb,
    '{"monday":"10:00-03:00","tuesday":"10:00-03:00","wednesday":"10:00-03:00","thursday":"10:00-03:00","friday":"10:00-03:00","saturday":"10:00-03:00","sunday":"10:00-03:00"}'::jsonb,
    '["https://restaurantguru.com/19th-Hole-Quarteira-3"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    '7b5dd8dd-705a-4c78-b526-e17619a79cb7',
    'a588f5d2-ecc8-41f2-a31f-c1b914562de6',
    '441bff9e-67eb-46de-9726-b1f7e1d47374',
    'website_url',
    'null'::jsonb,
    '"https://www.chinesegourmet.pt/"'::jsonb,
    '["https://www.findglocal.com/PT/Almancil/606091586132197/Chinese-Gourmet"]'::jsonb,
    'official_social_mirror',
    'high',
    'pending'
  ),
  (
    '8c918a94-f210-43a3-976b-f38b2c366a4a',
    'a588f5d2-ecc8-41f2-a31f-c1b914562de6',
    '441bff9e-67eb-46de-9726-b1f7e1d47374',
    'facebook_url',
    'null'::jsonb,
    '"https://www.facebook.com/Chinese-Gourmet-606091586132197/"'::jsonb,
    '["https://www.allaboutportugal.pt/pt/loule/restaurants/chinese-gourmet","https://www.findglocal.com/PT/Almancil/606091586132197/Chinese-Gourmet"]'::jsonb,
    'tourism_directory',
    'medium',
    'pending'
  ),
  (
    'ce3a9514-73f1-4e42-897b-55708f993760',
    'a588f5d2-ecc8-41f2-a31f-c1b914562de6',
    '441bff9e-67eb-46de-9726-b1f7e1d47374',
    'category_data.opening_hours',
    '{}'::jsonb,
    '{"monday":"18:00-23:00","tuesday":"closed","wednesday":"18:00-23:00","thursday":"18:00-23:00","friday":"18:00-23:00","saturday":"18:00-23:00","sunday":"18:00-23:00"}'::jsonb,
    '["https://chinese-gourmet-almancil.res-menu.net/","https://www.findglocal.com/PT/Almancil/606091586132197/Chinese-Gourmet"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  );
