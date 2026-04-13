-- =====================================================
-- Alt Text SQL Updates for listing_images
-- Run this in Supabase SQL Editor
-- =====================================================

-- Show current count
SELECT COUNT(*) as total_images FROM listing_images;

-- Show sample of current alt_text values
SELECT 
    li.id,
    li.alt_text as current_alt,
    l.name as listing_name,
    c.name as city
FROM listing_images li
LEFT JOIN listings l ON li.listing_id = l.id
LEFT JOIN cities c ON l.city_id = c.id
LIMIT 10;

-- =====================================================
-- UPDATE statements - run these after reviewing
-- =====================================================

-- Example UPDATE (copy and customize per listing)
-- UPDATE listing_images 
-- SET alt_text = 'Listing Name — visual description in City, Algarve'
-- WHERE id = 'specific-uuid';

-- =====================================================
-- BATCH UPDATE using listing data (run in SQL)
-- =====================================================

UPDATE listing_images li
SET alt_text = (
    SELECT 
        INITCAP(
            REPLACE(
                REPLACE(l.name, '_', ' '),
                '-', ' '
            )
        )
        || ' — '
        || COALESCE(
            CASE 
                WHEN cat.slug LIKE '%golf%' THEN 'golf course view with fairways and greens'
                WHEN cat.slug LIKE '%hotel%' THEN 'hotel exterior with pool and terrace'
                WHEN cat.slug LIKE '%restaurant%' THEN 'restaurant dining atmosphere and interior'
                WHEN cat.slug LIKE '%beach%' THEN 'beach scene with golden sands'
                WHEN cat.slug LIKE '%spa%' THEN 'spa and wellness environment'
                WHEN cat.slug LIKE '%fitness%' THEN 'fitness center and gym facility'
                ELSE 'premium venue setting and atmosphere'
            END,
            'premium venue setting and atmosphere'
        )
        || ' in '
        || COALESCE(c.name, 'Algarve')
        || ', Algarve'
    FROM listings l
    LEFT JOIN cities c ON l.city_id = c.id
    LEFT JOIN categories cat ON l.category_id = cat.id
    WHERE l.id = li.listing_id
)
WHERE li.alt_text IS NULL 
   OR li.alt_text = ''
   OR li.alt_text LIKE '%_%'
   OR LENGTH(li.alt_text) < 20;

-- Verify the update
SELECT 
    li.id,
    li.alt_text as new_alt,
    l.name as listing_name,
    c.name as city
FROM listing_images li
LEFT JOIN listings l ON li.listing_id = l.id
LEFT JOIN cities c ON l.city_id = c.id
WHERE li.alt_text LIKE '% — %'
LIMIT 20;