import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

function source(path: string) {
  return readFileSync(join(REPO_ROOT, path), "utf8");
}

describe("public blog article UX", () => {
  it("uses the shared readable article body and removes duplicate title headings", () => {
    const component = source("legacy-pages/public/blog/BlogPost.tsx");

    expect(component).toContain("stripDuplicateArticleTitleHeading(");
    expect(component).toContain("ao-blog-article-prose");
  });

  it("renders scoped related family attraction cards for family guides", () => {
    const component = source("legacy-pages/public/blog/BlogPost.tsx");

    expect(component).toContain("shouldLinkFamilyAttractionsInArticle(post.slug)");
    expect(component).toContain("<ArticleRelatedListingCards");
    expect(component).toContain("Family attractions mentioned in this article");
  });

  it("renders related guides, article tags, and combined related listing cards near the article end", () => {
    const component = source("legacy-pages/public/blog/BlogPost.tsx");
    const relatedComponents = source("components/blog/BeachGuideListings.tsx");

    expect(component).toContain("<ArticleRelatedGuides");
    expect(component).toContain("guides={relatedGuides}");
    expect(component).toContain("tags={post.tags ?? []}");
    expect(component).toContain("combinedRelatedListings");
    expect(component).toContain('anchorId="article-related-listing-cards"');
    expect(relatedComponents).toContain("Related guides");
    expect(relatedComponents).toContain("Related tags");
    expect(relatedComponents).toContain("Read next");
    expect(relatedComponents).toContain('href={l(`/blog?tag=${encodeURIComponent(tag)}`)}');
  });

  it("keeps Lucide article summary icons in the shared blog header", () => {
    const component = source("legacy-pages/public/blog/BlogPost.tsx");

    expect(component).toContain("BookOpenText");
    expect(component).toContain("Compass");
    expect(component).toContain("Sparkles");
  });

  it("does not render a visible published date in article metadata", () => {
    const component = source("legacy-pages/public/blog/BlogPost.tsx");
    const legacyBlogIndex = source("legacy-pages/public/blog/Blog.tsx");

    expect(component).not.toContain("Calendar");
    expect(component).not.toContain("formatPublishedDate");
    expect(component).not.toContain("post.published_at || post.created_at");
    expect(legacyBlogIndex).not.toContain("format(new Date(post.published_at || post.created_at)");
  });

  it("keeps scoped article typography for headings, paragraph spacing, facts, and tables", () => {
    const styles = source("index.css");

    expect(styles).toContain(".ao-blog-article-prose h2");
    expect(styles).toContain("font-size: 2.65rem;");
    expect(styles).toContain(".ao-blog-article-prose p + p");
    expect(styles).toContain(".ao-blog-article-prose p:has(> strong:first-child)");
    expect(styles).toContain(".ao-blog-article-prose table");
  });
});
