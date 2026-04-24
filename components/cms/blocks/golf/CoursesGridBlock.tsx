"use client";

import { AllListingsSection } from "@/components/sections/AllListingsSection";

interface CoursesGridBlockProps {
  settings: Record<string, unknown>;
}

export function CoursesGridBlock({ settings }: CoursesGridBlockProps) {
  const title = (settings.title as string) ?? "Golf Courses";
  const limit = (settings.limit as number) ?? 12;

  return <AllListingsSection key={`courses-${limit}`} />;
}