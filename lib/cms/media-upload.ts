export const CMS_MEDIA_BUCKET = "media";

export const CMS_HERO_UPLOAD_TARGETS = ["image", "poster", "video"] as const;

export type CmsHeroUploadTarget = (typeof CMS_HERO_UPLOAD_TARGETS)[number];

export const CMS_HERO_IMAGE_MIME_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const CMS_HERO_VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/ogg",
  "video/webm",
]);

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/ogg": "ogv",
  "video/webm": "webm",
};

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export interface CmsHeroUploadValidationInput {
  target: CmsHeroUploadTarget;
  contentType: string;
  fileName: string;
  size: number;
}

export type CmsHeroUploadValidationResult =
  | { ok: true; contentType: string; extension: string }
  | { ok: false; code: string; message: string };

export function isCmsHeroUploadTarget(value: unknown): value is CmsHeroUploadTarget {
  return typeof value === "string" && CMS_HERO_UPLOAD_TARGETS.includes(value as CmsHeroUploadTarget);
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[a-z0-9]+$/i, "");
}

export function slugifyCmsFileName(fileName: string) {
  const baseName = stripExtension(fileName.trim()) || "upload";
  const slug = baseName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return slug || "upload";
}

export function validateCmsHeroUploadFile({
  target,
  contentType,
  fileName,
  size,
}: CmsHeroUploadValidationInput): CmsHeroUploadValidationResult {
  const normalizedContentType = contentType.trim().toLowerCase();
  const isVideoTarget = target === "video";
  const allowedTypes = isVideoTarget ? CMS_HERO_VIDEO_MIME_TYPES : CMS_HERO_IMAGE_MIME_TYPES;
  const maxSize = isVideoTarget ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  const kind = isVideoTarget ? "video" : "image";

  if (!fileName.trim()) {
    return {
      ok: false,
      code: "MISSING_FILE_NAME",
      message: "Uploaded file must include a file name.",
    };
  }

  if (!allowedTypes.has(normalizedContentType)) {
    return {
      ok: false,
      code: "UNSUPPORTED_MEDIA_TYPE",
      message: `Hero ${kind} uploads must be ${Array.from(allowedTypes).join(", ")}.`,
    };
  }

  if (!Number.isFinite(size) || size <= 0) {
    return {
      ok: false,
      code: "EMPTY_UPLOAD",
      message: "Uploaded file is empty.",
    };
  }

  if (size > maxSize) {
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      message: `Hero ${kind} uploads must be ${isVideoTarget ? "100MB" : "8MB"} or smaller.`,
    };
  }

  return {
    ok: true,
    contentType: normalizedContentType,
    extension: MIME_EXTENSION_MAP[normalizedContentType],
  };
}

export function buildCmsHeroUploadPath({
  pageId,
  target,
  fileName,
  extension,
  now = new Date(),
}: {
  pageId: string;
  target: CmsHeroUploadTarget;
  fileName: string;
  extension: string;
  now?: Date;
}) {
  const timestamp = now
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".", "");
  const slug = slugifyCmsFileName(fileName);
  const normalizedExtension = extension.replace(/^\.+/, "").toLowerCase();

  return `cms/pages/${pageId}/hero/${timestamp}-${target}-${slug}.${normalizedExtension}`;
}
