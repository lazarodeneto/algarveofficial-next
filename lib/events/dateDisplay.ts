import { format, parseISO } from 'date-fns';

type EventDateDisplayInput = {
  start_date: string;
  end_date: string;
  event_data?: Record<string, unknown> | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getCategoryData(event: EventDateDisplayInput): Record<string, unknown> {
  const eventData = isRecord(event.event_data) ? event.event_data : {};
  const categoryData = eventData.category_data;
  return isRecord(categoryData) ? categoryData : {};
}

export function getPendingExactDateLabel(event: EventDateDisplayInput): string | null {
  const eventData = isRecord(event.event_data) ? event.event_data : {};
  const categoryData = getCategoryData(event);
  const categoryStartDate = categoryData.start_date;
  const categoryEndDate = categoryData.end_date;
  const topLevelStartDate = eventData.start_date;
  const topLevelEndDate = eventData.end_date;
  const status =
    categoryData.event_status ??
    eventData.event_status ??
    eventData.date_status;

  const exactDatesPending =
    categoryStartDate === null ||
    categoryEndDate === null ||
    topLevelStartDate === null ||
    topLevelEndDate === null;

  if (exactDatesPending && typeof status === 'string' && status.trim()) {
    return status;
  }

  return null;
}

export function getEventDateBadgeParts(event: EventDateDisplayInput) {
  if (getPendingExactDateLabel(event)) {
    return {
      primary: 'TBA',
      secondary: event.start_date.slice(0, 4) || 'Soon',
    };
  }

  const startDate = parseISO(event.start_date);
  const endDate = parseISO(event.end_date);
  const isSingleDay = event.start_date === event.end_date;

  return {
    primary: isSingleDay
      ? format(startDate, 'd')
      : `${format(startDate, 'd')} - ${format(endDate, 'd')}`,
    secondary: format(startDate, 'MMM'),
  };
}

export function getEventCompactDateRangeLabel(event: EventDateDisplayInput): string {
  const pendingLabel = getPendingExactDateLabel(event);
  if (pendingLabel) return pendingLabel;

  const startDate = parseISO(event.start_date);
  const endDate = parseISO(event.end_date);

  return event.start_date === event.end_date
    ? format(startDate, 'MMM d')
    : `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
}

export function getEventDetailDateRangeLabel(event: EventDateDisplayInput): string {
  const pendingLabel = getPendingExactDateLabel(event);
  if (pendingLabel) return pendingLabel;

  const startDate = parseISO(event.start_date);
  const endDate = parseISO(event.end_date);

  return event.start_date === event.end_date
    ? format(startDate, 'EEEE, MMMM d, yyyy')
    : `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
}
