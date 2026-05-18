import { describe, expect, it } from "vitest";

import { sanitizeHtmlString } from "@/lib/sanitizeHtml";

describe("sanitizeHtmlString", () => {
  it("keeps legitimate editorial formatting and listing links", () => {
    const sanitized = sanitizeHtmlString(
      '<h2>Guide</h2><p>Visit <a href="/listing/quinta" class="ao-article-inline-link" data-article-listing-link="true">Quinta</a>.</p><ul><li><strong>Book ahead</strong></li></ul>',
    );

    expect(sanitized).toContain("<h2>Guide</h2>");
    expect(sanitized).toContain("<strong>Book ahead</strong>");
    expect(sanitized).toContain('class="ao-article-inline-link"');
    expect(sanitized).toContain('data-article-listing-link="true"');
    expect(sanitized).toContain('href="/listing/quinta"');
  });

  it("removes script tags and event handler attributes", () => {
    const sanitized = sanitizeHtmlString(
      '<p onclick="alert(1)">Hello</p><script>alert(2)</script><img src="https://example.com/a.jpg" onerror="alert(3)">',
    );

    expect(sanitized).toContain("<p>Hello</p>");
    expect(sanitized).toContain('<img src="https://example.com/a.jpg" />');
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("onerror");
    expect(sanitized).not.toContain("<script");
    expect(sanitized).not.toContain("alert");
  });

  it("removes javascript URLs including encoded variants", () => {
    const sanitized = sanitizeHtmlString(
      '<a href="javascript:alert(1)">bad</a><a href="&#x6a;avascript:alert(2)">encoded</a><a href="https://example.com">good</a>',
    );

    expect(sanitized).toContain("<a>bad</a>");
    expect(sanitized).toContain("<a>encoded</a>");
    expect(sanitized).toContain('<a href="https://example.com">good</a>');
    expect(sanitized).not.toContain("javascript:");
  });

  it("blocks SVG, iframe, object, and embed payloads", () => {
    const sanitized = sanitizeHtmlString(
      '<svg><script>alert(1)</script></svg><iframe src="https://example.com"></iframe><object data="https://example.com"></object><embed src="https://example.com">',
    );

    expect(sanitized).not.toContain("<svg");
    expect(sanitized).not.toContain("<iframe");
    expect(sanitized).not.toContain("<object");
    expect(sanitized).not.toContain("<embed");
    expect(sanitized).not.toContain("alert");
  });

  it("adds noopener noreferrer to blank targets", () => {
    const sanitized = sanitizeHtmlString('<a href="https://example.com" target="_blank">external</a>');

    expect(sanitized).toContain('target="_blank"');
    expect(sanitized).toContain('rel="noopener noreferrer"');
  });
});
