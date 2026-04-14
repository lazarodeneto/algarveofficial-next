-- Item 7: Create demo/seed data for the platform

-- First, we need to identify cities that exist so we can use their IDs
-- Let's insert some demo listings using the existing cities and categories

-- Get first active city and category for demo data
DO $$
DECLARE
  v_city_id uuid;
  v_region_id uuid;
  v_category_hotel uuid;
  v_category_dining uuid;
  v_category_golf uuid;
  v_category_beach uuid;
  v_category_wellness uuid;
  v_admin_id uuid;
BEGIN
  -- Get first active city
  SELECT id INTO v_city_id FROM cities WHERE is_active = true LIMIT 1;
  
  -- Get first active region  
  SELECT id INTO v_region_id FROM regions WHERE is_active = true LIMIT 1;
  
  -- Get category IDs
  SELECT id INTO v_category_hotel FROM categories WHERE slug = 'luxury-accommodation' LIMIT 1;
  SELECT id INTO v_category_dining FROM categories WHERE slug = 'fine-dining' LIMIT 1;
  SELECT id INTO v_category_golf FROM categories WHERE slug = 'golf' LIMIT 1;
  SELECT id INTO v_category_beach FROM categories WHERE slug = 'beach-clubs' LIMIT 1;
  SELECT id INTO v_category_wellness FROM categories WHERE slug = 'wellness-spas' LIMIT 1;
  
  -- Get admin user (or first user)
  SELECT id INTO v_admin_id FROM profiles LIMIT 1;
  
  -- Only proceed if we have required data
  IF v_city_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
    
    -- Demo Listing 1: Luxury Hotel
    IF v_category_hotel IS NOT NULL AND NOT EXISTS (SELECT 1 FROM listings WHERE slug = 'pine-cliffs-resort') THEN
      INSERT INTO listings (
        name, slug, short_description, description, 
        category_id, city_id, region_id, owner_id,
        tier, status, is_curated,
        featured_image_url, google_rating, google_review_count,
        tags, website_url, contact_email
      ) VALUES (
        'Pine Cliffs Resort',
        'pine-cliffs-resort',
        'Award-winning luxury clifftop resort with stunning Atlantic views',
        'Perched dramatically on the Algarve coast, Pine Cliffs Resort offers an unparalleled luxury experience with world-class amenities, including a championship golf course, premium spa, and direct beach access via scenic cliff elevator.',
        v_category_hotel, v_city_id, v_region_id, v_admin_id,
        'signature', 'published', true,
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        4.7, 2847,
        ARRAY['luxury', 'resort', 'golf', 'spa', 'beachfront'],
        'https://www.pinecliffs.com',
        'reservations@pinecliffs.com'
      );
    END IF;
    
    -- Demo Listing 2: Fine Dining
    IF v_category_dining IS NOT NULL AND NOT EXISTS (SELECT 1 FROM listings WHERE slug = 'ocean-restaurant') THEN
      INSERT INTO listings (
        name, slug, short_description, description,
        category_id, city_id, region_id, owner_id,
        tier, status, is_curated,
        featured_image_url, google_rating, google_review_count,
        tags, website_url, contact_phone
      ) VALUES (
        'Ocean Restaurant',
        'ocean-restaurant',
        'Two Michelin-starred oceanfront dining experience',
        'Led by acclaimed Chef Hans Neuner, Ocean Restaurant at Vila Vita Parc delivers an extraordinary culinary journey celebrating the finest Portuguese ingredients with innovative European techniques. The stunning cliff-edge setting complements the world-class cuisine.',
        v_category_dining, v_city_id, v_region_id, v_admin_id,
        'signature', 'published', true,
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        4.9, 1523,
        ARRAY['michelin', 'fine dining', 'seafood', 'romantic', 'special occasions'],
        'https://www.vilavitaparc.com/ocean',
        '+351 282 310 100'
      );
    END IF;
    
    -- Demo Listing 3: Golf Course
    IF v_category_golf IS NOT NULL AND NOT EXISTS (SELECT 1 FROM listings WHERE slug = 'monte-rei-golf') THEN
      INSERT INTO listings (
        name, slug, short_description, description,
        category_id, city_id, region_id, owner_id,
        tier, status, is_curated,
        featured_image_url, google_rating, google_review_count,
        tags, website_url
      ) VALUES (
        'Monte Rei Golf & Country Club',
        'monte-rei-golf',
        'Portugal''s #1 ranked golf course by Jack Nicklaus',
        'Experience world-class golf at Monte Rei, featuring an 18-hole Jack Nicklaus Signature course consistently ranked as Portugal''s finest. Set within a stunning natural landscape with panoramic mountain and ocean views.',
        v_category_golf, v_city_id, v_region_id, v_admin_id,
        'signature', 'published', true,
        'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
        4.8, 892,
        ARRAY['golf', 'nicklaus', 'championship', 'luxury', 'exclusive'],
        'https://www.monte-rei.com'
      );
    END IF;
    
    -- Demo Listing 4: Beach Club
    IF v_category_beach IS NOT NULL AND NOT EXISTS (SELECT 1 FROM listings WHERE slug = 'blanco-beach-club') THEN
      INSERT INTO listings (
        name, slug, short_description, description,
        category_id, city_id, region_id, owner_id,
        tier, status, is_curated,
        featured_image_url, google_rating, google_review_count,
        tags
      ) VALUES (
        'Blanco Beach Club',
        'blanco-beach-club',
        'Exclusive beachfront club with premium service',
        'The ultimate Algarve beach experience with pristine white sunbeds, attentive service, gourmet beachside dining, and a sophisticated cocktail bar. Located on one of the region''s most beautiful beaches.',
        v_category_beach, v_city_id, v_region_id, v_admin_id,
        'verified', 'published', false,
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        4.5, 634,
        ARRAY['beach', 'cocktails', 'sun loungers', 'restaurant', 'exclusive']
      );
    END IF;
    
    -- Demo Listing 5: Wellness Spa
    IF v_category_wellness IS NOT NULL AND NOT EXISTS (SELECT 1 FROM listings WHERE slug = 'serenity-spa-retreat') THEN
      INSERT INTO listings (
        name, slug, short_description, description,
        category_id, city_id, region_id, owner_id,
        tier, status, is_curated,
        featured_image_url, google_rating, google_review_count,
        tags
      ) VALUES (
        'Serenity Spa at Conrad',
        'serenity-spa-retreat',
        'Transformative wellness experiences in serene surroundings',
        'Escape to tranquility at Serenity Spa, offering a comprehensive menu of holistic treatments, thermal experiences, and personalized wellness programs. Featuring eight treatment rooms, a vitality pool, and meditation gardens.',
        v_category_wellness, v_city_id, v_region_id, v_admin_id,
        'verified', 'published', false,
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
        4.6, 445,
        ARRAY['spa', 'wellness', 'massage', 'relaxation', 'thermal']
      );
    END IF;
    
  END IF;
END $$;;
