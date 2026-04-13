/**
 * Image Migration Script
 * 
 * Migrates external images to Supabase Storage
 * - Downloads image from external URL
 * - Converts to WEBP (max 1920px, quality 80)
 * - Uploads to Supabase Storage bucket 'listing-images'
 * - Updates DB with new URL
 * 
 * Usage: npx tsx scripts/migrate-images.ts
 * 
 * Environment variables required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (or ANON_KEY with service role)
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fetch from "node-fetch";
import { basename } from "path";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://your-project.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const BUCKET_NAME = "listing-images";
const MAX_WIDTH = 1920;
const QUALITY = 80;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

interface ImageRow {
  id: string;
  listing_id: string;
  image_url: string;
  alt_text: string | null;
  is_featured: boolean;
  display_order: number;
}

interface MigrationStats {
  total: number;
  processed: number;
  migrated: number;
  skipped: number;
  failed: number;
}

const stats: MigrationStats = { total: 0, processed: 0, migrated: 0, skipped: 0, failed: 0 };

/**
 * Check if URL is already a Supabase Storage URL
 */
function isSupabaseUrl(url: string): boolean {
  return url.includes("supabase.co/storage") || url.includes(`${SUPABASE_URL}/storage`);
}

/**
 * Check if URL is a valid image
 */
function isImageUrl(url: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff"];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
         url.includes("image") ||
         url.includes("photo") ||
         url.includes("img");
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Download image with retry
 */
async function downloadImage(url: string, retries = MAX_RETRIES): Promise<Buffer | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  ↳ Downloading (attempt ${attempt}/${retries})...`);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ImageMigrator/1.0)",
        }
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        console.log(`  ↳ HTTP ${response.status}, skipping`);
        return null;
      }
      
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        console.log(`  ↳ Not an image (${contentType}), skipping`);
        return null;
      }
      
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  ↳ Error: ${errorMessage}`);
      
      if (attempt < retries) {
        console.log(`  ↳ Retrying in ${RETRY_DELAY_MS}ms...`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }
  
  return null;
}

/**
 * Process image: convert to WEBP, resize, compress
 */
async function processImage(buffer: Buffer): Promise<Buffer | null> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    console.log(`  ↳ Original: ${metadata.width}x${metadata.height}, ${metadata.format}`);
    
    let pipeline = image.webp({ quality: QUALITY });
    
    if (metadata.width && metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: "inside"
      });
      console.log(`  ↳ Resizing to max width ${MAX_WIDTH}px`);
    }
    
    const optimized = await pipeline.toBuffer();
    console.log(`  ↳ Optimized: ${optimized.length} bytes (WEBP)`);
    
    return optimized;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`  ↳ Processing error: ${errorMessage}`);
    return null;
  }
}

/**
 * Upload to Supabase Storage
 */
async function uploadToSupabase(
  listingId: string,
  imageBuffer: Buffer,
  existingAltText: string | null
): Promise<string | null> {
  try {
    const timestamp = Date.now();
    const filename = `${listingId}/${timestamp}.webp`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, imageBuffer, {
        contentType: "image/webp",
        upsert: false
      });
    
    if (error) {
      console.log(`  ↳ Upload error: ${error.message}`);
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);
    
    const publicUrl = urlData.publicUrl;
    console.log(`  ↳ Uploaded: ${publicUrl}`);
    
    return publicUrl;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`  ↳ Upload error: ${errorMessage}`);
    return null;
  }
}

/**
 * Update database with new URL
 */
async function updateImageUrl(imageId: string, newUrl: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("listing_images")
      .update({ image_url: newUrl })
      .eq("id", imageId);
    
    if (error) {
      console.log(`  ↳ DB update error: ${error.message}`);
      return false;
    }
    
    return true;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`  ↳ DB update error: ${errorMessage}`);
    return false;
  }
}

/**
 * Get all external images that need migration
 */
