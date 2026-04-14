-- Normalize published listing coordinates to Algarve bounds used by /map.
-- Bounds:
--   latitude  between 36.7 and 37.5
--   longitude between -9.2 and -7.2
--
-- Strategy:
--   1) Identify published listings with null or out-of-bounds coordinates.
--   2) Backfill from the related city coordinates when city lat/lng are valid.
--   3) Null-out any remaining invalid coordinates (so frontend can safely ignore/fallback).
DO $$
DECLARE
  lat_min CONSTANT numeric := 36.7;
  lat_max CONSTANT numeric := 37.5;
  lng_min CONSTANT numeric := -9.2;
  lng_max CONSTANT numeric := -7.2;
  bad_before integer := 0;
  fixed_from_city integer := 0;
  nulled_remaining integer := 0;
  bad_after integer := 0;
BEGIN
  SELECT count(*)
  INTO bad_before
  FROM public.listings l
  WHERE l.status = 'published'
    AND (
      l.latitude IS NULL
      OR l.longitude IS NULL
      OR l.latitude < lat_min OR l.latitude > lat_max
      OR l.longitude < lng_min OR l.longitude > lng_max
    );

  UPDATE public.listings l
  SET latitude = c.latitude,
      longitude = c.longitude,
      updated_at = now()
  FROM public.cities c
  WHERE l.status = 'published'
    AND l.city_id = c.id
    AND c.latitude BETWEEN lat_min AND lat_max
    AND c.longitude BETWEEN lng_min AND lng_max
    AND (
      l.latitude IS NULL
      OR l.longitude IS NULL
      OR l.latitude < lat_min OR l.latitude > lat_max
      OR l.longitude < lng_min OR l.longitude > lng_max
    )
    AND (
      l.latitude IS DISTINCT FROM c.latitude
      OR l.longitude IS DISTINCT FROM c.longitude
    );

  GET DIAGNOSTICS fixed_from_city = ROW_COUNT;

  UPDATE public.listings l
  SET latitude = NULL,
      longitude = NULL,
      updated_at = now()
  WHERE l.status = 'published'
    AND (
      l.latitude IS NULL
      OR l.longitude IS NULL
      OR l.latitude < lat_min OR l.latitude > lat_max
      OR l.longitude < lng_min OR l.longitude > lng_max
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.cities c
      WHERE c.id = l.city_id
        AND c.latitude BETWEEN lat_min AND lat_max
        AND c.longitude BETWEEN lng_min AND lng_max
    )
    AND (l.latitude IS NOT NULL OR l.longitude IS NOT NULL);

  GET DIAGNOSTICS nulled_remaining = ROW_COUNT;

  SELECT count(*)
  INTO bad_after
  FROM public.listings l
  WHERE l.status = 'published'
    AND (
      l.latitude IS NULL
      OR l.longitude IS NULL
      OR l.latitude < lat_min OR l.latitude > lat_max
      OR l.longitude < lng_min OR l.longitude > lng_max
    );

  RAISE NOTICE 'Algarve listing coordinate cleanup: bad_before=%, fixed_from_city=%, nulled_remaining=%, bad_after=%',
    bad_before, fixed_from_city, nulled_remaining, bad_after;
END $$;
-- Validation query (same criteria requested):
-- SELECT id, name, latitude, longitude
-- FROM public.listings
-- WHERE status = 'published'
--   AND (
--     latitude < 36.7 OR latitude > 37.5 OR
--     longitude < -9.2 OR longitude > -7.2 OR
--     latitude IS NULL OR longitude IS NULL
--   );;
