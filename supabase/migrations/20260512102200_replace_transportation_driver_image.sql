-- Replace the repeated generic driver image used by transportation listings
-- with the AlgarveOfficial transportation fallback asset.
UPDATE public.listings
SET
  featured_image_url = '/images/fallbacks/AlgarveOfficial-transportation.png',
  updated_at = now()
WHERE featured_image_url = 'https://images.unsplash.com/photo-1754444528230-d27744e60044?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4ODYwNjR8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzI0NzI5Mjh8&ixlib=rb-4.1.0&q=80&w=1080';
