import { format, parseISO } from 'date-fns';
import { da, de, enGB, es, fr, it, nb, nl, pt, sv } from 'date-fns/locale';
import type { Locale as DateFnsLocale } from 'date-fns';

type EventDateDisplayInput = {
  start_date: string;
  end_date: string;
  event_data?: unknown;
};

const dateLocales: Record<string, DateFnsLocale> = {
  da,
  de,
  en: enGB,
  es,
  fr,
  it,
  nl,
  no: nb,
  'pt-pt': pt,
  sv,
};

const pendingDateLabels: Record<string, { primary: string; fallbackYear: string }> = {
  da: { primary: 'AFTALES', fallbackYear: 'Snart' },
  de: { primary: 'N. N.', fallbackYear: 'Bald' },
  en: { primary: 'TBA', fallbackYear: 'Soon' },
  es: { primary: 'Por confirmar', fallbackYear: 'Pronto' },
  fr: { primary: 'À confirmer', fallbackYear: 'Bientôt' },
  it: { primary: 'Da confermare', fallbackYear: 'Presto' },
  nl: { primary: 'Nog te bepalen', fallbackYear: 'Binnenkort' },
  no: { primary: 'Kommer', fallbackYear: 'Snart' },
  'pt-pt': { primary: 'A confirmar', fallbackYear: 'Brevemente' },
  sv: { primary: 'Meddelas', fallbackYear: 'Snart' },
};

const pendingStatusTranslations: Record<string, Record<string, string>> = {
  '2026 return confirmed; exact dates pending': {
    da: 'Tilbagevenden i 2026 bekræftet; præcise datoer afventer',
    de: 'Rückkehr 2026 bestätigt; genaue Termine stehen noch aus',
    en: '2026 return confirmed; exact dates pending',
    es: 'Regreso en 2026 confirmado; fechas exactas pendientes',
    fr: 'Retour en 2026 confirmé ; dates exactes à venir',
    it: 'Ritorno nel 2026 confermato; date esatte in attesa',
    nl: 'Terugkeer in 2026 bevestigd; exacte datums volgen nog',
    no: 'Retur i 2026 bekreftet; eksakte datoer kommer',
    'pt-pt': 'Regresso em 2026 confirmado; datas exatas pendentes',
    sv: 'Återkomst 2026 bekräftad; exakta datum kommer',
  },
};

function getDateLocale(locale?: string | null): DateFnsLocale {
  return dateLocales[locale ?? ''] ?? enGB;
}

function formatBadgeMonth(date: Date, locale?: string | null): string {
  const rawMonth = format(date, 'MMM', { locale: getDateLocale(locale) });
  const cleanedMonth = rawMonth.replace(/[.\s]+/g, '').trim();
  const threeLetterMonth = Array.from(cleanedMonth).slice(0, 3).join('');

  if (!threeLetterMonth) return rawMonth;

  return `${threeLetterMonth.charAt(0).toLocaleUpperCase()}${threeLetterMonth.slice(1)}`;
}

function getLocalizedPendingDateLabel(label: string, locale?: string | null): string {
  return pendingStatusTranslations[label]?.[locale ?? ''] ?? label;
}

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

export function getEventDateBadgeParts(event: EventDateDisplayInput, locale?: string | null) {
  if (getPendingExactDateLabel(event)) {
    const labels = pendingDateLabels[locale ?? ''] ?? pendingDateLabels.en;

    return {
      primary: labels.primary,
      secondary: event.start_date.slice(0, 4) || labels.fallbackYear,
    };
  }

  const startDate = parseISO(event.start_date);
  const endDate = parseISO(event.end_date);
  const isSingleDay = event.start_date === event.end_date;
  const isCrossMonth =
    startDate.getMonth() !== endDate.getMonth() ||
    startDate.getFullYear() !== endDate.getFullYear();

  return {
    primary: isSingleDay
      ? format(startDate, 'd', { locale: getDateLocale(locale) })
      : `${format(startDate, 'd', { locale: getDateLocale(locale) })} - ${format(endDate, 'd', { locale: getDateLocale(locale) })}`,
    secondary: isCrossMonth
      ? `${formatBadgeMonth(startDate, locale)} / ${formatBadgeMonth(endDate, locale)}`
      : formatBadgeMonth(startDate, locale),
  };
}

export function getEventCompactDateRangeLabel(event: EventDateDisplayInput, locale?: string | null): string {
  const pendingLabel = getPendingExactDateLabel(event);
  if (pendingLabel) return getLocalizedPendingDateLabel(pendingLabel, locale);

  const startDate = parseISO(event.start_date);
  const endDate = parseISO(event.end_date);
  const dateLocale = getDateLocale(locale);

  return event.start_date === event.end_date
    ? format(startDate, 'MMM d', { locale: dateLocale })
    : `${format(startDate, 'MMM d', { locale: dateLocale })} - ${format(endDate, 'MMM d, yyyy', { locale: dateLocale })}`;
}

export function getEventDetailDateRangeLabel(event: EventDateDisplayInput, locale?: string | null): string {
  const pendingLabel = getPendingExactDateLabel(event);
  if (pendingLabel) return getLocalizedPendingDateLabel(pendingLabel, locale);

  const startDate = parseISO(event.start_date);
  const endDate = parseISO(event.end_date);
  const dateLocale = getDateLocale(locale);

  return event.start_date === event.end_date
    ? format(startDate, 'PPPP', { locale: dateLocale })
    : `${format(startDate, 'MMM d', { locale: dateLocale })} - ${format(endDate, 'MMM d, yyyy', { locale: dateLocale })}`;
}

export function getEventTimeLabel(time: string | null | undefined, locale?: string | null): string | null {
  if (!time) return null;

  try {
    return new Intl.DateTimeFormat(locale || 'en', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(parseISO(`2000-01-01T${time}`));
  } catch {
    return time.slice(0, 5);
  }
}

export function getEventMonthHeading(monthKey: string, locale?: string | null): string {
  try {
    return format(parseISO(`${monthKey}-01`), 'MMMM yyyy', { locale: getDateLocale(locale) });
  } catch {
    return monthKey;
  }
}
