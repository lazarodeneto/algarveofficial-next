ALTER TABLE public.homepage_settings
ADD COLUMN IF NOT EXISTS hero_overlay_intensity INTEGER NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS hero_autoplay BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS hero_loop BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS hero_muted BOOLEAN NOT NULL DEFAULT true;
UPDATE public.homepage_settings
SET hero_overlay_intensity = COALESCE(hero_overlay_intensity, 50),
    hero_autoplay = COALESCE(hero_autoplay, true),
    hero_loop = COALESCE(hero_loop, true),
    hero_muted = COALESCE(hero_muted, true);
