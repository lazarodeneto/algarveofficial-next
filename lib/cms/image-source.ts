export type NormalizedImageSource = {
  src: string | null;
  kind: "public-path" | "supabase-public-url" | "external-url" | "invalid" | "empty";
  reason?: string;
};

const IMAGE_EXTENSION_PATTERN = /\.(avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;
const SUPABASE_PUBLIC_OBJECT_SEGMENT = "/storage/v1/object/public/";
const SUPABASE_PUBLIC_RENDER_SEGMENT = "/storage/v1/render/image/public/";
const SUPABASE_SIGNED_OBJECT_SEGMENT = "/storage/v1/object/sign/";
const DEFAULT_CMS_BUCKET = "media";

const ALLOWED_EXACT_HOSTS = new Set([
  "algarveofficial.com",
  "www.algarveofficial.com",
  "cdn.algarveofficial.com",
  "cdn.pixabay.com",
  "storage.googleapis.com",
  "images.unsplash.com",
  "setimaondaboattrips.com",
  "images.cdn-files-a.com",
  "boavistaresort.pt",
  "www.boavistaresort.pt",
  "static.wixstatic.com",
  "i.ytimg.com",
  "img.youtube.com",
]);

const ALLOWED_HOST_SUFFIXES = [
  ".algarveofficial.com",
  ".supabase.co",
  ".supabase.storage.supabase.co",
  ".setimaondaboattrips.com",
  ".cdn-files-a.com",
  ".wixstatic.com",
  ".googleapis.com",
  ".google.com",
  ".ggpht.com",
];

const BLOCKED_HOSTS = new Set([
  "lemonzest-foodcontent.com",
  "pinecliffs.com",
  "www.pinecliffs.com",
]);

const LOCAL_DEV_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function joinSupabaseBaseUrl(pathname: string): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  if (!baseUrl) return null;
  return `${baseUrl}/${pathname.replace(/^\/+/, "")}`;
}

