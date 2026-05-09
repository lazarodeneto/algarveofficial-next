const PUBLIC_EVENT_TIME_ZONE = 'Europe/Lisbon';

function getDatePart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((part) => part.type === type)?.value ?? '';
}

export function getPublicEventCutoffDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: PUBLIC_EVENT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = getDatePart(parts, 'year');
  const month = getDatePart(parts, 'month');
  const day = getDatePart(parts, 'day');

  return `${year}-${month}-${day}`;
}

export function isPublicEventVisibleByDate(
  event: { end_date?: string | null },
  now = new Date(),
): boolean {
  const endDate = event.end_date?.slice(0, 10);
  return Boolean(endDate && endDate >= getPublicEventCutoffDate(now));
}
