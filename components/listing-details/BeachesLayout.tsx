"use client";

import { type ReactNode, useId, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Check, Compass, ExternalLink, Hash, Info, MapPin, MapPinned, Sparkles, Star, Waves, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import ListingImage from "@/components/ListingImage";
import { useLocalePath } from "@/hooks/useLocalePath";
import { cn } from "@/lib/utils";
import { buildStaticRouteData, buildUniformLocalizedSlugMap } from "@/lib/i18n/localized-routing";
import { buildCategoryRouteData } from "@/lib/public-route-builders";

type SeoLink = {
  label: string;
  href?: string;
};

type SeoLinkGroup = {
  title: string;
  links: SeoLink[];
};

const seoGroupIcons = [Hash, MapPinned, Sparkles, Waves, Compass];

const ListingMap = dynamic(() => import("@/components/ui/listing-map").then((mod) => mod.ListingMap), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[280px] w-full animate-pulse rounded-xl bg-muted" aria-hidden="true" />
  ),
});

type Testimonial = {
  name: string;
  country?: string;
  date?: string;
  rating: number;
  text: string;
  avatarInitial?: string;
  verified?: boolean;
};

type NearbyListing = {
  id: string;
  slug: string | null;
  name: string;
  featured_image_url?: string | null;
  updated_at?: string | null;
  city?: {
    name: string | null;
  } | null;
};

interface BeachesLayoutProps {
  details: Record<string, unknown>;
  fallbackDescription?: string;
  listingName?: string;
  cityName?: string | null;
  tags?: string[] | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  nearbyListings?: NearbyListing[];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function parseJsonValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || !["[", "{"].includes(trimmed[0])) return value;

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function stringFrom(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function numberFrom(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function listFrom(value: unknown): string[] {
  const parsed = parseJsonValue(value);
  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => stringFrom(item))
      .filter((item): item is string => Boolean(item));
  }

  const text = stringFrom(parsed);
  if (!text) return [];

  return text
    .split(/\r?\n|,/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function firstList(details: Record<string, unknown>, keys: string[]): string[] {
  for (const key of keys) {
    const value = listFrom(details[key]);
    if (value.length > 0) return value;
  }
  return [];
}

function firstString(details: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = stringFrom(details[key]);
    if (value) return value;
  }
  return undefined;
}

function readTestimonials(value: unknown): Testimonial[] {
  const parsed = parseJsonValue(value);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item): Testimonial | null => {
      const row = asRecord(item);
      const name = stringFrom(row.name ?? row.author ?? row.traveler);
      const text = stringFrom(row.text ?? row.comment ?? row.review);
      if (!name || !text) return null;

      const ratingValue = Number(row.rating ?? 5);
      const rating = Number.isFinite(ratingValue) ? Math.min(5, Math.max(1, Math.round(ratingValue))) : 5;

      const testimonial: Testimonial = {
        name,
        rating,
        text,
        avatarInitial: stringFrom(row.avatarInitial ?? row.avatar_initial) ?? name[0]?.toUpperCase(),
        verified: row.verified === undefined ? true : Boolean(row.verified),
      };
      const country = stringFrom(row.country);
      const date = stringFrom(row.date);
      if (country) testimonial.country = country;
      if (date) testimonial.date = date;
      return testimonial;
    })
    .filter((item): item is Testimonial => item !== null);
}

function readSeoGroups(value: unknown): SeoLinkGroup[] {
  const parsed = parseJsonValue(value);

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => {
        const group = asRecord(item);
        const title = stringFrom(group.title);
        const links = Array.isArray(group.links)
          ? group.links
              .map((link) => {
                if (typeof link === "string") return { label: link };
                const linkRecord = asRecord(link);
                const label = stringFrom(linkRecord.label ?? linkRecord.title ?? linkRecord.name);
                return label ? { label, href: stringFrom(linkRecord.href ?? linkRecord.url) } : null;
              })
              .filter((link): link is SeoLink => Boolean(link))
          : [];
        return title && links.length > 0 ? { title, links } : null;
      })
      .filter((group): group is SeoLinkGroup => Boolean(group));
  }

  const record = asRecord(parsed);
  return Object.entries(record)
    .map(([title, links]) => {
      const normalizedLinks = listFrom(links).map((label) => ({ label }));
      return normalizedLinks.length > 0 ? { title, links: normalizedLinks } : null;
    })
    .filter((group): group is SeoLinkGroup => Boolean(group));
}

