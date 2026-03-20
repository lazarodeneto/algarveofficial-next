"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface SeoUpdateResult {
  success: boolean;
  error?: string;
}

export async function updateListingSeo(
  listingId: string,
  seoData: {
    meta_title?: string;
    meta_description?: string;
  }
): Promise<SeoUpdateResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("listings")
    .update({
      meta_title: seoData.meta_title || null,
      meta_description: seoData.meta_description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId);

  if (error) {
    console.error("[SEO Action] Failed to update listing SEO:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function updateBlogPostSeo(
  postId: string,
  seoData: {
    seo_title?: string;
    seo_description?: string;
  }
): Promise<SeoUpdateResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("blog_posts")
    .update({
      seo_title: seoData.seo_title || null,
      seo_description: seoData.seo_description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (error) {
    console.error("[SEO Action] Failed to update blog post SEO:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function updateEventSeo(
  eventId: string,
  seoData: {
    meta_title?: string;
    meta_description?: string;
  }
): Promise<SeoUpdateResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({
      meta_title: seoData.meta_title || null,
      meta_description: seoData.meta_description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) {
    console.error("[SEO Action] Failed to update event SEO:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function updateCategorySeo(
  categoryId: string,
  seoData: {
    meta_title?: string;
    meta_description?: string;
  }
): Promise<SeoUpdateResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({
      meta_title: seoData.meta_title || null,
      meta_description: seoData.meta_description || null,
    })
    .eq("id", categoryId);

  if (error) {
    console.error("[SEO Action] Failed to update category SEO:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function updateRegionSeo(
  regionId: string,
  seoData: {
    meta_title?: string;
    meta_description?: string;
  }
): Promise<SeoUpdateResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("regions")
    .update({
      meta_title: seoData.meta_title || null,
      meta_description: seoData.meta_description || null,
    })
    .eq("id", regionId);

  if (error) {
    console.error("[SEO Action] Failed to update region SEO:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function updateCitySeo(
  cityId: string,
  seoData: {
    meta_title?: string;
    meta_description?: string;
  }
): Promise<SeoUpdateResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("cities")
    .update({
      meta_title: seoData.meta_title || null,
      meta_description: seoData.meta_description || null,
    })
    .eq("id", cityId);

  if (error) {
    console.error("[SEO Action] Failed to update city SEO:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function updateSiteSeo(
  seoData: {
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
    canonical_url?: string;
  }
): Promise<SeoUpdateResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      meta_title: seoData.meta_title || null,
      meta_description: seoData.meta_description || null,
      og_image: seoData.og_image || null,
      canonical_url: seoData.canonical_url || null,
    })
    .eq("id", "default");

  if (error) {
    console.error("[SEO Action] Failed to update site SEO:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");

  return { success: true };
}
