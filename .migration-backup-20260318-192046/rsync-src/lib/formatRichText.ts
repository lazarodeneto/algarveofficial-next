const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*>/i;
const BOLD_MARKDOWN_REGEX = /(\*\*|__)(.+?)\1/g;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatInlineMarkdown = (value: string): string => {
  const escaped = escapeHtml(value);
  return escaped
    .replace(BOLD_MARKDOWN_REGEX, "<strong>$2</strong>")
    .replace(/\n/g, "<br />");
};

export const formatRichTextDescription = (value: string | null | undefined): string => {
  if (!value?.trim()) return "";

  const normalized = value
    .replace(/\r\n/g, "\n")
    // "//" forces a paragraph break (supports standalone or inline markers).
    // Keep URL patterns like https://example.com intact.
    .replace(/^\s*\/\/\s*$/gm, "\n\n")
    .replace(/(^|[^:])\/\/(?!\/)/g, "$1\n\n")
    .trim();

  // Keep legacy HTML content compatible; it will still be sanitized at render time.
  if (HTML_TAG_REGEX.test(normalized)) return normalized;

  const lines = normalized.split("\n");
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];

  for (const line of lines) {
    if (!line.trim()) {
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join("\n"));
        currentParagraph = [];
      }
      continue;
    }

    currentParagraph.push(line);
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join("\n"));
  }

  return paragraphs
    .map((paragraph) => `<p>${formatInlineMarkdown(paragraph.trim())}</p>`)
    .join("");
};
