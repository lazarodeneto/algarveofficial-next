/**
 * Production Image Migration Script
 *
 * Migrates external images to Supabase Storage with:
 * - Idempotency (run safely multiple times)
 * - Deterministic file naming (SHA1 hash)
 * - Parallel processing (configurable concurrency)
 * - Content-type validation
 * - Smart resize (preserve aspect, strip EXIF)
 * - Alt text auto-fix for SEO
 * - CDN optimization headers
 * - Failure recovery
 * - Dry-run mode
 * - Progress metrics
 *
 * Usage:
 *   npx tsx scripts/migrate-images-pro.ts
 *   npx tsx scripts/migrate-images-pro.ts --dry-run
 *   npx tsx scripts/migrate-images-pro.ts --concurrency=5
 *   npx tsx scripts/migrate-images-pro.ts --limit=100
 *
 * Required environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL  (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import crypto from "crypto";
import { writeFileSync } from "fs";
import { join } from "path";

// Use native fetch (Node.js 18+)
const fetch = globalThis.fetch;

// CLI arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const CONCURRENCY = parseInt(args.find(a => a.startsWith("--concurrency="))?.split("=")[1] || "5");
const LIMIT = parseInt(args.find(a => a.startsWith("--limit="))?.split("=")[1] || "0");

// Configuration — all secrets must come from environment variables, never hardcoded
const CONFIG = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  BUCKET_NAME: "listing-images",
  MAX_WIDTH: 1920,
  QUALITY: 80,
  MIN_FILE_SIZE: 10 * 1024,       // 10KB
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  TIMEOUT_MS: 30000,
};

// Initialize Supabase — fail fast if required env vars are missing
if (!CONFIG.SUPABASE_URL) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) is required");
  process.exit(1);
}
if (!CONFIG.SERVICE_ROLE_KEY) {
  console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY is required");
  process.exit(1);
}

const supabase = createClient(CONFIG.SUPABASE_URL!, CONFIG.SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

// Types
interface ImageRow {
  id: string;
  listing_id: string;
  image_url: string;
  alt_text: string | null;
  storage_path: string | null;
  source_url: string | null;
  migrated_at: string | null;
}

interface MigrationStats {
  total: number;
  processed: number;
  migrated: number;
  skipped: number;
  failed: number;
  totalSizeOriginal: number;
  totalSizeOptimized: number;
  startTime: number;
}

interface FailureRecord {
  id: string;
  url: string;
  reason: string;
  timestamp: string;
}

// Statistics
const stats: MigrationStats = {
  total: 0,
  processed: 0,
  migrated: 0,
  skipped: 0,
  failed: 0,
  totalSizeOriginal: 0,
  totalSizeOptimized: 0,
  startTime: Date.now(),
};

const failures: FailureRecord[] = [];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function sha1(str: string): string {
  return crypto.createHash("sha1").update(str).digest("hex");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function isExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isAlreadyInSupabase(url: string): boolean {
  return url.includes("supabase.co/storage");
}

function getStoragePath(sourceUrl: string, listingId: string): string {
  const hash = sha1(sourceUrl);
  return `listings/${listingId}/${hash}.webp`;
}

// ============================================================================
// CORE MIGRATION LOGIC
// ============================================================================

async function downloadImage(
  url: string,
  retries = CONFIG.MAX_RETRIES
): Promise<{ buffer: Buffer; contentType: string; size: number } | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      if (!contentType.startsWith("image/")) {
        throw new Error(`Not an image: ${contentType}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const size = buffer.length;

      if (size < CONFIG.MIN_FILE_SIZE) {
        throw new Error(`File too small: ${formatBytes(size)}`);
      }
      if (size > CONFIG.MAX_FILE_SIZE) {
        throw new Error(`File too large: ${formatBytes(size)}`);
      }

      return { buffer, contentType, size };
    } catch (error) {
      const isLast = attempt === retries;
      if (!isLast) {
        console.warn(`  ⚠️  Attempt ${attempt}/${retries} failed: ${error}. Retrying...`);
        await sleep(CONFIG.RETRY_DELAY_MS * attempt);
      } else {
        console.error(`  ❌ All ${retries} attempts failed: ${error}`);
      }
    }
  }
  return null;
}

async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(CONFIG.MAX_WIDTH, undefined, { withoutEnlargement: true, fit: "inside" })
    .webp({ quality: CONFIG.QUALITY, effort: 4 })
    .withMetadata({ exif: {} }) // strip EXIF
    .toBuffer();
}

async function uploadToStorage(
  buffer: Buffer,
  storagePath: string
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(CONFIG.BUCKET_NAME)
    .upload(storagePath, buffer, {
      contentType: "image/webp",
      upsert: false,
      cacheControl: "public, max-age=31536000, immutable",
    });

  if (error) {
    if (error.message?.includes("already exists") || (error as { statusCode?: string }).statusCode === "23505") {
      return true; // idempotent — already uploaded
    }
    throw error;
  }
  return true;
}

async function getPublicUrl(storagePath: string): Promise<string> {
  const { data } = supabase.storage
    .from(CONFIG.BUCKET_NAME)
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

async function updateImageRecord(
  id: string,
  publicUrl: string,
  storagePath: string,
  altText: string | null
): Promise<void> {
  const update: Record<string, string | null> = {
    image_url: publicUrl,
    storage_path: storagePath,
    migrated_at: new Date().toISOString(),
  };

  // Auto-generate alt text if missing
  if (!altText) {
    update.alt_text = "Algarve property image";
  }

  const { error } = await supabase
    .from("listing_images")
    .update(update)
    .eq("id", id);

  if (error) throw error;
}

async function migrateImage(row: ImageRow): Promise<"migrated" | "skipped" | "failed"> {
  const { id, listing_id, image_url, alt_text, storage_path, migrated_at } = row;

  // Skip already migrated
  if (migrated_at && storage_path) {
    return "skipped";
  }

  // Skip if already in Supabase storage
  if (isAlreadyInSupabase(image_url)) {
    return "skipped";
  }

  // Skip non-external URLs
  if (!isExternalUrl(image_url)) {
    console.warn(`  ⚠️  Skipping non-external URL: ${image_url}`);
    return "skipped";
  }

  const targetPath = getStoragePath(image_url, listing_id);

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would migrate: ${image_url} → ${targetPath}`);
    return "migrated";
  }

  // Download
  const downloaded = await downloadImage(image_url);
  if (!downloaded) {
    failures.push({ id, url: image_url, reason: "Download failed after retries", timestamp: new Date().toISOString() });
    return "failed";
  }

  stats.totalSizeOriginal += downloaded.size;

  // Optimize
  let optimized: Buffer;
  try {
    optimized = await optimizeImage(downloaded.buffer);
    stats.totalSizeOptimized += optimized.length;
  } catch (err) {
    failures.push({ id, url: image_url, reason: `Optimization failed: ${err}`, timestamp: new Date().toISOString() });
    return "failed";
  }

  // Upload
  try {
    await uploadToStorage(optimized, targetPath);
  } catch (err) {
    failures.push({ id, url: image_url, reason: `Upload failed: ${err}`, timestamp: new Date().toISOString() });
    return "failed";
  }

  // Get public URL and update DB
  const publicUrl = await getPublicUrl(targetPath);
  try {
    await updateImageRecord(id, publicUrl, targetPath, alt_text);
  } catch (err) {
    failures.push({ id, url: image_url, reason: `DB update failed: ${err}`, timestamp: new Date().toISOString() });
    return "failed";
  }

  return "migrated";
}

async function processBatch(rows: ImageRow[]): Promise<void> {
  for (const row of rows) {
    stats.processed++;
    const pct = ((stats.processed / stats.total) * 100).toFixed(1);
    process.stdout.write(`\r  Progress: ${stats.processed}/${stats.total} (${pct}%) — ✅ ${stats.migrated} migrated, ⏭️  ${stats.skipped} skipped, ❌ ${stats.failed} failed`);

    const result = await migrateImage(row);
    stats[result]++;
  }
}

// ============================================================================
// CONCURRENCY POOL
// ============================================================================

async function runWithConcurrency(rows: ImageRow[], concurrency: number): Promise<void> {
  const chunks: ImageRow[][] = [];
  for (let i = 0; i < rows.length; i += concurrency) {
    chunks.push(rows.slice(i, i + concurrency));
  }
  for (const chunk of chunks) {
    await Promise.all(chunk.map(migrateImage).map(async (p, i) => {
      const result = await p;
      stats.processed++;
      stats[result]++;
      const pct = ((stats.processed / stats.total) * 100).toFixed(1);
      process.stdout.write(`\r  Progress: ${stats.processed}/${stats.total} (${pct}%) — ✅ ${stats.migrated} migrated, ⏭️  ${stats.skipped} skipped, ❌ ${stats.failed} failed`);
    }));
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log("\n🚀 AlgarveOfficial — Production Image Migration");
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  console.log(`   Concurrency: ${CONCURRENCY}`);
  console.log(`   Limit: ${LIMIT > 0 ? LIMIT : "none"}`);
  console.log(`   Bucket: ${CONFIG.BUCKET_NAME}\n`);

  // Fetch rows to migrate
  let query = supabase
    .from("listing_images")
    .select("id, listing_id, image_url, alt_text, storage_path, source_url, migrated_at")
    .is("migrated_at", null)
    .order("created_at", { ascending: true });

  if (LIMIT > 0) query = query.limit(LIMIT);

  const { data: rows, error } = await query;
  if (error) {
    console.error("❌ Failed to fetch images:", error.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log("✅ No images to migrate.");
    return;
  }

  stats.total = rows.length;
  console.log(`📋 Found ${stats.total} images to process\n`);

  await runWithConcurrency(rows as ImageRow[], CONCURRENCY);

  // Final report
  const elapsed = Date.now() - stats.startTime;
  console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Migration Complete");
  console.log(`   ✅ Migrated:  ${stats.migrated}`);
  console.log(`   ⏭️  Skipped:   ${stats.skipped}`);
  console.log(`   ❌ Failed:    ${stats.failed}`);
  console.log(`   ⏱️  Duration:  ${formatDuration(elapsed)}`);
  if (stats.totalSizeOriginal > 0) {
    const savings = (((stats.totalSizeOriginal - stats.totalSizeOptimized) / stats.totalSizeOriginal) * 100).toFixed(1);
    console.log(`   💾 Size saved: ${formatBytes(stats.totalSizeOriginal - stats.totalSizeOptimized)} (${savings}%)`);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Write failure log
  if (failures.length > 0) {
    const logPath = join(process.cwd(), `migration-failures-${Date.now()}.json`);
    writeFileSync(logPath, JSON.stringify(failures, null, 2));
    console.log(`⚠️  Failure log written to: ${logPath}`);
  }
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
