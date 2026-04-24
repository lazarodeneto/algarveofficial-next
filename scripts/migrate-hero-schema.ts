import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateHeroSchema() {
  console.log("[MIGRATION] Starting hero schema migration...");

  const { data: versions, error } = await supabase
    .from("cms_document_versions")
    .select("id, document_id, content, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[MIGRATION] Error fetching versions:", error);
    return;
  }

  console.log(`[MIGRATION] Found ${versions.length} document versions`);

  let migrated = 0;
  let skipped = 0;

  for (const version of versions) {
    const content = version.content as Record<string, unknown> | null;
    if (!content || typeof content !== "object") {
      skipped++;
      continue;
    }

    const text = content.text as Record<string, string> | undefined;
    const hasLegacyHero = text && (
      text["hero.imageUrl"] ||
      text["hero.videoUrl"] ||
      text["hero.youtubeUrl"] ||
      text["hero.posterUrl"]
    );
    const hasStructuredHero = content.hero;

    if (hasLegacyHero && !hasStructuredHero) {
      const heroData = {
        enabled: true,
        mediaType: (text?.["hero.mediaType"] as "image" | "video" | "youtube") || "image",
        imageUrl: text?.["hero.imageUrl"] || null,
        videoUrl: text?.["hero.videoUrl"] || null,
        youtubeUrl: text?.["hero.youtubeUrl"] || null,
        posterUrl: text?.["hero.posterUrl"] || null,
        alt: text?.["hero.alt"],
        badge: text?.["hero.badge"],
        title: text?.["hero.title"],
        subtitle: text?.["hero.subtitle"],
        ctaCourses: text?.["hero.cta.courses"],
        ctaLeaderboard: text?.["hero.cta.leaderboard"],
      };

      const updatedContent = { ...content, hero: heroData };

      const { error: updateError } = await supabase
        .from("cms_document_versions")
        .update({ content: updatedContent })
        .eq("id", version.id);

      if (updateError) {
        console.error(`[MIGRATION] Error updating version ${version.id}:`, updateError);
      } else {
        migrated++;
        if (migrated % 10 === 0) {
          console.log(`[MIGRATION] Migrated ${migrated} versions...`);
        }
      }
    } else {
      skipped++;
    }
  }

  console.log(`[MIGRATION] Complete! Migrated: ${migrated}, Skipped: ${skipped}`);
}

migrateHeroSchema()
  .then(() => console.log("[MIGRATION] Done"))
  .catch((err) => console.error("[MIGRATION] Failed:", err));