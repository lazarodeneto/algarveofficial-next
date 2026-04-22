const HTML_COMMENT_REGEX = /<!--[\s\S]*?-->/g;
const BLOCK_TAG_WITH_CONTENT_REGEX =
  /<\s*(script|style|iframe|object|embed|noscript)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const BLOCK_TAG_STANDALONE_REGEX =
  /<\s*(script|style|iframe|object|embed|noscript|meta|link|base)[^>]*\/?\s*>/gi;
const EVENT_HANDLER_ATTR_REGEX = /\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URL_QUOTED_REGEX =
  /\s+(href|src|xlink:href)\s*=\s*("|\')\s*javascript:[^"']*\2/gi;
const JAVASCRIPT_URL_UNQUOTED_REGEX =
  /\s+(href|src|xlink:href)\s*=\s*javascript:[^\s>]+/gi;
const SRCDOC_ATTR_REGEX = /\s+srcdoc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const BLANK_TARGET_REGEX = /(<a\b[^>]*)\btarget=["']_blank["']([^>]*>)/gi;

export function enforceNoopenerOnBlankTargets(html: string): string {
  return html.replace(
    BLANK_TARGET_REGEX,
    (_match, pre, post) => `${pre}target="_blank" rel="noopener noreferrer"${post}`,
  );
}

export function sanitizeHtmlString(value: string | null | undefined): string {
  const raw = String(value ?? "");
  if (!raw.trim()) return "";

  const sanitized = raw
    .replace(HTML_COMMENT_REGEX, "")
    .replace(BLOCK_TAG_WITH_CONTENT_REGEX, "")
    .replace(BLOCK_TAG_STANDALONE_REGEX, "")
    .replace(EVENT_HANDLER_ATTR_REGEX, "")
    .replace(JAVASCRIPT_URL_QUOTED_REGEX, "")
    .replace(JAVASCRIPT_URL_UNQUOTED_REGEX, "")
    .replace(SRCDOC_ATTR_REGEX, "");

  return enforceNoopenerOnBlankTargets(sanitized);
}

