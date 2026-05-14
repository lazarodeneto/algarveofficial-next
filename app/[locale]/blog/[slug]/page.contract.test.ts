import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

function source(path: string) {
  return readFileSync(join(REPO_ROOT, path), "utf8");
}

describe("localized blog post page route contract", () => {
  it("attaches article-related listing links only to eligible blog articles", () => {
    const page = source("app/[locale]/blog/[slug]/page.tsx");
    const component = source("legacy-pages/public/blog/BlogPost.tsx");
    const constants = source("lib/blog/best-beaches-guide.ts");

    expect(constants).toContain('export const BEST_BEACHES_ARTICLE_SLUG = "best-beaches-in-the-algarve"');
    expect(constants).toContain('export const WHERE_TO_STAY_ALGARVE_ARTICLE_SLUG = "where-to-stay-in-the-algarve-portugal"');
    expect(constants).toContain('export const BEST_THINGS_TO_DO_ALGARVE_ARTICLE_SLUG = "best-things-to-do-algarve-portugal"');
    expect(constants).toContain('export const GOLF_ALGARVE_ARTICLE_SLUG = "golf-in-the-algarve-best-courses-areas-where-to-stay"');
    expect(constants).toContain('export const FAMILY_ATTRACTIONS_ALGARVE_ARTICLE_SLUG = "family-attractions-algarve-kids-guide"');
    expect(constants).toContain('"best-beaches-algarve-portugal"');
    expect(constants).toContain("BEST_BEACHES_RELATED_LISTING_SLUGS");
    expect(constants).toContain("BEST_BEACHES_LINK_ALIASES");
    expect(constants).toContain("GOLF_RELATED_LISTING_SLUGS");
    expect(constants).toContain("GOLF_LINK_ALIASES");
    expect(constants).toContain("FAMILY_ATTRACTIONS_RELATED_LISTING_SLUGS");
    expect(constants).toContain("FAMILY_ATTRACTIONS_LINK_ALIASES");
    expect(constants).toContain("getBestBeachesMentionedListingSlugs");
    expect(constants).toContain("getGolfMentionedListingSlugs");
    expect(constants).toContain("getFamilyAttractionsMentionedListingSlugs");
    expect(constants).toContain("isBestBeachesArticleSlug");
    expect(constants).toContain("shouldLinkBeachListingsInArticle");
    expect(constants).toContain("shouldLinkGolfListingsInArticle");
    expect(constants).toContain("shouldLinkFamilyAttractionsInArticle");
    expect(page).toContain('export const dynamic = "force-dynamic"');
    expect(page).toContain("export const revalidate = 0");
    expect(page).toContain('categorySlug: "beaches"');
    expect(page).toContain('categorySlug: "golf"');
    expect(page).toContain('categorySlug: "family-attractions"');
    expect(page).toContain("getBestBeachesMentionedListingSlugs([");
    expect(page).toContain("getGolfMentionedListingSlugs([");
    expect(page).toContain("getFamilyAttractionsMentionedListingSlugs([");
    expect(page).toContain("limit: 1000");
    expect(page).toContain(".filter((listing) => matchedListingSlugs.has(listing.slug))");
    expect(page).toContain("getExplicitRelatedListings(resolvedLocale, post)");
    expect(page).toContain("getRelatedGuidePosts(resolvedLocale, post)");
    expect(page).toContain("getPublicBlogPosts({");
    expect(page).toContain("getPublicListings({");
    expect(page).toContain("ids,");
    expect(page).toContain("getBeachGuideListings(resolvedLocale, post)");
    expect(page).toContain("getGolfArticleListings(resolvedLocale, post)");
    expect(page).toContain("getFamilyArticleListings(resolvedLocale, post)");
    expect(page).toContain("beachListings={beachListings}");
    expect(page).toContain("golfListings={golfListings}");
    expect(page).toContain("familyListings={familyListings}");
    expect(page).toContain("relatedListings={relatedListings}");
    expect(page).toContain("relatedGuides={relatedGuides}");
    expect(page).toContain("shouldLinkBeachListingsInArticle(post.slug)");
    expect(page).toContain("shouldLinkGolfListingsInArticle(post.slug)");
    expect(page).toContain("shouldLinkFamilyAttractionsInArticle(post.slug)");
    expect(component).toContain("linkArticleListingMentions(articleHtml, beachListings, BEST_BEACHES_LINK_ALIASES, l)");
    expect(component).toContain("linkArticleListingMentions(articleWithListingLinks, familyListings, FAMILY_ATTRACTIONS_LINK_ALIASES, l)");
    expect(component).toContain("buildListingNameLinkAliases(combinedRelatedListings)");
    expect(component).toContain("linkArticleListingMentions(articleWithFamilyLinks, combinedRelatedListings, relatedListingNameAliases, l)");
    expect(component).toContain("isBestBeachesArticleSlug(post.slug)");
    expect(component).toContain("shouldLinkBeachListingsInArticle(post.slug)");
    expect(component).toContain("shouldLinkGolfListingsInArticle(post.slug)");
    expect(component).toContain("shouldLinkFamilyAttractionsInArticle(post.slug)");
    expect(component).toContain("<BeachGuideMap");
    expect(component).toContain("<ArticleRelatedGuides");
    expect(component).toContain("<ArticleRelatedListingCards");
  });
});
