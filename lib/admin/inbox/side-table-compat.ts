import type { InboxSource } from "./types";

const INBOX_SOURCES = new Set<InboxSource>([
  "billing_subscription",
  "external_outbox_alert",
  "listing_claim",
  "listing_moderation",
  "review_moderation",
  "event_moderation",
  "chat_message",
  "translation_job",
]);

const ORIGINAL_SIDE_TABLE_SOURCES = new Set<InboxSource>([
  "listing_moderation",
  "review_moderation",
  "event_moderation",
]);

const LEGACY_COMPAT_SOURCE: InboxSource = "listing_moderation";

export function isInboxSource(value: unknown): value is InboxSource {
  return typeof value === "string" && INBOX_SOURCES.has(value as InboxSource);
}

export function getLegacySideTableSource(source: InboxSource): InboxSource | null {
  return ORIGINAL_SIDE_TABLE_SOURCES.has(source) ? null : LEGACY_COMPAT_SOURCE;
}

export function encodeLegacySideTableReason(reason: string, source: InboxSource): string {
  return `${reason}:${source}`;
}

export function decodeSideTableArchiveRow(
  storedSource: string,
  storedReason: string | null,
): { source: string; reason: string | null } {
  if (!storedReason) return { source: storedSource, reason: storedReason };

  const separator = storedReason.lastIndexOf(":");
  if (separator === -1) return { source: storedSource, reason: storedReason };

  const reason = storedReason.slice(0, separator);
  const possibleSource = storedReason.slice(separator + 1);
  if (!isInboxSource(possibleSource)) return { source: storedSource, reason: storedReason };
  if (getLegacySideTableSource(possibleSource) !== storedSource) {
    return { source: storedSource, reason: storedReason };
  }

  return { source: possibleSource, reason };
}

export function inboxSideTableKey(source: string, sourceRowId: string): string {
  return `${source}:${sourceRowId}`;
}

export function inboxSideTableLookupKeys(source: InboxSource, sourceRowId: string): string[] {
  const legacySource = getLegacySideTableSource(source);
  return legacySource
    ? [inboxSideTableKey(source, sourceRowId), inboxSideTableKey(legacySource, sourceRowId)]
    : [inboxSideTableKey(source, sourceRowId)];
}
