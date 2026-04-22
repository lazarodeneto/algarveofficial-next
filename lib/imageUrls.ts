export function isBlockedPublicImageUrl(value?: string | null): boolean {
  if (!value || typeof value !== "string") return false;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    if (
      hostname.endsWith("googleapis.com")
      && pathname.includes("/maps/api/place/photo")
    ) {
      return true;
    }

    if (
      hostname === "places.googleapis.com"
      && pathname.includes("/media")
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function joinSupabaseBaseUrl(pathname: string): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  if (!baseUrl) return null;
  return `${baseUrl}/${pathname.replace(/^\/+/, "")}`;
}

export function normalizePublicImageUrl(value?: string | null): string | null {
  if (!value || typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isPlaceholderImageUrl(trimmed)) return null;
  if (isBlockedPublicImageUrl(trimmed)) return null;

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("http://")) {
    return `https://${trimmed.slice("http://".length)}`;
  }

  if (
    trimmed.startsWith(SUPABASE_PUBLIC_OBJECT_SEGMENT)
    || trimmed.startsWith(SUPABASE_PUBLIC_RENDER_SEGMENT)
    || trimmed.startsWith("storage/v1/object/public/")
    || trimmed.startsWith("storage/v1/render/image/public/")
  ) {
    return joinSupabaseBaseUrl(trimmed) ?? trimmed;
  }

  return trimmed;
}

function isPlaceholderImageUrl(value: string): boolean {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === "yoursite.com" || hostname.endsWith(".yoursite.com");
  } catch {
    return value.toLowerCase().includes("yoursite.com");
  }
}

const SUPABASE_PUBLIC_OBJECT_SEGMENT = "/storage/v1/object/public/";
const SUPABASE_PUBLIC_RENDER_SEGMENT = "/storage/v1/render/image/public/";
const SUPABASE_PUBLIC_RENDER_ENABLED = false;

type SupabaseImageFormat = "origin" | "webp";

export interface SupabaseImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
  format?: SupabaseImageFormat;
}

function clampQuality(quality: number): number {
  return Math.max(20, Math.min(quality, 100));
}

function toPositiveInt(value?: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded > 0 ? rounded : null;
}

function getSupabaseRenderUrl(url: URL): URL | null {
  if (!SUPABASE_PUBLIC_RENDER_ENABLED) {
    return null;
  }

  const pathname = url.pathname;

  if (pathname.includes(SUPABASE_PUBLIC_RENDER_SEGMENT)) {
    return new URL(url.toString());
  }

  const objectIndex = pathname.indexOf(SUPABASE_PUBLIC_OBJECT_SEGMENT);
  if (objectIndex === -1) return null;

  const suffix = pathname.slice(objectIndex + SUPABASE_PUBLIC_OBJECT_SEGMENT.length);
  const renderPath = `${pathname.slice(0, objectIndex)}${SUPABASE_PUBLIC_RENDER_SEGMENT}${suffix}`;

  const renderUrl = new URL(url.toString());
  renderUrl.pathname = renderPath;
  return renderUrl;
}

export function buildSupabaseImageUrl(
  value?: string | null,
  options: SupabaseImageTransformOptions = {},
): string | null {
  const normalized = normalizePublicImageUrl(value);
  if (!normalized) return null;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return normalized;
  }

  const renderUrl = getSupabaseRenderUrl(parsed);
  if (!renderUrl) return normalized;

  const width = toPositiveInt(options.width);
  const height = toPositiveInt(options.height);
  const quality = toPositiveInt(options.quality);
  const format = options.format ?? "webp";
  const resize = options.resize;

  if (width) renderUrl.searchParams.set("width", String(width));
  if (height) renderUrl.searchParams.set("height", String(height));
  if (quality) renderUrl.searchParams.set("quality", String(clampQuality(quality)));
  if (format) renderUrl.searchParams.set("format", format);
  if (resize) renderUrl.searchParams.set("resize", resize);

  return renderUrl.toString();
}

export function resolveSupabaseBucketImageUrl(
  value: string | null | undefined,
  bucket: string,
): string | null {
  const normalized = normalizePublicImageUrl(value);
  if (!normalized) return null;

  if (
    normalized.startsWith("blob:")
    || normalized.startsWith("data:")
    || normalized.startsWith("/")
    || /^[a-z]+:\/\//i.test(normalized)
  ) {
    return normalized;
  }

  const cleanedBucket = bucket.replace(/^\/+|\/+$/g, "");
  const cleanedPath = normalized
    .replace(new RegExp(`^${cleanedBucket}/`), "")
    .replace(/^\/+/, "");

  return joinSupabaseBaseUrl(
    `${SUPABASE_PUBLIC_OBJECT_SEGMENT.replace(/^\/+/, "")}${cleanedBucket}/${cleanedPath}`,
  );
}

export function buildSupabaseImageSrcSet(
  value: string | null | undefined,
  widths: readonly number[],
  options: Omit<SupabaseImageTransformOptions, "width"> = {},
): string | undefined {
  const uniqueWidths = Array.from(new Set(widths))
    .map((width) => toPositiveInt(width))
    .filter((width): width is number => width !== null)
    .sort((a, b) => a - b);

  if (uniqueWidths.length === 0) return undefined;

  const normalized = normalizePublicImageUrl(value);
  if (!normalized) return undefined;

  const baseline = buildSupabaseImageUrl(normalized, options);
  if (!baseline) return undefined;

  const entries = uniqueWidths
    .map((width) => {
      const transformed = buildSupabaseImageUrl(normalized, { ...options, width });
      return transformed ? `${transformed} ${width}w` : null;
    })
    .filter((entry): entry is string => Boolean(entry));

  if (entries.length === 0) return undefined;

  const transformedUrls = new Set(entries.map((entry) => entry.split(" ")[0]));
  if (transformedUrls.size === 1 && transformedUrls.has(baseline)) {
    return undefined;
  }

  return entries.join(", ");
}