function encodePublicPath(path: string) {
  const [pathname, suffix = ""] = path.split(/([?#].*)/, 2);
  return `${encodeURI(pathname)}${suffix}`;
}

function normalizePublicAssetPath(value: string): string | null {
  let candidate = value.trim().replace(/^\.\/+/, "");
  candidate = candidate.replace(/^\/?(?:en|pt-pt|fr|de|es|it|nl|sv|no|da)\/images\//i, "/images/");
  candidate = candidate.replace(/^\/?public\/images\//i, "/images/");
  candidate = candidate.replace(/^\/?images\//i, "/images/");

  if (!candidate.startsWith("/images/")) return null;
  return encodePublicPath(candidate);
}

function isAllowedExternalHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(normalized)) return false;
  return (
    ALLOWED_EXACT_HOSTS.has(normalized) ||
    ALLOWED_HOST_SUFFIXES.some((suffix) => normalized.endsWith(suffix))
  );
}

function isSupabasePublicUrl(url: URL) {
  return (
    url.hostname.toLowerCase().endsWith(".supabase.co") &&
    (url.pathname.includes(SUPABASE_PUBLIC_OBJECT_SEGMENT) ||
      url.pathname.includes(SUPABASE_PUBLIC_RENDER_SEGMENT))
  );
}

function isSignedOrTemporaryUrl(url: URL) {
  const pathname = url.pathname.toLowerCase();
  return (
    pathname.includes(SUPABASE_SIGNED_OBJECT_SEGMENT) ||
    url.searchParams.has("token") ||
    url.searchParams.has("expires") ||
    url.searchParams.has("signature")
  );
}

function normalizeSupabasePublicPath(value: string, bucket: string) {
  const trimmed = value.trim();
  const publicPathPrefixes = [
    SUPABASE_PUBLIC_OBJECT_SEGMENT,
    SUPABASE_PUBLIC_RENDER_SEGMENT,
    "storage/v1/object/public/",
    "storage/v1/render/image/public/",
  ];
  const matchedPrefix = publicPathPrefixes.find((prefix) => trimmed.startsWith(prefix));

  if (matchedPrefix) {
    return joinSupabaseBaseUrl(trimmed);
  }

  if (
    !trimmed.startsWith("/") &&
    !trimmed.includes("://") &&
    IMAGE_EXTENSION_PATTERN.test(trimmed)
  ) {
    const cleanedBucket = bucket.replace(/^\/+|\/+$/g, "") || DEFAULT_CMS_BUCKET;
    const cleanedPath = trimmed
      .replace(new RegExp(`^${cleanedBucket}/`, "i"), "")
      .replace(/^\/+/, "");

    return joinSupabaseBaseUrl(
      `${SUPABASE_PUBLIC_OBJECT_SEGMENT.replace(/^\/+/, "")}${cleanedBucket}/${cleanedPath}`,
    );
  }

  return null;
}

export function normalizeCmsImageSrc(
  input: unknown,
  options: { bucket?: string } = {},
): NormalizedImageSource {
  if (input === null || input === undefined) {
    return { src: null, kind: "empty", reason: "No image value was provided." };
  }

  if (typeof input !== "string") {
    return { src: null, kind: "invalid", reason: "Image value must be a string." };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { src: null, kind: "empty", reason: "Image value is empty." };
  }

  if (/^(blob|data|file):/i.test(trimmed)) {
    return { src: null, kind: "invalid", reason: "Temporary or local image URLs cannot be stored in CMS content." };
  }

  const publicPath = normalizePublicAssetPath(trimmed);
  if (publicPath) {
    return { src: publicPath, kind: "public-path" };
  }

  const supabasePath = normalizeSupabasePublicPath(trimmed, options.bucket ?? DEFAULT_CMS_BUCKET);
  if (supabasePath) {
    return { src: supabasePath, kind: "supabase-public-url" };
  }

  if (trimmed.startsWith("//")) {
    return normalizeCmsImageSrc(`https:${trimmed}`, options);
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { src: null, kind: "invalid", reason: "Image URL is not a valid public path or HTTPS URL." };
  }

  if (isSignedOrTemporaryUrl(parsed)) {
    return { src: null, kind: "invalid", reason: "Signed or expiring image URLs cannot be stored as CMS media." };
  }

  const isLocalDevHttp =
    parsed.protocol === "http:" &&
    process.env.NODE_ENV !== "production" &&
    LOCAL_DEV_HOSTS.has(parsed.hostname.toLowerCase());

  if (parsed.protocol !== "https:" && !isLocalDevHttp) {
    return { src: null, kind: "invalid", reason: "CMS images must use HTTPS or a local development URL." };
  }

  if (!isAllowedExternalHost(parsed.hostname) && !isLocalDevHttp) {
    return { src: null, kind: "invalid", reason: "Image host is not allowed by the CMS image policy." };
  }

  if (isSupabasePublicUrl(parsed)) {
    return { src: parsed.toString(), kind: "supabase-public-url" };
  }

  return { src: parsed.toString(), kind: "external-url" };
}

export function isAllowedCmsImageSrc(src: string): boolean {
  return normalizeCmsImageSrc(src).src !== null;
}

export function getSafeCmsImageSrc(input: unknown, options?: { bucket?: string }): string | null {
  return normalizeCmsImageSrc(input, options).src;
}

function isImageFieldKey(key: string) {
  const normalized = key.replaceAll("_", "").toLowerCase();
  return (
    normalized === "image" ||
    normalized === "src" ||
    normalized === "imageurl" ||
    normalized === "posterurl" ||
    normalized === "backgroundimage" ||
    normalized === "backgroundimageurl" ||
    normalized === "featuredimageurl" ||
    normalized === "heroimageurl"
  );
}

export function normalizeCmsImageFieldsInValue<T>(value: T, options?: { bucket?: string }): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeCmsImageFieldsInValue(item, options)) as T;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, child]) => {
      if (isImageFieldKey(key)) {
        return [key, getSafeCmsImageSrc(child, options) ?? ""];
      }

      return [key, normalizeCmsImageFieldsInValue(child, options)];
    }),
  ) as T;
}
