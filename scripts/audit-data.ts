import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://niylxpvafywjonrphddp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5NDM1MTI5OTZ9.CRXP1am7Eh14ZT0L86g-Ct6wD4a1O1h0VJ5M1M1yX6AQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log('🔍 Running Data Quality Audit...\n');

  // 1. Listings
  console.log('=== LISTINGS ===');
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, name, category_id, city_id, tier, image_url, hero_image_url, created_at')
    .order('created_at', { ascending: false });

  if (listingsError) {
    console.error('Error:', listingsError.message);
    return;
  }

  console.log(`Total: ${listings?.length || 0}\n`);

  // 2. Categories
  console.log('=== CATEGORIES ===');
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('display_order');

  console.log(`Total: ${categories?.length || 0}`);
  categories?.forEach(c => console.log(`  ${c.id}: ${c.name} (${c.slug})`));
  console.log();

  // 3. Cities with regions
  console.log('=== CITIES ===');
  const { data: cities } = await supabase
    .from('cities')
    .select('id, name, slug, region_id')
    .order('name');

  console.log(`Total: ${cities?.length || 0}`);
  cities?.slice(0, 20).forEach(c => console.log(`  ${c.id}: ${c.name} [region: ${c.region_id}]`));
  if ((cities?.length || 0) > 20) console.log(`  ... and ${(cities?.length || 0) - 20} more`);
  console.log();

  // 4. Regions
  console.log('=== REGIONS ===');
  const { data: regions } = await supabase
    .from('regions')
    .select('id, name, slug')
    .order('name');

  console.log(`Total: ${regions?.length || 0}`);
  regions?.forEach(r => console.log(`  ${r.id}: ${r.name} (${r.slug})`));
  console.log();

  // 5. Missing images
  console.log('=== MISSING IMAGES ===');
  const missingImages = listings?.filter(l => !l.image_url || l.image_url === '') || [];
  console.log(`Missing: ${missingImages.length}`);
  missingImages.forEach(l => console.log(`  - ${l.name}`));
  console.log();

  // 6. Category mapping verification
  console.log('=== CATEGORY MAPPINGS ===');
  const categoryIds = new Set(categories?.map(c => c.id));
  const cityIds = new Set(cities?.map(c => c.id));
  
  const badCategory = listings?.filter(l => l.category_id && !categoryIds.has(l.category_id)) || [];
  const badCity = listings?.filter(l => l.city_id && !cityIds.has(l.city_id)) || [];

  console.log(`Invalid category_id: ${badCategory.length}`);
  badCategory.forEach(l => console.log(`  ${l.name}: category_id=${l.category_id}`));
  console.log(`Invalid city_id: ${badCity.length}`);
  badCity.forEach(l => console.log(`  ${l.name}: city_id=${l.city_id}`));
  console.log();

  // 7. Duplicates
  console.log('=== DUPLICATES ===');
  const nameCount = new Map<string, number>();
  listings?.forEach(l => {
    if (!l.name || !l.city_id) return;
    const key = `${l.name.toLowerCase().trim()}-${l.city_id}`;
    nameCount.set(key, (nameCount.get(key) || 0) + 1);
  });

  const duplicates = Array.from(nameCount.entries()).filter(([_, c]) => c > 1);
  console.log(`Dupes: ${duplicates.length}`);
  duplicates.forEach(([k]) => console.log(`  ${k}`));
  console.log();

  // 8. Tier breakdown
  console.log('=== TIER BREAKDOWN ===');
  const tierCount = { signature: 0, verified: 0, unverified: 0, null: 0 };
  listings?.forEach(l => {
    if (l.tier === 'signature') tierCount.signature++;
    else if (l.tier === 'verified') tierCount.verified++;
    else if (l.tier === 'unverified') tierCount.unverified++;
    else tierCount.null++;
  });
  console.log(`  signature: ${tierCount.signature}`);
  console.log(`  verified: ${tierCount.verified}`);
  console.log(`  unverified: ${tierCount.unverified}`);
  console.log(`  null: ${tierCount.null}`);
  console.log();

  // Summary
  console.log('=== SUMMARY ===');
  console.log({
    total_listings: listings?.length || 0,
    total_categories: categories?.length || 0,
    total_cities: cities?.length || 0,
    total_regions: regions?.length || 0,
    issues: {
      missing_images: missingImages.length,
      invalid_categories: badCategory.length,
      invalid_cities: badCity.length,
      duplicates: duplicates.length,
    },
    tiers: tierCount,
  });
}

runAudit().catch(console.error);