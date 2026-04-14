-- Populate coordinates for all 20 Algarve cities
UPDATE cities SET latitude = 37.0833, longitude = -8.0333 WHERE slug = 'almancil';
UPDATE cities SET latitude = 37.0333, longitude = -8.0167 WHERE slug = 'quinta-do-lago';
UPDATE cities SET latitude = 37.0500, longitude = -8.0667 WHERE slug = 'vale-do-lobo';
UPDATE cities SET latitude = 37.0783, longitude = -8.1186 WHERE slug = 'vilamoura';
UPDATE cities SET latitude = 37.0694, longitude = -8.1000 WHERE slug = 'quarteira';
UPDATE cities SET latitude = 37.0886, longitude = -8.2500 WHERE slug = 'albufeira';
UPDATE cities SET latitude = 37.1358, longitude = -8.4522 WHERE slug = 'lagoa';
UPDATE cities SET latitude = 37.0947, longitude = -8.4714 WHERE slug = 'carvoeiro';
UPDATE cities SET latitude = 37.1244, longitude = -8.5208 WHERE slug = 'ferragudo';
UPDATE cities SET latitude = 37.1386, longitude = -8.5367 WHERE slug = 'portimao';
UPDATE cities SET latitude = 37.1175, longitude = -8.5344 WHERE slug = 'praia-da-rocha';
UPDATE cities SET latitude = 37.1308, longitude = -8.5975 WHERE slug = 'alvor';
UPDATE cities SET latitude = 37.1028, longitude = -8.6731 WHERE slug = 'lagos';
UPDATE cities SET latitude = 37.0081, longitude = -8.9406 WHERE slug = 'sagres';
UPDATE cities SET latitude = 37.0833, longitude = -8.9000 WHERE slug = 'vila-do-bispo';
UPDATE cities SET latitude = 37.1267, longitude = -7.6500 WHERE slug = 'tavira';
UPDATE cities SET latitude = 37.1125, longitude = -7.6458 WHERE slug = 'santa-luzia';
UPDATE cities SET latitude = 37.0261, longitude = -7.8411 WHERE slug = 'olhao';
UPDATE cities SET latitude = 37.0511, longitude = -7.7456 WHERE slug = 'fuseta';
UPDATE cities SET latitude = 37.3189, longitude = -8.5544 WHERE slug = 'monchique';
-- Update demo listings with exact coordinates
UPDATE listings SET latitude = 37.0847, longitude = -8.2147, address = 'Praia da Falésia, Albufeira' WHERE slug = 'pine-cliffs-resort';
UPDATE listings SET latitude = 37.0486, longitude = -8.0253, address = 'Vila Vita Parc, Alporchinhos' WHERE slug = 'ocean-restaurant';
UPDATE listings SET latitude = 37.1892, longitude = -7.6089, address = 'Monte Rei, Vila Nova de Cacela' WHERE slug = 'monte-rei-golf-country-club';
UPDATE listings SET latitude = 37.0431, longitude = -8.0331, address = 'Praia do Ancão, Almancil' WHERE slug = 'blanco-beach-club';
UPDATE listings SET latitude = 37.0486, longitude = -8.0253, address = 'Conrad Algarve, Quinta do Lago' WHERE slug = 'serenity-spa-at-conrad';
