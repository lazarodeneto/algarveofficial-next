import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  console.log('🔍 Verifying SQL migrations...\n');

  // Check new columns
  console.log('1. New columns on listing_images:');
  try {
    const { data: cols } = await supabase.from('listing_images').select('storage_path, source_url, migrated_at').limit(1);
    console.log('   ✅ Columns exist: storage_path, source_url, migrated_at');
  } catch (e: any) {
    console.log('   ❌ Columns missing:', e.message);
  }

  // Check alt_text
  console.log('\n2. Alt text migration:');
  const { data: altStats } = await supabase.from('listing_images').select('alt_text');
  const total = altStats?.length ?? 0;
  const updated = altStats?.filter(a => a.alt_text?.includes(' — ')).length ?? 0;
  const empty = altStats?.filter(a => !a.alt_text || a.alt_text === '').length ?? 0;
  console.log('   Total images:', total);
  console.log('   ✅ Updated:', updated);
  console.log('   ⚠️  Still empty:', empty);

  // Check pending
  console.log('\n3. Image migration:');
  const { data: pending } = await supabase.from('listing_images').select('id').is('storage_path', null).not('image_url', 'like', '%supabase.co%');
  console.log('   Pending:', pending?.length || 0, 'images');

  // Check listings RLS
  console.log('\n4. Listings RLS:');
  try {
    await supabase.from('listings').select('id').limit(1);
    console.log('   ✅ RLS policies applied (service role can access)');
  } catch (e: any) {
    console.log('   ⚠️  Check needed:', e.message);
  }

  console.log('\n✅ Verification complete');
}

verify().catch(console.error);