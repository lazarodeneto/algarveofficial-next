import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ARTICLE_SEEDS = [
  {
    file: "20260514200000_add_best_beaches_algarve_portugal_blog_post.sql",
    slug: "best-beaches-algarve-portugal",
  },
  {
    file: "20260514204000_add_where_to_stay_algarve_blog_post.sql",
    slug: "where-to-stay-in-the-algarve-portugal",
  },
  {
    file: "20260514213000_add_best_things_to_do_algarve_blog_post.sql",
    slug: "best-things-to-do-algarve-portugal",
  },
  {
    file: "20260514220000_add_golf_algarve_blog_post.sql",
    slug: "golf-in-the-algarve-best-courses-areas-where-to-stay",
  },
  {
    file: "20260514233000_add_family_attractions_algarve_blog_post.sql",
    slug: "family-attractions-algarve-kids-guide",
  },
] as const;

describe("blog article seed migrations", () => {
  it("publishes the new article seeds immediately for the blog index", () => {
    for (const seed of ARTICLE_SEEDS) {
      const source = readFileSync(join(process.cwd(), "supabase", "migrations", seed.file), "utf8");
      const publishedAt = source.match(/'([^']+)'::timestamptz AS published_at/)?.[1];

      expect(source).toContain(`'${seed.slug}'::text AS slug`);
      expect(source).toContain("'published'::public.blog_status");
      expect(publishedAt).toBeDefined();
      expect(Date.parse(publishedAt ?? "")).toBeLessThanOrEqual(Date.parse("2026-05-14T08:00:00Z"));
    }
  });

  it("adds family attraction listing records and relates them to the family guide", () => {
    const source = readFileSync(
      join(process.cwd(), "supabase", "migrations", "20260514235000_add_family_attraction_related_listings.sql"),
      "utf8",
    );

    expect(source).toContain("'family-attractions', 'family-fun'");
    expect(source).toContain("'slide-splash-lagoa'");
    expect(source).toContain("'aquashow-park-quarteira'");
    expect(source).toContain("'aqualand-algarve-alcantarilha'");
    expect(source).toContain("'lagos-zoo'");
    expect(source).toContain("'krazy-world-algoz'");
    expect(source).toContain("'sandcity-lagoa'");
    expect(source).toContain("'parque-aventura-albufeira'");
    expect(source).toContain("'karting-almancil'");
    expect(source).toContain("'centro-ciencia-viva-algarve-faro'");
    expect(source).toContain("'centro-ciencia-viva-lagos'");
    expect(source).toContain("update public.blog_posts bp");
    expect(source).toContain("where bp.slug = 'family-attractions-algarve-kids-guide'");
  });
});
