import { buildListingHref } from "@/lib/public-route-builders";

export type ArticleListingLinkAlias = {
  slug: string;
  phrases: string[];
};

export type ArticleListingLinkTarget = {
  slug: string;
};

type ArticleListingLinkDefinition = ArticleListingLinkAlias & {
  href: string;
};

type ArticleListingTextMatch = {
  definition: ArticleListingLinkDefinition;
  start: number;
  end: number;
  phrase: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findNextTextMatch(
  value: string,
  linkDefinitions: ArticleListingLinkDefinition[],
): ArticleListingTextMatch | null {
  let nextMatch: ArticleListingTextMatch | null = null;

  for (const definition of linkDefinitions) {
    const phrases = [...definition.phrases].sort((left, right) => right.length - left.length);

    for (const phrase of phrases) {
      const pattern = new RegExp(
        `(^|[^\\p{L}\\p{N}])(${escapeRegExp(phrase)})(?=$|[^\\p{L}\\p{N}])`,
        "u",
      );
      const match = pattern.exec(value);
      if (!match || typeof match.index !== "number") continue;

      const start = match.index + (match[1]?.length ?? 0);
      const end = start + match[2].length;
      const candidate = {
        definition,
        start,
        end,
        phrase: match[2],
      };

      if (
        !nextMatch ||
        candidate.start < nextMatch.start ||
        (candidate.start === nextMatch.start && candidate.phrase.length > nextMatch.phrase.length)
      ) {
        nextMatch = candidate;
      }
    }
  }

  return nextMatch;
}

function linkTextToken(value: string, linkDefinitions: ArticleListingLinkDefinition[]) {
  let remaining = value;
  let linked = "";

  while (remaining) {
    const match = findNextTextMatch(remaining, linkDefinitions);
    if (!match) {
      linked += remaining;
      break;
    }

    linked += remaining.slice(0, match.start);
    linked += `<a href="${match.definition.href}" class="ao-article-inline-link" data-article-listing-link="true">${match.phrase}</a>`;
    remaining = remaining.slice(match.end);
  }

  return linked;
}

export function linkArticleListingMentions(
  html: string,
  listings: ArticleListingLinkTarget[],
  linkAliases: ArticleListingLinkAlias[],
  localizePath: (path: string) => string,
) {
  if (listings.length === 0) return html;

  const listingSlugs = new Set(listings.map((listing) => listing.slug));
  const linkDefinitions = linkAliases
    .filter((definition) => listingSlugs.has(definition.slug))
    .map((definition) => ({
      ...definition,
      href: localizePath(buildListingHref({ slug: definition.slug })),
    }));

  if (linkDefinitions.length === 0) return html;

  let anchorDepth = 0;

  return html
    .split(/(<\/?a\b[^>]*>|<[^>]+>)/gi)
    .map((token) => {
      if (!token) return token;
      if (token.startsWith("<")) {
        if (/^<a\b/i.test(token)) anchorDepth += 1;
        if (/^<\/a/i.test(token)) anchorDepth = Math.max(anchorDepth - 1, 0);
        return token;
      }

      return anchorDepth > 0 ? token : linkTextToken(token, linkDefinitions);
    })
    .join("");
}
