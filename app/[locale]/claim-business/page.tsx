import type { Metadata } from "next";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, Building2, CheckCircle2, Clock3, MapPin, Search } from "lucide-react";

import ListingImage from "@/components/ListingImage";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getBusinessClaimCtaState } from "@/components/listing/BusinessClaimCTA";
import type { Tables } from "@/integrations/supabase/types";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;
const MIN_SEARCH_LENGTH = 2;

const CLAIM_SEARCH_FIELDS = `
  id,
  slug,
  name,
  short_description,
  featured_image_url,
  address,
  website_url,
  status,
  claim_status,
  city_id,
  category_id,
  updated_at,
  city:cities(id, name, slug),
  category:categories(id, name, slug, image_url)
`;

type ClaimSearchListing = Pick<
  Tables<"listings">,
  | "id"
  | "slug"
  | "name"
  | "short_description"
  | "featured_image_url"
  | "address"
  | "website_url"
  | "status"
  | "claim_status"
  | "city_id"
  | "category_id"
  | "updated_at"
> & {
  city?: Pick<Tables<"cities">, "id" | "name" | "slug"> | null;
  category?: Pick<Tables<"categories">, "id" | "name" | "slug" | "image_url"> | null;
};

interface ClaimBusinessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getSearchParamValue(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function sanitizeSearchTerm(raw: string): string {
  return raw
    .replace(/[,%(){}'"]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function parsePage(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function pageQuery(locale: Locale, query: string, page?: number) {
  const nextQuery: Record<string, string | number> = {};
  if (query) nextQuery.q = query;
  if (page && page > 1) nextQuery.page = page;
  return buildLocalizedPath(locale, "/claim-business", { query: nextQuery });
}

async function resolveMatchingEntityIds(query: string) {
  const supabase = createPublicServerClient();
  const [cityResult, categoryResult] = await Promise.all([
    supabase
      .from("cities")
      .select("id")
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%`),
    supabase
      .from("categories")
      .select("id")
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%,short_description.ilike.%${query}%`),
  ]);

  if (cityResult.error) throw cityResult.error;
  if (categoryResult.error) throw categoryResult.error;

  return {
    cityIds: (cityResult.data ?? []).map((row) => row.id).filter(Boolean),
    categoryIds: (categoryResult.data ?? []).map((row) => row.id).filter(Boolean),
  };
}

async function searchClaimListings(query: string, page: number) {
  if (query.length < MIN_SEARCH_LENGTH) {
    return {
      listings: [] as ClaimSearchListing[],
      total: 0,
      error: null as string | null,
    };
  }

  try {
    const supabase = createPublicServerClient();
    const { cityIds, categoryIds } = await resolveMatchingEntityIds(query);
    const clauses = [
      `name.ilike.%${query}%`,
      `address.ilike.%${query}%`,
      `website_url.ilike.%${query}%`,
      `short_description.ilike.%${query}%`,
    ];

    if (cityIds.length > 0) clauses.push(`city_id.in.(${cityIds.join(",")})`);
    if (categoryIds.length > 0) clauses.push(`category_id.in.(${categoryIds.join(",")})`);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from("listings")
      .select(CLAIM_SEARCH_FIELDS, { count: "exact" })
      .eq("status", "published")
      .or(clauses.join(","))
      .order("name", { ascending: true })
      .range(from, to);

    if (error) throw error;

    return {
      listings: ((data ?? []) as unknown as ClaimSearchListing[]) ?? [],
      total: count ?? 0,
      error: null as string | null,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        feature: "business-claim-search",
      },
    });
    return {
      listings: [] as ClaimSearchListing[],
      total: 0,
      error: "search_failed",
    };
  }
}

function claimStatusLabel(
  state: ReturnType<typeof getBusinessClaimCtaState>,
  tx: Record<string, string>,
) {
  if (state === "claimed") return tx["claimBusinessSearch.status.claimed"];
  if (state === "pending") return tx["claimBusinessSearch.status.pending"];
  return tx["claimBusinessSearch.status.unclaimed"];
}

function ClaimStatusBadge({
  listing,
  tx,
}: {
  listing: ClaimSearchListing;
  tx: Record<string, string>;
}) {
  const state = getBusinessClaimCtaState(listing.claim_status);
  const Icon = state === "claimed" ? CheckCircle2 : state === "pending" ? Clock3 : Building2;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 border-[#D4A62A]/35 bg-[#D4A62A]/10 text-[#9C7417]",
        state === "pending" && "border-amber-500/35 bg-amber-500/10 text-amber-700",
        state === "claimed" && "border-emerald-500/35 bg-emerald-500/10 text-emerald-700",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {claimStatusLabel(state, tx)}
    </Badge>
  );
}

