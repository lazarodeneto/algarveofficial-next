-- Update cities with proper GPS coordinates for the Algarve region
UPDATE cities SET latitude = 37.0893, longitude = -8.2479 WHERE slug = 'albufeira';
UPDATE cities SET latitude = 37.0648, longitude = -8.0329 WHERE slug = 'almancil';
UPDATE cities SET latitude = 37.1314, longitude = -8.5928 WHERE slug = 'alvor';
UPDATE cities SET latitude = 37.0977, longitude = -8.4722 WHERE slug = 'carvoeiro';
UPDATE cities SET latitude = 37.1239, longitude = -8.5161 WHERE slug = 'ferragudo';
UPDATE cities SET latitude = 37.0542, longitude = -7.7475 WHERE slug = 'fuseta';
UPDATE cities SET latitude = 37.1353, longitude = -8.4521 WHERE slug = 'lagoa';
UPDATE cities SET latitude = 37.1028, longitude = -8.6730 WHERE slug = 'lagos';
UPDATE cities SET latitude = 37.3167, longitude = -8.5500 WHERE slug = 'monchique';
UPDATE cities SET latitude = 37.0261, longitude = -7.8416 WHERE slug = 'olhao';
UPDATE cities SET latitude = 37.1394, longitude = -8.5369 WHERE slug = 'portimao';
UPDATE cities SET latitude = 37.1217, longitude = -8.5339 WHERE slug = 'praia-da-rocha';
UPDATE cities SET latitude = 37.0672, longitude = -8.1058 WHERE slug = 'quarteira';
UPDATE cities SET latitude = 37.0500, longitude = -8.0167 WHERE slug = 'quinta-do-lago';
UPDATE cities SET latitude = 37.0089, longitude = -8.9406 WHERE slug = 'sagres';
UPDATE cities SET latitude = 37.1028, longitude = -7.6536 WHERE slug = 'santa-luzia';
UPDATE cities SET latitude = 37.1275, longitude = -7.6506 WHERE slug = 'tavira';
UPDATE cities SET latitude = 37.0556, longitude = -8.0389 WHERE slug = 'vale-do-lobo';
UPDATE cities SET latitude = 37.0833, longitude = -8.8833 WHERE slug = 'vila-do-bispo';
UPDATE cities SET latitude = 37.0753, longitude = -8.1175 WHERE slug = 'vilamoura';
-- Create city-region mappings based on geography
-- Golden Triangle: Almancil, Quinta do Lago, Vale do Lobo
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'almancil' AND r.slug = 'golden-triangle';
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'quinta-do-lago' AND r.slug = 'golden-triangle';
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'vale-do-lobo' AND r.slug = 'golden-triangle';
-- Vilamoura Prestige: Vilamoura, Quarteira
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'vilamoura' AND r.slug = 'vilamoura-prestige';
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'quarteira' AND r.slug = 'vilamoura-prestige';
-- Carvoeiro Cliffs: Carvoeiro, Lagoa, Ferragudo
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'carvoeiro' AND r.slug = 'carvoeiro-cliffs';
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'lagoa' AND r.slug = 'carvoeiro-cliffs';
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'ferragudo' AND r.slug = 'carvoeiro-cliffs';
-- Lagos Signature: Lagos
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'lagos' AND r.slug = 'lagos-signature';
-- Tavira Heritage: Tavira, Santa Luzia
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'tavira' AND r.slug = 'tavira-heritage';
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'santa-luzia' AND r.slug = 'tavira-heritage';
-- Ria Formosa Reserve: Olhão, Fuseta
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'olhao' AND r.slug = 'ria-formosa-reserve';
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'fuseta' AND r.slug = 'ria-formosa-reserve';
-- Monchique Retreats: Monchique
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'monchique' AND r.slug = 'monchique-retreats';
-- Sagres Atlantic: Sagres, Vila do Bispo
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'sagres' AND r.slug = 'sagres-atlantic';
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'vila-do-bispo' AND r.slug = 'sagres-atlantic';
-- Portimão Prime: Portimão, Praia da Rocha, Alvor
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'portimao' AND r.slug = 'portimao-prime';
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'praia-da-rocha' AND r.slug = 'portimao-prime';
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'alvor' AND r.slug = 'portimao-prime';
-- Private Algarve: Albufeira (major tourist hub)
INSERT INTO city_region_mapping (city_id, region_id, is_primary)
SELECT c.id, r.id, true FROM cities c, regions r WHERE c.slug = 'albufeira' AND r.slug = 'private-algarve';
