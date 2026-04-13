-- =====================================================
-- Alt Text Migration SQL
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. First, check current state
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN alt_text IS NULL OR alt_text = '' THEN 1 END) as empty,
    COUNT(CASE WHEN alt_text LIKE '%_%' THEN 1 END) as underscores
FROM listing_images;

-- 2. Preview what the new alt_text will look like (no changes yet)
SELECT 
    li.id,
    l.name as listing_name,
    c.name as city,
    cat.slug as category,
    INITCAP(REPLACE(REPLACE(l.name, '_', ' '), '-', ' '))
        || ' — '
        || CASE 
            WHEN cat.slug LIKE '%golf%' THEN 'golf course view with fairways and greens'
            WHEN cat.slug LIKE '%hotel%' THEN 'hotel exterior with pool and terrace'
            WHEN cat.slug LIKE '%restaurant%' THEN 'restaurant dining atmosphere and interior'
            WHEN cat.slug LIKE '%bar%' THEN 'bar interior and social setting'
            WHEN cat.slug LIKE '%beach%' THEN 'beach scene with golden sands'
            WHEN cat.slug LIKE '%club%' THEN 'beach club setting with sunbeds and ocean'
            WHEN cat.slug LIKE '%spa%' THEN 'spa and wellness environment'
            WHEN cat.slug LIKE '%fitness%' THEN 'fitness center and gym facility'
            WHEN cat.slug LIKE '%tennis%' THEN 'tennis court and sports facility'
            WHEN cat.slug LIKE '%shop%' THEN 'shopping venue and retail space'
            WHEN cat.slug LIKE '%health%' THEN 'health and wellness facility'
            WHEN cat.slug LIKE '%attraction%' THEN 'tourist attraction and landmark'
            WHEN cat.slug LIKE '%experience%' THEN 'premium experience and activities'
            ELSE 'premium venue setting and atmosphere'
        END
        || ' in '
        || COALESCE(c.name, 'Algarve')
        || ', Algarve' as new_alt_text
FROM listing_images li
LEFT JOIN listings l ON li.listing_id = l.id
LEFT JOIN cities c ON l.city_id = c.id
LEFT JOIN categories cat ON l.category_id = cat.id
WHERE li.alt_text IS NULL OR li.alt_text = '' OR li.alt_text LIKE '%_%' OR LENGTH(li.alt_text) < 20
LIMIT 50;

-- 3. EXECUTE THE UPDATE (this changes data!)
UPDATE listing_images li
SET alt_text = INITCAP(REPLACE(REPLACE(l.name, '_', ' '), '-', ' '))
    || ' — '
    || CASE 
        WHEN cat.slug LIKE '%golf%' THEN 'golf course view with fairways and greens'
        WHEN cat.slug LIKE '%hotel%' THEN 'hotel exterior with pool and terrace'
        WHEN cat.slug LIKE '%restaurant%' THEN 'restaurant dining atmosphere and interior'
        WHEN cat.slug LIKE '%bar%' THEN 'bar interior and social setting'
        WHEN cat.slug LIKE '%beach%' THEN 'beach scene with golden sands'
        WHEN cat.slug LIKE '%club%' THEN 'beach club setting with sunbeds and ocean'
        WHEN cat.slug LIKE '%spa%' THEN 'spa and wellness environment'
        WHEN cat.slug LIKE '%fitness%' THEN 'fitness center and gym facility'
        WHEN cat.slug LIKE '%tennis%' THEN 'tennis court and sports facility'
        WHEN cat.slug LIKE '%shop%' THEN 'shopping venue and retail space'
        WHEN cat.slug LIKE '%health%' THEN 'health and wellness facility'
        WHEN cat.slug LIKE '%attraction%' THEN 'tourist attraction and landmark'
        WHEN cat.slug LIKE '%experience%' THEN 'premium experience and activities'
        ELSE 'premium venue setting and atmosphere'
    END
    || ' in '
    || COALESCE(c.name, 'Algarve')
    || ', Algarve'
FROM listings l
LEFT JOIN cities c ON l.city_id = c.id
LEFT JOIN categories cat ON l.category_id = cat.id
WHERE li.listing_id = l.id
  AND (li.alt_text IS NULL OR li.alt_text = '' OR li.alt_text LIKE '%_%' OR LENGTH(li.alt_text) < 20);

-- 4. Verify results
SELECT 
    COUNT(*) as updated,
    LEFT(alt_text, 60) as sample
FROM listing_images
WHERE alt_text LIKE '% — %'
GROUP BY LEFT(alt_text, 60)
LIMIT 10;