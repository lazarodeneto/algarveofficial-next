import type { AppLocale } from "./locales";

export type StaticRouteKey =
  | "home"
  | "about-us"
  | "blog"
  | "contact"
  | "cookie-policy"
  | "destinations"
  | "events"
  | "experiences"
  | "beaches"
  | "forgot-password"
  | "golf"
  | "invest"
  | "login"
  | "map"
  | "partner"
  | "pricing"
  | "privacy-policy"
  | "properties"
  | "real-estate"
  | "relocation"
  | "signup"
  | "stay"
  | "terms"
  | "trips";

export type EntityRouteType =
  | "listing"
  | "blog-post"
  | "destination"
  | "event"
  | "guide"
  | "city"
  | "city-category"
  | "category";

export type RouteKey = StaticRouteKey | EntityRouteType;

export type LocalizedSlugMap = Partial<Record<AppLocale, string>>;

export interface LocalizedEntityBase {
  routeType: EntityRouteType;
  slugs: LocalizedSlugMap;
}

export interface ListingRouteData extends LocalizedEntityBase {
  routeType: "listing";
  id?: string;
}

export interface BlogPostRouteData extends LocalizedEntityBase {
  routeType: "blog-post";
  id?: string;
}

export interface DestinationRouteData extends LocalizedEntityBase {
  routeType: "destination";
  id?: string;
}

export interface EventRouteData extends LocalizedEntityBase {
  routeType: "event";
  id?: string;
}

export interface GuideRouteData extends LocalizedEntityBase {
  routeType: "guide";
  id?: string;
}

export interface CategoryRouteData extends LocalizedEntityBase {
  routeType: "category";
}

export interface CityRouteData {
  routeType: "city";
  citySlugs: LocalizedSlugMap;
}

export interface CityCategoryRouteData {
  routeType: "city-category";
  citySlugs: LocalizedSlugMap;
  categorySlugs: LocalizedSlugMap;
}

export type EntityRouteData =
  | ListingRouteData
  | BlogPostRouteData
  | DestinationRouteData
  | EventRouteData
  | GuideRouteData
  | CategoryRouteData
  | CityRouteData
  | CityCategoryRouteData;

export interface StaticRouteData {
  routeType: "static";
  routeKey: StaticRouteKey;
}

export type LocalizedRouteInput = StaticRouteData | EntityRouteData;

export interface AlternatePathMap {
  canonical: string;
  alternates: Record<AppLocale, string>;
}

export type RouteQueryValue = string | number | boolean | null | undefined;
export type RouteQueryRecord = Record<
  string,
  RouteQueryValue | RouteQueryValue[]
>;
export type RouteQueryInput = string | URLSearchParams | RouteQueryRecord;

export interface LocalizedRouteOptions {
  query?: RouteQueryInput;
  hash?: string | null;
}
