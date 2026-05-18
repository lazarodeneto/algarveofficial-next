import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "a",
  "b",
  "blockquote",
  "br",
  "caption",
  "code",
  "div",
  "em",
  "figcaption",
  "figure",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
] as const;

const sanitizerOptions: sanitizeHtml.IOptions = {
  allowedTags: [...ALLOWED_TAGS],
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "title", "class", "data-article-listing-link"],
    img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
    table: ["summary"],
    th: ["scope", "colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    "*": ["aria-label"],
  },
  allowedClasses: {
    a: ["ao-article-inline-link"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  allowedSchemesAppliedToAttributes: ["href", "src", "srcset"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  enforceHtmlBoundary: true,
  parseStyleAttributes: false,
  transformTags: {
    a: (tagName, attribs) => {
      const next = { ...attribs };
      if (next.target === "_blank") {
        const relValues = new Set(
          String(next.rel ?? "")
            .split(/\s+/)
            .map((value) => value.trim())
            .filter(Boolean),
        );
        relValues.add("noopener");
        relValues.add("noreferrer");
        next.rel = Array.from(relValues).join(" ");
      }
      return { tagName, attribs: next };
    },
    svg: "span",
  },
};

export function enforceNoopenerOnBlankTargets(html: string): string {
  return sanitizeHtml(html, {
    ...sanitizerOptions,
    allowedTags: [...ALLOWED_TAGS, "a"],
  });
}

export function sanitizeHtmlString(value: string | null | undefined): string {
  const raw = String(value ?? "");
  if (!raw.trim()) return "";

  return sanitizeHtml(raw, sanitizerOptions);
}
