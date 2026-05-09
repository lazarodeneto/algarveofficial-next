import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dryRun = process.argv.includes("--dry-run");

const migrationFiles = [
  "supabase/migrations/20260509120000_update_morgado_golf_listing.sql",
  "supabase/migrations/20260509121000_update_quinta_do_lago_south_course.sql",
  "supabase/migrations/20260509122000_update_espiche_golf_listing.sql",
  "supabase/migrations/20260509123000_update_amendoeira_faldo_course.sql",
  "supabase/migrations/20260509124000_update_alamos_golf_course.sql",
  "supabase/migrations/20260509125000_update_laguna_golf_course.sql",
  "supabase/migrations/20260509130000_update_alto_golf_course.sql",
  "supabase/migrations/20260509131000_update_amendoeira_oconnor_jnr_course.sql",
  "supabase/migrations/20260509132000_update_quinta_do_lago_north_course.sql",
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const allowedKeys = new Set([
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
  ]);

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || !allowedKeys.has(match[1]) || process.env[match[1]]) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function extractJsonBlock(sql, tag) {
  const re = new RegExp(`\\$${tag}\\$\\n([\\s\\S]*?)\\n\\$${tag}\\$::jsonb`);
  const match = sql.match(re);
  if (!match) throw new Error(`Missing ${tag} block`);
  return JSON.parse(match[1]);
}

function extractOwnerId(sql) {
  const match = sql.match(/v_owner_id uuid := '([^']+)'::uuid/);
  if (!match) throw new Error("Missing owner id declaration");
  return match[1];
}

function extractTags(sql) {
  const matches = [...sql.matchAll(/tags\s*=\s*array\[([^\]]+)\]/g)];
  const raw = matches.at(-1)?.[1];
  if (!raw) return ["golf"];
  return [...raw.matchAll(/'((?:''|[^'])*)'/g)].map((match) =>
    match[1].replace(/''/g, "'")
  );
}

function extractSlugAliases(sql, canonicalSlug) {
  const match = sql.match(/where slug in \(([^)]+)\)/i);
  const aliases = match
    ? [...match[1].matchAll(/'((?:''|[^'])*)'/g)].map((item) =>
        item[1].replace(/''/g, "'")
      )
    : [];
  return [...new Set([canonicalSlug, ...aliases])];
}

function normalizeSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’‘`´]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function scorecardHoles(scorecard) {
  return scorecard.map((hole) => {
    const entry = {
      hole_number: hole.hole,
      par: hole.par,
      stroke_index: hole.hcp,
    };

    for (const [key, value] of Object.entries(hole)) {
      if (["hole", "par", "hcp"].includes(key)) continue;
      if (["white", "yellow", "red"].includes(key)) {
        entry[`distance_${key}`] = value;
      } else {
        entry[key] = value;
      }
    }

    return entry;
  });
}

function readCourse(file) {
  const sql = fs.readFileSync(path.join(root, file), "utf8");
  const scorecard = extractJsonBlock(sql, "scorecard");
  const categoryData = extractJsonBlock(sql, "category");
  const slug = categoryData.seo?.slug;
  if (!slug) throw new Error(`${file}: missing category_data.seo.slug`);

  const name =
    categoryData.seo?.meta_title?.split("|")[0]?.trim() ||
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  return {
    file,
    ownerId: extractOwnerId(sql),
    name,
    slug,
    aliases: extractSlugAliases(sql, slug),
    tags: extractTags(sql),
    scorecard,
    categoryData: {
      ...categoryData,
      scorecard,
      scorecard_holes: scorecardHoles(scorecard),
    },
  };
}

function assertNoError(result, context) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  return result.data;
}

async function getSingleBySlug(supabase, table, slug) {
  const result = await supabase.from(table).select("id").eq("slug", slug).maybeSingle();
  if (result.error) throw new Error(`${table} ${slug}: ${result.error.message}`);
  return result.data?.id ?? null;
}

async function upsertReferenceData(supabase, course) {
  const cityName = course.categoryData.address?.city ?? "Lagoa";
  const citySlug = normalizeSlug(cityName);

  if (dryRun) {
    return {
      categoryId: "dry-run-category",
      regionId: "dry-run-region",
      cityId: "dry-run-city",
    };
  }

  await assertNoError(
    await supabase
      .from("categories")
      .upsert(
        { name: "Golf", slug: "golf", is_active: true, is_featured: false, display_order: 30 },
        { onConflict: "slug" }
      ),
    "upsert category"
  );

  await assertNoError(
    await supabase
      .from("regions")
      .upsert({ name: "Algarve", slug: "algarve", is_active: true, is_featured: true }, { onConflict: "slug" }),
    "upsert region"
  );

  await assertNoError(
    await supabase
      .from("cities")
      .upsert({ name: cityName, slug: citySlug, is_active: true, is_featured: false }, { onConflict: "slug" }),
    `upsert city ${citySlug}`
  );

  return {
    categoryId: await getSingleBySlug(supabase, "categories", "golf"),
    regionId: await getSingleBySlug(supabase, "regions", "algarve"),
    cityId: await getSingleBySlug(supabase, "cities", citySlug),
  };
}

async function findListing(supabase, course) {
  const bySlug = await supabase
    .from("listings")
    .select("id, slug")
    .in("slug", course.aliases);
  assertNoError(bySlug, `select listing ${course.slug}`);

  if (bySlug.data.length > 0) {
    return bySlug.data.find((row) => row.slug === course.slug) ?? bySlug.data[0];
  }

  const byName = await supabase
    .from("listings")
    .select("id, slug")
    .eq("name", course.name)
    .order("updated_at", { ascending: false })
    .limit(1);
  assertNoError(byName, `select listing by name ${course.name}`);
  if (byName.data.length > 0) return byName.data[0];

  const byAlias = await supabase
    .from("listing_slugs")
    .select("listing_id, slug")
    .in("slug", course.aliases);
  if (!byAlias.error && byAlias.data.length > 0) {
    const listing = await supabase
      .from("listings")
      .select("id, slug")
      .eq("id", byAlias.data[0].listing_id)
      .maybeSingle();
    assertNoError(listing, `select listing from alias ${course.slug}`);
    return listing.data;
  }

  return null;
}

function listingPayload(course, refs) {
  const data = course.categoryData;
  return {
    name: course.name,
    slug: course.slug,
    description: data.content?.full_description ?? null,
    short_description: data.content?.short_description ?? null,
    owner_id: course.ownerId,
    category_id: refs.categoryId,
    city_id: refs.cityId,
    region_id: refs.regionId,
    tier: "unverified",
    status: "published",
    is_curated: false,
    website_url: data.contact?.website ?? null,
    contact_phone: data.contact?.phone ?? null,
    contact_email: data.contact?.email ?? null,
    address: data.address?.full_address ?? data.location?.address ?? null,
    latitude: data.address?.latitude ?? data.location?.latitude ?? null,
    longitude: data.address?.longitude ?? data.location?.longitude ?? null,
    instagram_url: data.socials?.instagram ?? null,
    facebook_url: data.socials?.facebook ?? null,
    linkedin_url: data.socials?.linkedin ?? null,
    twitter_url: data.socials?.x_twitter ?? null,
    youtube_url: data.socials?.youtube ?? null,
    tiktok_url: data.socials?.tiktok ?? null,
    google_business_url: data.business_details?.google_business_url ?? null,
    google_rating: data.business_details?.google_rating ?? null,
    google_review_count: data.business_details?.google_review_count ?? null,
    category_data: data,
    tags: course.tags,
    meta_title: data.seo?.meta_title ?? null,
    meta_description: data.seo?.meta_description ?? null,
  };
}

async function syncSlugAliases(supabase, listingId, course) {
  const probe = await supabase.from("listing_slugs").select("id").limit(1);
  if (probe.error) return;

  await assertNoError(
    await supabase.from("listing_slugs").update({ is_current: false }).eq("listing_id", listingId),
    `clear aliases ${course.slug}`
  );

  for (const alias of course.aliases.filter((slug) => slug !== course.slug)) {
    const existing = await supabase
      .from("listing_slugs")
      .select("id, listing_id")
      .eq("slug", alias)
      .maybeSingle();
    assertNoError(existing, `select alias ${alias}`);

    if (!existing.data) {
      await assertNoError(
        await supabase.from("listing_slugs").insert({ listing_id: listingId, slug: alias, is_current: false }),
        `insert alias ${alias}`
      );
    } else if (existing.data.listing_id === listingId) {
      await assertNoError(
        await supabase.from("listing_slugs").update({ is_current: false }).eq("id", existing.data.id),
        `update alias ${alias}`
      );
    } else {
      console.warn(`Skipped alias ${alias}: already belongs to another listing`);
    }
  }

  const current = await supabase
    .from("listing_slugs")
    .select("id, listing_id")
    .eq("slug", course.slug)
    .maybeSingle();
  assertNoError(current, `select current alias ${course.slug}`);

  if (!current.data) {
    await assertNoError(
      await supabase.from("listing_slugs").insert({ listing_id: listingId, slug: course.slug, is_current: true }),
      `insert current alias ${course.slug}`
    );
  } else if (current.data.listing_id === listingId) {
    await assertNoError(
      await supabase.from("listing_slugs").update({ is_current: true }).eq("id", current.data.id),
      `update current alias ${course.slug}`
    );
  } else {
    throw new Error(`Canonical slug ${course.slug} belongs to another listing`);
  }
}

function golfCoursePayload(course, listingId) {
  const data = course.categoryData.golf ?? course.categoryData;
  return {
    listing_id: listingId,
    name: course.name,
    holes_count: data.holes ?? course.categoryData.holes_count ?? 18,
    is_default: true,
    holes: data.holes ?? course.categoryData.holes_count ?? 18,
    par: data.par ?? course.categoryData.par ?? null,
    slope: data.slope ?? course.categoryData.slope_rating ?? null,
    course_rating: data.course_rating ?? course.categoryData.course_rating ?? null,
    length_meters: data.length_meters ?? course.categoryData.length_meters ?? null,
    designer: data.designer ?? course.categoryData.designer ?? null,
    year_opened: data.year_opened ?? course.categoryData.year_opened ?? null,
    last_renovation: data.last_renovation ?? null,
    layout_type: data.layout_type ?? data.course_type ?? null,
    difficulty: data.difficulty ?? null,
    is_tournament_course: data.is_tournament_course ?? false,
    is_signature: data.is_signature ?? false,
  };
}

function golfHoleRows(course, listingId, courseId) {
  return course.scorecard.map((hole) => ({
    listing_id: listingId,
    course_id: courseId,
    hole_number: hole.hole,
    par: hole.par,
    stroke_index: hole.hcp ?? null,
    hcp: hole.hcp ?? null,
    distance_white: hole.white ?? null,
    distance_yellow: hole.yellow ?? null,
    distance_red: hole.red ?? null,
  }));
}

async function insertGolfHoleRows(supabase, course, rows) {
  const variants = [
    rows,
    rows.map(({ course_id: _courseId, ...row }) => row),
    rows.map(({ course_id: _courseId, hcp: _hcp, ...row }) => row),
  ];

  let lastError = null;
  for (const variant of variants) {
    const result = await supabase.from("golf_holes").insert(variant);
    if (!result.error) return;
    lastError = result.error;

    const message = result.error.message.toLowerCase();
    if (!message.includes("column") && !message.includes("schema cache")) {
      break;
    }
  }

  throw new Error(`insert holes ${course.slug}: ${lastError?.message ?? "unknown error"}`);
}

async function syncGolfDetails(supabase, course, listingId) {
  const existing = await supabase
    .from("golf_courses")
    .select("id")
    .eq("listing_id", listingId)
    .eq("is_default", true)
    .limit(1)
    .maybeSingle();
  assertNoError(existing, `select golf course ${course.slug}`);

  const payload = golfCoursePayload(course, listingId);
  let courseId = existing.data?.id;

  if (!courseId) {
    const inserted = await supabase.from("golf_courses").insert(payload).select("id").single();
    courseId = assertNoError(inserted, `insert golf course ${course.slug}`).id;
  } else {
    await assertNoError(
      await supabase.from("golf_courses").update(payload).eq("id", courseId),
      `update golf course ${course.slug}`
    );
  }

  await assertNoError(
    await supabase
      .from("golf_courses")
      .update({ is_default: false })
      .eq("listing_id", listingId)
      .neq("id", courseId)
      .eq("is_default", true),
    `clear non-default courses ${course.slug}`
  );

  await assertNoError(
    await supabase.from("golf_holes").delete().eq("listing_id", listingId),
    `delete holes ${course.slug}`
  );

  await insertGolfHoleRows(supabase, course, golfHoleRows(course, listingId, courseId));
}

async function syncCourse(supabase, course) {
  const refs = await upsertReferenceData(supabase, course);
  const existing = dryRun ? null : await findListing(supabase, course);

  if (dryRun) {
    console.log(`[dry-run] ${course.slug}: ${course.name}`);
    return;
  }

  let listingId = existing?.id;
  const payload = listingPayload(course, refs);

  if (!listingId) {
    const inserted = await supabase
      .from("listings")
      .insert({ ...payload, published_at: new Date().toISOString() })
      .select("id")
      .single();
    listingId = assertNoError(inserted, `insert listing ${course.slug}`).id;
  } else {
    await assertNoError(
      await supabase
        .from("listings")
        .update({ ...payload, published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", listingId),
      `update listing ${course.slug}`
    );
  }

  await syncSlugAliases(supabase, listingId, course);
  await syncGolfDetails(supabase, course, listingId);
  console.log(`Updated ${course.slug}`);
}

async function main() {
  loadEnvFile(path.join(root, ".env.local"));
  loadEnvFile(path.join(root, ".env"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const courses = migrationFiles.map(readCourse);
  for (const course of courses) {
    await syncCourse(supabase, course);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
