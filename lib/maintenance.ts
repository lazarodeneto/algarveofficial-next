const IPV4_OCTET_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
const IPV6_EXACT_REGEX = /^[0-9a-fA-F:]+$/;

function parseIpv4Segments(value: string): number[] | null {
  const parts = value.split(".");
  if (parts.length !== 4) {
    return null;
  }

  const segments = parts.map((part) => (IPV4_OCTET_REGEX.test(part) ? Number(part) : NaN));
  if (segments.some(Number.isNaN)) {
    return null;
  }

  return segments;
}

function parseIpv4PrefixSegments(value: string): number[] | null {
  const withoutTrailingDot = value.endsWith(".") ? value.slice(0, -1) : value;
  if (!withoutTrailingDot || withoutTrailingDot.includes("/") || withoutTrailingDot.includes(":")) {
    return null;
  }

  const parts = withoutTrailingDot.split(".");
  if (parts.length === 0 || parts.length >= 4) {
    return null;
  }

  const segments = parts.map((part) => (IPV4_OCTET_REGEX.test(part) ? Number(part) : NaN));
  if (segments.some(Number.isNaN)) {
    return null;
  }

  return segments;
}

function parseIpv4Cidr(value: string): { base: number[]; prefixLength: number } | null {
  const [base, prefixText, ...rest] = value.split("/");
  if (!base || !prefixText || rest.length > 0) {
    return null;
  }

  const baseSegments = parseIpv4Segments(base);
  if (!baseSegments) {
    return null;
  }

  const prefixLength = Number(prefixText);
  if (!Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    return null;
  }

  return { base: baseSegments, prefixLength };
}

function ipv4SegmentsToNumber(segments: number[]): number {
  return (
    ((segments[0] << 24) >>> 0) +
    (segments[1] << 16) +
    (segments[2] << 8) +
    segments[3]
  );
}

function isIpv4WithinCidr(clientIp: string, cidr: string): boolean {
  const parsedClientIp = parseIpv4Segments(clientIp);
  const parsedCidr = parseIpv4Cidr(cidr);
  if (!parsedClientIp || !parsedCidr) {
    return false;
  }

  const clientNumber = ipv4SegmentsToNumber(parsedClientIp);
  const baseNumber = ipv4SegmentsToNumber(parsedCidr.base);
  if (parsedCidr.prefixLength === 0) {
    return true;
  }

  const mask = (0xffffffff << (32 - parsedCidr.prefixLength)) >>> 0;
  return (clientNumber & mask) === (baseNumber & mask);
}

function isIpv4MatchingPrefix(clientIp: string, prefix: string): boolean {
  const parsedClientIp = parseIpv4Segments(clientIp);
  const parsedPrefix = parseIpv4PrefixSegments(prefix);
  if (!parsedClientIp || !parsedPrefix) {
    return false;
  }

  return parsedPrefix.every((segment, index) => parsedClientIp[index] === segment);
}

function isValidIpv6Exact(value: string): boolean {
  return value.includes(":") && !value.includes("/") && IPV6_EXACT_REGEX.test(value);
}

export function normalizeMaintenanceWhitelistEntry(entry: string): string {
  const trimmed = entry.trim();
  if (!trimmed) {
    return "";
  }

  if (parseIpv4Cidr(trimmed)) {
    return trimmed;
  }

  const ipv4Segments = parseIpv4Segments(trimmed);
  if (ipv4Segments) {
    return ipv4Segments.join(".");
  }

  const ipv4PrefixSegments = parseIpv4PrefixSegments(trimmed);
  if (ipv4PrefixSegments) {
    return ipv4PrefixSegments.join(".");
  }

  return trimmed;
}

export function isValidMaintenanceWhitelistEntry(entry: string): boolean {
  const normalized = normalizeMaintenanceWhitelistEntry(entry);
  if (!normalized) {
    return false;
  }

  return Boolean(
    parseIpv4Segments(normalized) ||
      parseIpv4PrefixSegments(normalized) ||
      parseIpv4Cidr(normalized) ||
      isValidIpv6Exact(normalized),
  );
}

export function matchesMaintenanceWhitelistEntry(clientIp: string, whitelistEntry: string): boolean {
  const normalizedClientIp = clientIp.trim();
  const normalizedEntry = normalizeMaintenanceWhitelistEntry(whitelistEntry);

  if (!normalizedClientIp || !normalizedEntry) {
    return false;
  }

  if (normalizedClientIp === normalizedEntry) {
    return true;
  }

  if (normalizedEntry.includes("/")) {
    return isIpv4WithinCidr(normalizedClientIp, normalizedEntry);
  }

  return isIpv4MatchingPrefix(normalizedClientIp, normalizedEntry);
}

export function isMaintenanceIpWhitelisted(
  clientIp: string | null | undefined,
  whitelist: string[] | null | undefined,
): boolean {
  if (!clientIp || !whitelist || whitelist.length === 0) {
    return false;
  }

  return whitelist.some((entry) => matchesMaintenanceWhitelistEntry(clientIp, entry));
}
