import { describe, expect, it } from "vitest";

import { linkArticleListingMentions } from "@/lib/blog/article-listing-links";
import { BEST_BEACHES_LINK_ALIASES, FAMILY_ATTRACTIONS_LINK_ALIASES } from "@/lib/blog/best-beaches-guide";

describe("linkArticleListingMentions", () => {
  it("links repeated beach names in article text and nested formatting", () => {
    const html = [
      "<p>Praia da Falésia is one of the Algarve's longest beaches.</p>",
      "<h2>Best Beaches for Families</h2>",
      "<p><strong>Praia da Falésia</strong> — long sandy shoreline.</p>",
      "<p><strong>Meia Praia</strong> — broad, practical, and easy.</p>",
    ].join("");

    const linked = linkArticleListingMentions(
      html,
      [
        { slug: "praia-da-falesia-albufeira" },
        { slug: "meia-praia-lagos" },
      ],
      BEST_BEACHES_LINK_ALIASES,
      (path) => path,
    );

    expect(linked.match(/href="\/listing\/praia-da-falesia-albufeira"/g)).toHaveLength(2);
    expect(linked).toContain(
      '<strong><a href="/listing/praia-da-falesia-albufeira" class="ao-article-inline-link" data-article-listing-link="true">Praia da Falésia</a></strong>',
    );
    expect(linked).toContain(
      '<strong><a href="/listing/meia-praia-lagos" class="ao-article-inline-link" data-article-listing-link="true">Meia Praia</a></strong>',
    );
  });

  it("does not add nested links inside existing anchors", () => {
    const html = '<p><a href="/custom">Praia da Falésia</a> and Praia da Falésia.</p>';

    const linked = linkArticleListingMentions(
      html,
      [{ slug: "praia-da-falesia-albufeira" }],
      BEST_BEACHES_LINK_ALIASES,
      (path) => path,
    );

    expect(linked).toContain('<a href="/custom">Praia da Falésia</a>');
    expect(linked.match(/href="\/listing\/praia-da-falesia-albufeira"/g)).toHaveLength(1);
  });

  it("links family attraction names to published attraction listings", () => {
    const linked = linkArticleListingMentions(
      "<p>Zoomarine is one of the Algarve's safest organised family days.</p>",
      [{ slug: "zoomarine-algarve" }],
      FAMILY_ATTRACTIONS_LINK_ALIASES,
      (path) => path,
    );

    expect(linked).toContain(
      '<a href="/listing/zoomarine-algarve" class="ao-article-inline-link" data-article-listing-link="true">Zoomarine</a>',
    );
  });
});