function DetailRow({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid gap-4 border-t border-border/70 py-6 md:grid-cols-[10rem_1fr] lg:grid-cols-[12rem_1fr]", className)}>
      <h2 className="text-base font-bold text-foreground md:text-lg">{title}</h2>
      <div className="min-w-0 text-sm leading-relaxed text-foreground">{children}</div>
    </section>
  );
}

function ListItems({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function CheckList({ included, excluded }: { included: string[]; excluded: string[] }) {
  return (
    <div className="space-y-1">
      {included.map((item) => (
        <div key={`in-${item}`} className="flex gap-2 text-muted-foreground">
          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
          <span>{item}</span>
        </div>
      ))}
      {excluded.map((item) => (
        <div key={`out-${item}`} className="flex gap-2 text-muted-foreground">
          <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function buildGoogleMapsSearchUrl({
  explicitUrl,
  latitude,
  longitude,
  queryParts,
}: {
  explicitUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  queryParts: Array<string | null | undefined>;
}) {
  if (explicitUrl) return explicitUrl;

  if (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude)
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
  }

  const query = queryParts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");

  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : undefined;
}

function ExpandableDescription({
  text,
  seeMoreLabel,
  seeLessLabel,
}: {
  text: string;
  seeMoreLabel: string;
  seeLessLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const shouldCollapse = text.length > 420;

  return (
    <div className="space-y-3">
      <div
        id={contentId}
        className={cn(
          "relative whitespace-pre-line text-muted-foreground",
          shouldCollapse && !expanded && "max-h-[8.25rem] overflow-hidden",
        )}
      >
        {text}
        {shouldCollapse && !expanded ? (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />
        ) : null}
      </div>
      {shouldCollapse ? (
        <button
          type="button"
          className="text-sm font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? seeLessLabel : seeMoreLabel}
        </button>
      ) : null}
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "h-4 w-4",
            index < rating ? "fill-slate-950 text-slate-950" : "text-muted-foreground/30",
          )}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating}</span>
    </div>
  );
}

export function BeachesLayout({
  details,
  fallbackDescription,
  listingName,
  cityName,
  tags,
  address,
  latitude,
  longitude,
  googleMapsUrl,
  nearbyListings = [],
}: BeachesLayoutProps) {
  const { t } = useTranslation();
  const l = useLocalePath();

  const important = asRecord(parseJsonValue(details.important_information ?? details.important_info));
  const highlights = firstList(details, ["highlights", "beach_highlights", "experience_highlights"]);
  const includes = firstList(details, ["includes", "included", "beach_includes"]);
  const excludes = firstList(details, ["excludes", "excluded", "not_included", "beach_excludes"]);
  const notSuitableFor = firstList(details, ["not_suitable_for", "unsuitable_for"]);
  const suitableFor = firstList(details, ["suitable_for", "beach_suitable_for"]);
  const bestTimeToVisit =
    stringFrom(important.best_time_to_visit) ??
    firstString(details, ["best_time_to_visit", "best_visit_time", "seasonality"]);
  const whatToBring = [
    ...listFrom(important.what_to_bring),
    ...firstList(details, ["what_to_bring"]),
  ];
  const notAllowed = [
    ...listFrom(important.not_allowed),
    ...firstList(details, ["not_allowed"]),
  ];
  const knowBeforeYouGo =
    stringFrom(important.know_before_you_go) ??
    firstString(details, ["know_before_you_go", "important_notes"]);
  const fullDescription =
    firstString(details, ["full_description", "beach_full_description", "description"]) ??
    fallbackDescription;
  const meetingPoint = firstString(details, ["meeting_point", "meeting_point_description"]);
  const explicitMapUrl = firstString(details, ["meeting_point_google_maps_url", "google_maps_url", "map_url"]);
  const coordinates = asRecord(details.coordinates ?? details.location);
  const mapLatitude = numberFrom(latitude)
    ?? numberFrom(details.latitude ?? details.Latitude)
    ?? numberFrom(coordinates.latitude ?? coordinates.lat);
  const mapLongitude = numberFrom(longitude)
    ?? numberFrom(details.longitude ?? details.Longitude)
    ?? numberFrom(coordinates.longitude ?? coordinates.lng ?? coordinates.lon);
  const hasMapCoordinates = mapLatitude !== undefined && mapLongitude !== undefined;
  const mapUrl = buildGoogleMapsSearchUrl({
    explicitUrl: explicitMapUrl ?? googleMapsUrl,
    latitude: mapLatitude,
    longitude: mapLongitude,
    queryParts: [meetingPoint, address, listingName, cityName, "Algarve Portugal"],
  });
  const meetingPointText =
    meetingPoint ??
    address ??
    [listingName, cityName, "Algarve Portugal"].filter(Boolean).join(", ");
  const mapAddress = firstString(details, ["address", "full_address"]) ?? address ?? meetingPointText;
  const testimonials = readTestimonials(details.testimonials ?? details.testimonials_json);
  const seoGroupsFromData = readSeoGroups(details.seo_link_groups ?? details.seo_link_groups_json ?? details.related_tag_groups);

  const derivedHighlights = useMemo(() => {
    if (highlights.length > 0) return highlights;
    return [
      details.blue_flag ? t("categoryLayouts.beach.blueFlagHighlight") : null,
      details.lifeguard ? t("categoryLayouts.beach.lifeguardHighlight") : null,
      details.parking_available ? t("categoryLayouts.beach.parkingHighlight") : null,
      details.restaurant_nearby ? t("categoryLayouts.beach.restaurantHighlight") : null,
      details.sunbeds_available ? t("categoryLayouts.beach.sunbedsHighlight") : null,
      cityName
        ? t("categoryLayouts.beach.locationHighlight", {
            place: cityName,
            defaultValue: `Located in ${cityName}, Algarve`,
          })
        : null,
    ].filter((item): item is string => Boolean(item));
  }, [cityName, details, highlights, t]);

  const seoGroups = useMemo<SeoLinkGroup[]>(() => {
    if (seoGroupsFromData.length > 0) return seoGroupsFromData;

    const city = cityName ?? "Algarve";
    const cleanTags = (tags ?? [])
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 20);

    return [
      ...(cleanTags.length > 0
        ? [{
            title: t("categoryLayouts.beach.relatedBeachTags"),
            links: cleanTags.map((label) => ({ label })),
          }]
        : []),
      {
        title: t("categoryLayouts.beach.topAttractions", { place: city }),
        links: [
          t("categoryLayouts.beach.seo.praiaDaMarinha"),
          t("categoryLayouts.beach.seo.benagilCave"),
          t("categoryLayouts.beach.seo.pontaDaPiedade"),
          t("categoryLayouts.beach.seo.praiaDoCamilo"),
          t("categoryLayouts.beach.seo.praiaDaFalesia"),
        ].map((label) => ({ label })),
      },
      {
        title: t("categoryLayouts.beach.experiences", { place: city }),
        links: [
          t("categoryLayouts.beach.seo.familyBeaches"),
          t("categoryLayouts.beach.seo.hiddenCoves"),
          t("categoryLayouts.beach.seo.coastalWalks"),
          t("categoryLayouts.beach.seo.snorkeling"),
          t("categoryLayouts.beach.seo.sunsetBeaches"),
          t("categoryLayouts.beach.seo.beachRestaurants"),
          t("categoryLayouts.beach.seo.kayaking"),
          t("categoryLayouts.beach.seo.seaCaves"),
        ].map((label) => ({ label })),
      },
      {
        title: t("categoryLayouts.beach.tours", { place: "Algarve" }),
        links: [
          t("categoryLayouts.beach.seo.lagosBeaches"),
          t("categoryLayouts.beach.seo.albufeiraBeaches"),
          t("categoryLayouts.beach.seo.portimaoBeaches"),
          t("categoryLayouts.beach.seo.lagoaBeaches"),
          t("categoryLayouts.beach.seo.taviraBeaches"),
          t("categoryLayouts.beach.seo.aljezurBeaches"),
        ].map((label) => ({ label })),
      },
      {
        title: t("categoryLayouts.beach.thingsToDo", { place: city }),
        links: [
          t("categoryLayouts.beach.seo.boatTrips"),
          t("categoryLayouts.beach.seo.surfLessons"),
          t("categoryLayouts.beach.seo.paddleboarding"),
          t("categoryLayouts.beach.seo.beachBars"),
          t("categoryLayouts.beach.seo.photographySpots"),
        ].map((label) => ({ label })),
      },
    ];
  }, [cityName, seoGroupsFromData, tags, t]);

  const nearbyFromSameCity = nearbyListings
    .filter((item) => item.id && item.name && item.slug && (!cityName || item.city?.name === cityName))
    .slice(0, 6);
  const nearbyToRender = nearbyFromSameCity.length > 0 ? nearbyFromSameCity : nearbyListings.slice(0, 3);
  const hasImportantInformation =
    whatToBring.length > 0 ||
    notAllowed.length > 0 ||
    knowBeforeYouGo ||
    bestTimeToVisit ||
    suitableFor.length > 0 ||
    notSuitableFor.length > 0 ||
    includes.length > 0 ||
    excludes.length > 0;

  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-border/70 bg-card px-5 shadow-sm sm:px-7">
        {derivedHighlights.length > 0 ? (
          <DetailRow title={t("categoryLayouts.beach.highlights")} className="border-t-0">
            <ListItems items={derivedHighlights} />
          </DetailRow>
        ) : null}

        {fullDescription ? (
          <DetailRow
            title={t("categoryLayouts.beach.fullDescription")}
            className={derivedHighlights.length === 0 ? "border-t-0" : undefined}
          >
            <ExpandableDescription
              text={fullDescription}
              seeMoreLabel={t("categoryLayouts.beach.seeMore")}
              seeLessLabel={t("categoryLayouts.beach.seeLess")}
            />
          </DetailRow>
        ) : null}

        {mapUrl || meetingPointText ? (
          <DetailRow title={t("categoryLayouts.beach.meetingPoint")}>
            <div className="space-y-4">
              {meetingPointText ? <p className="text-muted-foreground">{meetingPointText}</p> : null}
              {mapUrl ? (
                <Button variant="link" asChild className="h-auto px-0 text-foreground underline-offset-4">
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="mr-2 h-4 w-4" />
                    {t("categoryLayouts.beach.openInGoogleMaps")}
                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </a>
                </Button>
              ) : null}
            </div>
          </DetailRow>
        ) : null}

        {hasImportantInformation ? (
          <DetailRow title={t("categoryLayouts.beach.importantInformation")}>
            <div className="grid gap-6 sm:grid-cols-2">
              {whatToBring.length > 0 ? (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{t("categoryLayouts.beach.whatToBring")}</h3>
                  <ListItems items={whatToBring} />
                </div>
              ) : null}
              {notAllowed.length > 0 ? (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{t("categoryLayouts.beach.notAllowed")}</h3>
                  <ListItems items={notAllowed} />
                </div>
              ) : null}
              {suitableFor.length > 0 ? (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">
                    {t("categoryLayouts.beach.suitableFor", { defaultValue: "Suitable for" })}
                  </h3>
                  <ListItems items={suitableFor} />
                </div>
              ) : null}
              {notSuitableFor.length > 0 ? (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{t("categoryLayouts.beach.notSuitableFor")}</h3>
                  <ListItems items={notSuitableFor} />
                </div>
              ) : null}
              {includes.length > 0 || excludes.length > 0 ? (
                <div className="sm:col-span-2">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{t("categoryLayouts.beach.includes")}</h3>
                  <CheckList included={includes} excluded={excludes} />
                </div>
              ) : null}
              {bestTimeToVisit ? (
                <div className="sm:col-span-2">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">
                    {t("categoryLayouts.beach.bestTimeToVisit", { defaultValue: "Best time to visit" })}
                  </h3>
                  <p className="whitespace-pre-line text-muted-foreground">{bestTimeToVisit}</p>
                </div>
              ) : null}
              {knowBeforeYouGo ? (
                <div className="sm:col-span-2">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{t("categoryLayouts.beach.knowBeforeYouGo")}</h3>
                  <p className="whitespace-pre-line text-muted-foreground">{knowBeforeYouGo}</p>
                </div>
              ) : null}
            </div>
          </DetailRow>
        ) : null}
      </div>

      {hasMapCoordinates ? (
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="h-[20rem] min-h-[280px] lg:h-[24rem]">
              <ListingMap
                lat={mapLatitude}
                lng={mapLongitude}
                name={listingName ?? meetingPointText}
                address={mapAddress}
                className="h-full rounded-none border-0"
              />
            </div>
            <div className="flex flex-col justify-between gap-4 border-t border-border/70 p-5 sm:p-7 lg:border-l lg:border-t-0">
              <div>
                <h2 className="text-xl font-bold text-foreground">{t("listing.location")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mapAddress}</p>
              </div>
              {mapUrl ? (
                <Button variant="outline" asChild className="w-fit">
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="mr-2 h-4 w-4" />
                    {t("categoryLayouts.beach.openInGoogleMaps")}
                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {nearbyToRender.length > 0 ? (
        <section className="space-y-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {cityName
                ? t("categoryLayouts.beach.moreAttractionsNear", {
                    place: cityName,
                    defaultValue: `More attractions near ${cityName}`,
                  })
                : t("categoryLayouts.beach.moreAttractions", { defaultValue: "More attractions near" })}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nearbyToRender.map((nearby) => (
              <Link
                key={nearby.id}
                href={l({
                  routeType: "listing",
                  slugs: buildUniformLocalizedSlugMap(nearby.slug ?? nearby.id),
                })}
                className="group overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-primary/45"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <ListingImage
                    src={nearby.featured_image_url ?? null}
                    fallbackSrc="/placeholder.svg"
                    imageVersion={nearby.updated_at}
                    alt={nearby.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  {nearby.city?.name ? (
                    <p className="mb-1 text-xs text-muted-foreground">{nearby.city.name}</p>
                  ) : null}
                  <h3 className="line-clamp-2 font-serif text-base font-medium text-foreground transition-colors group-hover:text-primary">
                    {nearby.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {testimonials.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">{t("categoryLayouts.beach.travelersLoved")}</h2>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.slice(0, 2).map((testimonial) => (
              <article key={`${testimonial.name}-${testimonial.date ?? testimonial.text.slice(0, 16)}`} className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
                <StarRow rating={testimonial.rating} />
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-400 text-xl font-bold text-white">
                    {testimonial.avatarInitial ?? testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                      {testimonial.country ? ` - ${testimonial.country}` : ""}
                    </p>
                    {testimonial.date || testimonial.verified ? (
                      <p className="text-sm text-muted-foreground">
                        {testimonial.date}
                        {testimonial.date && testimonial.verified ? " - " : ""}
                        {testimonial.verified ? t("categoryLayouts.beach.verifiedBooking") : ""}
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="mt-4 text-base leading-relaxed text-foreground">
                  {testimonial.text.length > 180 ? `${testimonial.text.slice(0, 177)}...` : testimonial.text}
                  {testimonial.text.length > 180 ? (
                    <span className="ml-1 font-semibold text-muted-foreground underline underline-offset-4">
                      {t("categoryLayouts.beach.readMore")}
                    </span>
                  ) : null}
                </p>
              </article>
            ))}
          </div>
          {testimonials.length > 2 ? (
            <div className="flex justify-end">
              <Button variant="link" className="px-0 font-semibold underline underline-offset-4">
                {t("categoryLayouts.beach.seeMoreReviews")}
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(212,166,42,0.16),transparent_34%),linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--background))_100%)] p-4 shadow-[0_24px_80px_-58px_rgba(15,23,42,0.5)] sm:p-6 lg:p-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
              {t("categoryLayouts.beach.relatedGuidesEyebrow", { defaultValue: "Explore more" })}
            </p>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("categoryLayouts.beach.relatedGuides", { defaultValue: "Related beach guides" })}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("categoryLayouts.beach.relatedGuidesDescription", {
                defaultValue: "Quick coastal searches, nearby places, and trip ideas connected to this beach.",
              })}
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t("categoryLayouts.beach.relatedLinksTotal", {
              count: seoGroups.reduce((total, group) => total + group.links.length, 0),
              defaultValue: `${seoGroups.reduce((total, group) => total + group.links.length, 0)} links`,
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {seoGroups.map((group, groupIndex) => {
            const Icon = seoGroupIcons[groupIndex % seoGroupIcons.length] ?? Hash;
            const visibleLinks = group.links.slice(0, 24);

            return (
              <article
                key={group.title}
                className={cn(
                  "rounded-2xl border border-border/70 bg-background/78 p-4 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)] backdrop-blur-sm transition-colors dark:bg-white/[0.04] sm:p-5",
                  groupIndex === 0 ? "lg:col-span-2" : "",
                )}
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-serif text-lg font-semibold leading-tight text-foreground sm:text-xl">
                        {group.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        {t("categoryLayouts.beach.relatedLinksCount", {
                          count: visibleLinks.length,
                          defaultValue: `${visibleLinks.length} links`,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {visibleLinks.map((link, index) => {
                    const href = link.href ?? l(buildCategoryRouteData("beaches") ?? buildStaticRouteData("beaches"));
                    return (
                      <Link
                        key={`${group.title}-${link.label}-${index}`}
                        href={href}
                        aria-label={`${index + 1}. ${link.label}`}
                        className="group inline-flex max-w-full items-center overflow-hidden rounded-full border border-border/80 bg-card text-xs font-semibold text-card-foreground shadow-[0_8px_22px_-18px_rgba(15,23,42,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/[0.08] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 dark:border-white/[0.14] dark:bg-white/[0.06] dark:text-foreground dark:hover:bg-primary/15"
                      >
                        <span className="flex h-8 min-w-8 items-center justify-center bg-foreground px-2 text-[11px] font-bold text-background transition-colors group-hover:bg-primary group-hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="truncate px-3 py-2">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
