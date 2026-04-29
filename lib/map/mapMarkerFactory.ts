import { divIcon, type DivIcon } from "leaflet";

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
  const slug = category?.toLowerCase() ?? "";

  if (slug.includes("restaurant") || slug.includes("dining") || slug.includes("chef")) {
    return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 3v8"/><path d="M8 3v8"/><path d="M4 7h4"/><path d="M6 11v10"/><path d="M18 3v18"/><path d="M15 3v7a3 3 0 0 0 3 3"/></svg>`;
  }

  if (slug.includes("golf")) {
    return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 19h12"/><path d="M12 19V5"/><path d="m12 5 7 3-7 3"/><circle cx="7" cy="17" r="1"/></svg>`;
  }

  if (slug.includes("shopping") || slug.includes("boutique")) {
    return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l-1 13H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>`;
  }

  if (slug.includes("beach")) {
    return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18c3 0 3-2 6-2s3 2 6 2 3-2 6-2"/><path d="M3 22c3 0 3-2 6-2s3 2 6 2 3-2 6-2"/><path d="M12 4v8"/><path d="m5 12 7-8 7 8"/></svg>`;
  }

  if (slug.includes("real-estate") || slug.includes("property") || slug.includes("accommodation") || slug.includes("stay")) {
    return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10"/><path d="M9 21v-6h6v6"/></svg>`;
  }

  if (slug.includes("experience") || slug.includes("event")) {
    return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/></svg>`;
  }

  return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M12 9v3l2 2"/></svg>`;
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
  const cacheKey = [
    priceMarker ? "price" : "icon",
    category ?? "default",
    normalizedTier,
    priceMarker ? price : "none",
    currency ?? "EUR",
    isActive ? "active" : "default",
  ].join(":");
  const cached = markerCache.get(cacheKey);
  if (cached) return cached;

  const colors: Record<MarkerTier, string> = {
    signature: "#C9A23A",
    verified: "#16a34a",
    default: "#111111",
  };
  const bg = colors[normalizedTier];
  const scale = isActive ? 1.16 : 1;
  const shadow = isActive
    ? "0 14px 28px rgba(0,0,0,0.34), 0 0 0 4px rgba(201,162,58,0.28)"
    : "0 7px 16px rgba(0,0,0,0.26)";

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
          border:2px solid ${isActive ? "#C9A23A" : "rgba(17,17,17,0.12)"};
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
  const icon = divIcon({
    html: `
      <div style="
        transform:scale(${scale});
        transform-origin:center bottom;
        width:${size}px;
        height:${size}px;
        border-radius:9999px;
        background:${bg};
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        border:3px solid #ffffff;
        box-shadow:${shadow};
      ">
        ${getCategorySVG(category)}
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
