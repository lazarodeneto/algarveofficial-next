import { divIcon, type DivIcon } from "leaflet";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getCategoryMapColor } from "@/lib/mapCategoryColors";
import { getMapCategoryIcon } from "@/lib/mapCategoryIcons";

type MarkerTier = "signature" | "verified" | "default";

type MarkerOptions = {
  category?: string | null;
  tier?: MarkerTier | string | null;
  price?: number | null;
  currency?: string | null;
  isActive?: boolean;
};

const markerCache = new Map<string, DivIcon>();

function normalizeTier(tier?: MarkerOptions["tier"]): MarkerTier {
  if (tier === "signature" || tier === "verified") return tier;
  return "default";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPrice(price: number, currency?: string | null): string {
  const safeCurrency = currency || "EUR";
  const compact = price >= 1_000_000 ? `${Math.round(price / 100_000) / 10}M` : price >= 1000 ? `${Math.round(price / 1000)}k` : `${price}`;
  const symbol = safeCurrency === "EUR" ? "€" : safeCurrency;

  return `${symbol}${compact}`;
}

function getCategorySVG(category?: string | null): string {
  const Icon = getMapCategoryIcon(category);
  return renderToStaticMarkup(
    createElement(Icon, {
      "aria-hidden": true,
      color: "white",
      fill: "none",
      size: 18,
      strokeWidth: 2.35,
    }),
  );
}

function shouldUsePriceMarker(category?: string | null, price?: number | null): price is number {
  if (!price || price <= 0) return false;
  const slug = category?.toLowerCase() ?? "";

  return slug.includes("real-estate") || slug.includes("property") || slug.includes("accommodation") || slug.includes("stay");
}

export function createMarker({
  category,
  tier,
  price,
  currency,
  isActive = false,
}: MarkerOptions): DivIcon {
  const normalizedTier = normalizeTier(tier);
  const priceMarker = shouldUsePriceMarker(category, price);
  const categoryColor = getCategoryMapColor(category);
  const cacheKey = [
    priceMarker ? "price" : "icon",
    category ?? "default",
    categoryColor,
    normalizedTier,
    priceMarker ? price : "none",
    currency ?? "EUR",
    isActive ? "active" : "default",
  ].join(":");
  const cached = markerCache.get(cacheKey);
  if (cached) return cached;

  const tierRing: Record<MarkerTier, string> = {
    signature: "#C9A23A",
    verified: "#ffffff",
    default: "#ffffff",
  };
  const bg = categoryColor;
  const scale = isActive ? 1.16 : 1;
  const shadow = isActive
    ? `0 14px 28px rgba(15,23,42,0.32), 0 0 0 5px ${categoryColor}40`
    : "0 7px 16px rgba(15,23,42,0.24)";

  if (priceMarker) {
    const label = escapeHtml(formatPrice(price, currency));
    const width = Math.max(58, Math.min(92, label.length * 10 + 24));
    const height = isActive ? 36 : 32;
    const icon = divIcon({
      html: `
        <div style="
          transform:scale(${scale});
          transform-origin:center bottom;
          background:#ffffff;
          color:#111111;
          padding:7px 11px;
          border-radius:999px;
          font-weight:700;
          font-size:13px;
          line-height:1;
          white-space:nowrap;
          box-shadow:${shadow};
          border:2px solid ${isActive ? categoryColor : "rgba(17,17,17,0.12)"};
          outline:3px solid ${categoryColor}26;
        ">${label}</div>
      `,
      className: "ao-price-marker",
      iconSize: [width, height],
      iconAnchor: [width / 2, height],
      popupAnchor: [0, -height],
    });
    markerCache.set(cacheKey, icon);
    return icon;
  }

  const size = isActive ? 44 : 36;
  const innerSize = size - 6;
  const icon = divIcon({
    html: `
      <div style="
        transform:scale(${scale});
        transform-origin:center bottom;
        width:${size}px;
        height:${size}px;
        border-radius:9999px;
        background:#ffffff;
        display:flex;
        align-items:center;
        justify-content:center;
        border:3px solid ${tierRing[normalizedTier]};
        box-shadow:${shadow};
      ">
        <div style="
          width:${innerSize}px;
          height:${innerSize}px;
          border-radius:9999px;
          background:${bg};
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.32);
        ">
          ${getCategorySVG(category)}
        </div>
      </div>
    `,
    className: "listing-marker-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
  markerCache.set(cacheKey, icon);
  return icon;
}
