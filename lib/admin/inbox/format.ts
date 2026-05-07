const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

function formatDuration(minutes: number): string {
  const absoluteMinutes = Math.max(0, Math.abs(Math.round(minutes)));

  if (absoluteMinutes < MINUTES_PER_HOUR) {
    return `${absoluteMinutes}m`;
  }

  if (absoluteMinutes < 2 * MINUTES_PER_DAY) {
    return `${Math.round(absoluteMinutes / MINUTES_PER_HOUR)}h`;
  }

  return `${Math.round(absoluteMinutes / MINUTES_PER_DAY)}d`;
}

export function formatInboxSlaRelative(minutesRemaining: number): string {
  const duration = formatDuration(minutesRemaining);
  return minutesRemaining <= 0 ? `${duration} overdue` : `${duration} left`;
}

export function formatInboxDueStatus(iso: string, minutesRemaining: number): string {
  const dueLabel = new Date(iso).toLocaleString();
  const relative = formatInboxSlaRelative(minutesRemaining);
  return minutesRemaining <= 0
    ? `Overdue ${relative.replace(" overdue", "")} · since ${dueLabel}`
    : `Due in ${relative.replace(" left", "")} · by ${dueLabel}`;
}
