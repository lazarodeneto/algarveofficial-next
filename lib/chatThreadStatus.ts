export const THREAD_STATUS_VALUES = ["active", "closed", "blocked"] as const;

export type ThreadStatus = (typeof THREAD_STATUS_VALUES)[number];

export function normalizeThreadStatus(status: string | null | undefined): ThreadStatus {
  if (status === "blocked") return "blocked";
  if (status === "closed" || status === "archived") return "closed";
  return "active";
}
