const PUBLIC_EVENT_TIME_ZONE = 'Europe/Lisbon';
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getDatePart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((part) => part.type === type)?.value ?? '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function toPublicEventDateKey(value: string | null | undefined): string | null {
  const dateKey = value?.slice(0, 10);
  if (!dateKey || !DATE_ONLY_PATTERN.test(dateKey)) return null;

  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return dateKey;
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

export function hasPublicEventRealDateRange(event: {
  start_date?: string | null;
  end_date?: string | null;
  event_data?: unknown;
}): boolean {
  const startDate = toPublicEventDateKey(event.start_date);
  const endDate = toPublicEventDateKey(event.end_date);
  if (!startDate || !endDate || endDate < startDate) return false;

  const eventData = isRecord(event.event_data) ? event.event_data : {};
  const categoryData = isRecord(eventData.category_data) ? eventData.category_data : {};
  const hasPlaceholderDate = isRecord(eventData.date_placeholder);
  const hasExplicitPendingDate =
    eventData.start_date === null ||
    eventData.end_date === null ||
    categoryData.start_date === null ||
    categoryData.end_date === null;
  const statusText = [
    eventData.event_status,
    eventData.date_status,
    categoryData.event_status,
  ]
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLowerCase();
  const saysDatesPending = statusText.includes('pending') || statusText.includes('a confirmar');

  return !(hasPlaceholderDate || (hasExplicitPendingDate && saysDatesPending));
}

export function isPublicEventVisibleByDate(
  event: { start_date?: string | null; end_date?: string | null; event_data?: unknown },
  now = new Date(),
): boolean {
  const endDate = toPublicEventDateKey(event.end_date);
  return Boolean(hasPublicEventRealDateRange(event) && endDate && endDate >= getPublicEventCutoffDate(now));
}

export function isPublicEventPast(
  event: { start_date?: string | null; end_date?: string | null; event_data?: unknown },
  now = new Date(),
): boolean {
  const endDate = toPublicEventDateKey(event.end_date);
  return Boolean(hasPublicEventRealDateRange(event) && endDate && endDate < getPublicEventCutoffDate(now));
}
