"use client";

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";

interface SanitizedHtmlProps {
  html: string | null | undefined;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
  preserveLineBreaks?: boolean;
}

function normalizeLinks(html: string) {
  return html.replace(
    /(<a\b[^>]*)\btarget=["']_blank["']([^>]*>)/gi,
    (_match, pre, post) => `${pre}target="_blank" rel="noopener noreferrer"${post}`,
  );
}

export function SanitizedHtml({
  html,
  className,
  allowedTags,
  allowedAttributes,
  preserveLineBreaks = false,
}: SanitizedHtmlProps) {
  const sanitizedHtml = useMemo(() => {
    const rawValue = String(html ?? "");
    if (!rawValue.trim()) {
      return "";
    }

    const candidate = preserveLineBreaks ? rawValue.replace(/\n/g, "<br/>") : rawValue;
    
    const sanitized = DOMPurify.sanitize(candidate, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      ALLOW_DATA_ATTR: false,
    });

    return normalizeLinks(String(sanitized));
  }, [allowedAttributes, allowedTags, html, preserveLineBreaks]);


  if (!sanitizedHtml) {
    return null;
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
