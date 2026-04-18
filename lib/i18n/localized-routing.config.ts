import type { EntityRouteType, StaticRouteKey } from "./localized-routing.types";

export const STATIC_ROUTE_SEGMENTS: Record<StaticRouteKey, string> = {
  home: "",
  "about-us": "about-us",
  blog: "blog",
  contact: "contact",
  "cookie-policy": "cookie-policy",
  destinations: "destinations",
  events: "events",
  experiences: "experiences",
  beaches: "beaches",
  "forgot-password": "forgot-password",
  golf: "golf",
  invest: "invest",
  login: "login",
  map: "map",
  partner: "partner",
  pricing: "pricing",
  "privacy-policy": "privacy-policy",
  properties: "properties",
  "real-estate": "real-estate",
  residence: "residence",
  signup: "signup",
  stay: "stay",
  terms: "terms",
  trips: "trips",
};

export const ENTITY_ROUTE_PREFIX: Record<EntityRouteType, string> = {
  listing: "listing",
  "blog-post": "blog",
  destination: "destinations",
  event: "events",
  guide: "guides",
  city: "visit",
  "city-category": "visit",
  category: "category",
};
