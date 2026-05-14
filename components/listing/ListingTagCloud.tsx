"use client";

import { Hash } from "lucide-react";

import { cn } from "@/lib/utils";

type ListingTagCloudProps = {
  title: string;
  tags: string[];
  className?: string;
  translateTag?: (tag: string) => string;
};

export function ListingTagCloud({ title, tags, className, translateTag }: ListingTagCloudProps) {
  if (tags.length === 0) return null;

  return (
    <section className={cn("ao-listing-tag-panel", className)} aria-label={title}>
      <div className="mb-4 flex items-center gap-3">
        <span className="ao-tag-section-icon" aria-hidden="true">
          <Hash className="h-4 w-4" />
        </span>
        <h2 className="font-serif text-xl font-medium text-foreground">{title}</h2>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className="ao-glass-tag-chip ao-listing-tag-chip">
            <span className="ao-listing-tag-mark" aria-hidden="true">
              #
            </span>
            <span className="truncate">{translateTag ? translateTag(tag) : tag}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
