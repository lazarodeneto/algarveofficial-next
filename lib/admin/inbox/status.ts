import type { InboxStatus } from "./types";

const ARCHIVE_REASONS = new Set(["archived", "archived_from_list"]);
const READ_STATE_REASONS = new Set(["read_from_list"]);

export function isInboxReadStateReason(reason: string | null): boolean {
  return reason != null && READ_STATE_REASONS.has(reason);
}

export function normalizeInboxStatusFromReason(reason: string | null): InboxStatus {
  if (isInboxReadStateReason(reason)) return "open";
  if (reason != null && ARCHIVE_REASONS.has(reason)) return "archived";
  return "dismissed";
}

export function isInboxStatus(value: unknown): value is InboxStatus {
  return (
    value === "open" ||
    value === "archived" ||
    value === "resolved" ||
    value === "dismissed"
  );
}

export function isRestorableInboxStatus(status: InboxStatus): boolean {
  return status === "archived" || status === "dismissed";
}
