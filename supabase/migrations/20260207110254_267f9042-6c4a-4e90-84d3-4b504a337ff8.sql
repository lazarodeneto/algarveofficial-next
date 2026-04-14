-- Clear stale featured_image_url for listings with zero gallery images
UPDATE listings l
SET featured_image_url = NULL
WHERE NOT EXISTS (
  SELECT 1 FROM listing_images li WHERE li.listing_id = l.id
)
AND l.featured_image_url IS NOT NULL;
