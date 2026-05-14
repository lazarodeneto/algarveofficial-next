import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const BLOG_CLIENT_SOURCE = readFileSync(
  join(process.cwd(), "components", "blog", "BlogClient.tsx"),
  "utf8",
);
const PAGE_BUILDER_REGISTRY_SOURCE = readFileSync(
  join(process.cwd(), "lib", "cms", "pageBuilderRegistry.ts"),
  "utf8",
);

describe("BlogClient page-builder blocks", () => {
  it("renders the optional featured post separately only when the builder block is enabled", () => {
    expect(BLOG_CLIENT_SOURCE).toContain('const showFeaturedPost = cms.isBlockEnabled("featured-post", false);');
    expect(BLOG_CLIENT_SOURCE).toContain('blockId="featured-post"');
    expect(BLOG_CLIENT_SOURCE).toContain("defaultEnabled={false}");
    expect(BLOG_CLIENT_SOURCE).toContain("const gridPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;");
    expect(BLOG_CLIENT_SOURCE).not.toContain("CardContent");
    expect(BLOG_CLIENT_SOURCE).toContain('const showPostsGrid = cms.isBlockEnabled("posts-grid", true);');
    expect(BLOG_CLIENT_SOURCE).toContain("const shouldRenderPostsGrid = showPostsGrid");
    expect(BLOG_CLIENT_SOURCE).toContain("{filteredPosts.length === 0 ? (");
    expect(BLOG_CLIENT_SOURCE).toContain("{gridPosts.map((post, index) => (");
  });

  it("keeps search and hero visibility controlled by separate page-builder blocks", () => {
    expect(BLOG_CLIENT_SOURCE).toContain('const showHero = cms.isBlockEnabled("hero", true);');
    expect(BLOG_CLIENT_SOURCE).toContain('const showSearch = cms.isBlockEnabled("search", true);');
    expect(BLOG_CLIENT_SOURCE).toContain('blockId="search"');
    expect(BLOG_CLIENT_SOURCE).toContain('blockId="hero"');
  });

  it("reserves stable card text space so shorter titles do not shrink card height", () => {
    expect(BLOG_CLIENT_SOURCE).toContain('className="group h-full"');
    expect(BLOG_CLIENT_SOURCE).toContain('className="block h-full"');
    expect(BLOG_CLIENT_SOURCE).toContain("line-clamp-2 min-h-[3.1rem]");
    expect(BLOG_CLIENT_SOURCE).toContain("line-clamp-2 min-h-[2.75rem]");
  });

  it("exposes the featured post block for the blog page builder", () => {
    const blogPageConfig = PAGE_BUILDER_REGISTRY_SOURCE.match(
      /id: "blog",[\s\S]*?path: "\/blog",[\s\S]*?blocks: \[([\s\S]*?)\],/,
    )?.[1];

    expect(blogPageConfig).toBeDefined();
    expect(blogPageConfig).toContain("featured-post");
    expect(blogPageConfig).toContain('id: "posts-grid"');
  });
});