function ClaimListingCard({
  listing,
  locale,
  tx,
}: {
  listing: ClaimSearchListing;
  locale: Locale;
  tx: Record<string, string>;
}) {
  const state = getBusinessClaimCtaState(listing.claim_status);
  const claimHref = buildLocalizedPath(locale, `/claim-business/${listing.slug || listing.id}`);
  const locationLine = [listing.city?.name, listing.category?.name].filter(Boolean).join(" · ");
  const disabled = state !== "unclaimed";

  return (
    <Card className="overflow-hidden rounded-xl border-border/70 bg-card/90 shadow-sm transition-colors hover:border-[#D4A62A]/45">
      <CardContent className="grid gap-0 p-0 sm:grid-cols-[180px_1fr]">
        <div className="relative min-h-44 bg-muted sm:min-h-full">
          <ListingImage
            src={listing.featured_image_url}
            categoryImageUrl={listing.category?.image_url}
            alt={listing.name}
            imageVersion={listing.updated_at}
            fill
            sizes="(max-width: 640px) 100vw, 180px"
            className="h-full w-full"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-4 p-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {listing.category?.name ? <Badge variant="secondary">{listing.category.name}</Badge> : null}
              <ClaimStatusBadge listing={listing} tx={tx} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold leading-tight text-foreground">
                {listing.name}
              </h2>
              {locationLine ? (
                <p className="mt-2 text-sm font-medium text-muted-foreground">{locationLine}</p>
              ) : null}
              {listing.address ? (
                <p className="mt-2 flex gap-2 text-sm leading-6 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C6961C]" aria-hidden="true" />
                  <span>{listing.address}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild variant="secondary" size="sm">
              <Link href={buildLocalizedPath(locale, `/listing/${listing.slug || listing.id}`)}>
                {tx["claimBusinessSearch.viewListing"]}
              </Link>
            </Button>
            {disabled ? (
              <Button size="sm" disabled className="sm:min-w-52">
                {state === "claimed"
                  ? tx["claimBusinessSearch.managedButton"]
                  : tx["claimBusinessSearch.pendingButton"]}
              </Button>
            ) : (
              <Button asChild size="sm" className="sm:min-w-52">
                <Link href={claimHref}>{tx["claimBusinessSearch.claimButton"]}</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export async function generateMetadata({
  params,
}: ClaimBusinessPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const tx = await getServerTranslations(locale, [
    "claimBusinessSearch.title",
    "claimBusinessSearch.description",
  ]);

  return buildLocalizedMetadata({
    locale,
    path: "/claim-business",
    title: tx["claimBusinessSearch.title"] ?? "Find and claim your business on AlgarveOfficial",
    description:
      tx["claimBusinessSearch.description"] ??
      "Search for your existing listing, select your business, and submit a claim request linked to that listing.",
  });
}

export default async function ClaimBusinessPage({
  params,
  searchParams,
}: ClaimBusinessPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const sp = await searchParams;
  const query = sanitizeSearchTerm(getSearchParamValue(sp, "q"));
  const page = parsePage(getSearchParamValue(sp, "page"));
  const [{ listings, total, error }, tx] = await Promise.all([
    searchClaimListings(query, page),
    getServerTranslations(locale, [
      "claimBusinessSearch.title",
      "claimBusinessSearch.description",
      "claimBusinessSearch.placeholder",
      "claimBusinessSearch.searchButton",
      "claimBusinessSearch.resultsSummary",
      "claimBusinessSearch.resultsSummaryWithCount",
      "claimBusinessSearch.emptyTitle",
      "claimBusinessSearch.emptyDescription",
      "claimBusinessSearch.searchErrorTitle",
      "claimBusinessSearch.searchErrorDescription",
      "claimBusinessSearch.startTitle",
      "claimBusinessSearch.startDescription",
      "claimBusinessSearch.viewListing",
      "claimBusinessSearch.claimButton",
      "claimBusinessSearch.pendingButton",
      "claimBusinessSearch.managedButton",
      "claimBusinessSearch.status.unclaimed",
      "claimBusinessSearch.status.pending",
      "claimBusinessSearch.status.claimed",
      "claimBusinessSearch.cantFindTitle",
      "claimBusinessSearch.cantFindDescription",
      "claimBusinessSearch.newListingButton",
      "claimBusinessSearch.previous",
      "claimBusinessSearch.next",
      "claimBusinessSearch.page",
    ]),
  ]);
  const hasSearchError = Boolean(error);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasQuery = query.length >= MIN_SEARCH_LENGTH;
  const requestNewListingHref = buildLocalizedPath(locale, "/partner", {
    query: { type: "new-listing" },
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="app-container pt-28 pb-20 lg:pt-32">
        <section className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C6961C]">
            AlgarveOfficial
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight text-foreground md:text-5xl">
            {tx["claimBusinessSearch.title"]}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
            {tx["claimBusinessSearch.description"]}
          </p>

          <form
            action={buildLocalizedPath(locale, "/claim-business")}
            className="mt-8 flex flex-col gap-3 md:flex-row"
          >
            <label className="relative flex-1">
              <span className="sr-only">{tx["claimBusinessSearch.placeholder"]}</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder={tx["claimBusinessSearch.placeholder"]}
                className="h-[3.25rem] rounded-full pl-12 text-base"
                autoComplete="off"
              />
            </label>
            <Button type="submit" className="h-[3.25rem] px-8">
              {tx["claimBusinessSearch.searchButton"]}
            </Button>
          </form>
        </section>

        <section className="mt-10 space-y-5">
          {hasQuery ? (
            <div className="flex flex-col gap-2 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-serif text-2xl text-foreground">
                  {total > 0
                    ? tx["claimBusinessSearch.resultsSummaryWithCount"].replace("{{count}}", String(total))
                    : tx["claimBusinessSearch.resultsSummary"]}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {query}
                </p>
              </div>
              {totalPages > 1 ? (
                <p className="text-sm text-muted-foreground">
                  {tx["claimBusinessSearch.page"]
                    .replace("{{page}}", String(page))
                    .replace("{{totalPages}}", String(totalPages))}
                </p>
              ) : null}
            </div>
          ) : null}

          {!hasQuery ? (
            <Card className="rounded-xl border-dashed border-border/70 bg-card/70">
              <CardContent className="p-8 text-center">
                <Search className="mx-auto h-10 w-10 text-[#C6961C]" aria-hidden="true" />
                <h2 className="mt-4 font-serif text-2xl text-foreground">
                  {tx["claimBusinessSearch.startTitle"]}
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {tx["claimBusinessSearch.startDescription"]}
                </p>
              </CardContent>
            </Card>
          ) : hasSearchError ? (
            <Card className="rounded-xl border-dashed border-amber-500/40 bg-amber-500/5">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-amber-600" aria-hidden="true" />
                <h2 className="mt-4 font-serif text-2xl text-foreground">
                  {tx["claimBusinessSearch.searchErrorTitle"]}
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {tx["claimBusinessSearch.searchErrorDescription"]}
                </p>
              </CardContent>
            </Card>
          ) : listings.length === 0 ? (
            <Card className="rounded-xl border-dashed border-border/70 bg-card/70">
              <CardContent className="p-8 text-center">
                <Building2 className="mx-auto h-10 w-10 text-[#C6961C]" aria-hidden="true" />
                <h2 className="mt-4 font-serif text-2xl text-foreground">
                  {tx["claimBusinessSearch.emptyTitle"]}
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {tx["claimBusinessSearch.emptyDescription"]}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5">
              {listings.map((listing) => (
                <ClaimListingCard
                  key={listing.id}
                  listing={listing}
                  locale={locale}
                  tx={tx}
                />
              ))}
            </div>
          )}

          {hasQuery && totalPages > 1 ? (
            <nav
              className="flex items-center justify-between pt-2"
              aria-label={tx["claimBusinessSearch.resultsSummary"]}
            >
              {page > 1 ? (
                <Button asChild variant="secondary">
                  <Link href={pageQuery(locale, query, page - 1)}>
                    {tx["claimBusinessSearch.previous"]}
                  </Link>
                </Button>
              ) : (
                <span />
              )}
              {page < totalPages ? (
                <Button asChild variant="secondary">
                  <Link href={pageQuery(locale, query, page + 1)}>
                    {tx["claimBusinessSearch.next"]}
                  </Link>
                </Button>
              ) : null}
            </nav>
          ) : null}
        </section>

        <section className="mt-12 rounded-2xl border border-[#D4A62A]/25 bg-gradient-to-br from-[#D4A62A]/10 via-card to-card p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-3xl text-foreground">
                {tx["claimBusinessSearch.cantFindTitle"]}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {tx["claimBusinessSearch.cantFindDescription"]}
              </p>
            </div>
            <Button asChild variant="secondary" className="shrink-0">
              <Link href={requestNewListingHref}>
                {tx["claimBusinessSearch.newListingButton"]}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