async function getExternalImages(): Promise<ImageRow[]> {
  console.log("\n📋 Fetching external images from database...");
  
  const { data, error } = await supabase
    .from("listing_images")
    .select("id, listing_id, image_url, alt_text, is_featured, display_order")
    .not("image_url", "like", "%supabase.co/storage%");
  
  if (error) {
    console.error("❌ Failed to fetch images:", error.message);
    process.exit(1);
  }
  
  const images = data as ImageRow[];
  console.log(`✅ Found ${images.length} external images to process\n`);
  
  return images;
}

/**
 * Main migration function
 */
async function migrateImages() {
  console.log("🚀 Starting image migration to Supabase Storage");
  console.log(`   Bucket: ${BUCKET_NAME}`);
  console.log(`   Max width: ${MAX_WIDTH}px`);
  console.log(`   Quality: ${QUALITY}%`);
  console.log(`   Format: WEBP\n`);
  
  const images = await getExternalImages();
  stats.total = images.length;
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    stats.processed++;
    
    console.log(`\n[${stats.processed}/${stats.total}] Processing image ${image.id}`);
    console.log(`  Listing: ${image.listing_id}`);
    console.log(`  URL: ${image.image_url.substring(0, 80)}...`);
    
    // Skip if already Supabase URL
    if (isSupabaseUrl(image.image_url)) {
      console.log("  ↳ Already in Supabase, skipping");
      stats.skipped++;
      continue;
    }
    
    // Skip if not an image URL
    if (!isImageUrl(image.image_url)) {
      console.log("  ↳ Not a valid image URL, skipping");
      stats.skipped++;
      continue;
    }
    
    // Download
    console.log("  ↳ Downloading...");
    const buffer = await downloadImage(image.image_url);
    if (!buffer) {
      console.log("  ❌ Failed to download");
      stats.failed++;
      continue;
    }
    
    // Process
    console.log("  ↳ Processing...");
    const optimized = await processImage(buffer);
    if (!optimized) {
      console.log("  ❌ Failed to process");
      stats.failed++;
      continue;
    }
    
    // Upload
    console.log("  ↳ Uploading...");
    const newUrl = await uploadToSupabase(image.listing_id, optimized, image.alt_text);
    if (!newUrl) {
      console.log("  ❌ Failed to upload");
      stats.failed++;
      continue;
    }
    
    // Update DB
    console.log("  ↳ Updating database...");
    const updated = await updateImageUrl(image.id, newUrl);
    if (!updated) {
      console.log("  ❌ Failed to update DB");
      stats.failed++;
      continue;
    }
    
    stats.migrated++;
    console.log(`  ✅ Migrated successfully`);
  }
  
  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 MIGRATION COMPLETE");
  console.log("=".repeat(50));
  console.log(`  Total:     ${stats.total}`);
  console.log(`  Migrated: ${stats.migrated} ✅`);
  console.log(`  Skipped:  ${stats.skipped} ⊘`);
  console.log(`  Failed:   ${stats.failed} ❌`);
  console.log("=".repeat(50));
  
  if (stats.failed > 0) {
    console.log("\n⚠️  Some images failed. Check logs above for details.");
    console.log("   You can re-run the script to retry failed images.");
  }
  
  // Ensure bucket exists
  await ensureBucketExists();
}

/**
 * Ensure storage bucket exists
 */
async function ensureBucketExists() {
  console.log("\n🔧 Checking storage bucket...");
  
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.log(`  ⚠️  Could not list buckets: ${error.message}`);
    return;
  }
  
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.log(`  Creating bucket: ${BUCKET_NAME}`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
    });
    
    if (createError) {
      console.log(`  ⚠️  Could not create bucket: ${createError.message}`);
    } else {
      console.log(`  ✅ Bucket created`);
    }
  } else {
    console.log(`  ✅ Bucket exists`);
  }
}

// Run if executed directly
migrateImages().catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});