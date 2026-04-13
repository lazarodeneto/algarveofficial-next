import type { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getStatusCounts, getTranslationJobsGrouped, getFilterOptions } from "@/lib/admin/translations/queries";
import { TranslationsDashboard } from "@/components/admin/translations/TranslationsDashboard";
import type { TranslationFilters, TranslationStatus } from "@/lib/admin/translations/types";

export const metadata: Metadata = {
  title: "Translation Management | Admin",
  robots: { index: false, follow: false },
};

// Revalidate at most every 30s — real-time handles live updates
export const revalidate = 30;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseFilters(sp: Record<string, string | string[] | undefined>): TranslationFilters {
  const str = (key: string) => {
    const v = sp[key];
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
  };

  return {
    status: (str("status") as TranslationStatus) || undefined,
    city: str("city"),
    category: str("category"),
    tier: (str("tier") as "signature" | "verified") || undefined,
    target_lang: str("target_lang"),
    page: sp["page"] ? Number(sp["page"]) : 1,
  };
}

export default async function TranslationsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const supabase = createServiceRoleClient();

  if (!supabase) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-destructive">
        Server configuration error: missing service role key.
      </div>
    );
  }

  const [counts, { groups, total }, filterOptions] = await Promise.all([
    getStatusCounts(supabase),
    getTranslationJobsGrouped(supabase, filters),
    getFilterOptions(supabase),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <TranslationsDashboard
        initialCounts={counts}
        initialGroups={groups}
        initialTotal={total}
        filters={filters}
        filterOptions={filterOptions}
      />
    </div>
  );
}
