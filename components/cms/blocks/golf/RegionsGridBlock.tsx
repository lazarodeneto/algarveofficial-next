"use client";

import { RegionsSection } from "@/components/sections/RegionsSection";

interface RegionsGridBlockProps {
  settings: Record<string, unknown>;
}

export function RegionsGridBlock({ settings }: RegionsGridBlockProps) {
  return <RegionsSection />;
}