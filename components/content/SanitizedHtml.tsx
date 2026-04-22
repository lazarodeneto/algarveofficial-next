"use client";

import { useMemo } from "react";
import { sanitizeHtmlString } from "@/lib/sanitizeHtml";

interface SanitizedHtmlProps {
  html: string | null | undefined;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
  preserveLineBreaks?: boolean;
}

export function SanitizedHtml({
  html,
  className,
  allowedTags: _allowedTags,
  allowedAttributes: _allowedAttributes,
  preserveLineBreaks = false,
}: SanitizedHtmlProps) {
  const sanitizedHtml = useMemo(() => {
    const rawValue = String(html ?? "");
    if (!rawValue.trim()) {
      return "";
    }

    const candidate = preserveLineBreaks ? rawValue.replace(/\n/g, "<br/>") : rawValue;
    const sanitized = sanitizeHtmlString(candidate);

    return sanitized;
  }, [html, preserveLineBreaks]);


  if (!sanitizedHtml) {
    return null;
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
