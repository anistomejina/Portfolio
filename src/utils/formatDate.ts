import { localeCodes, type Locale } from '@/i18n/messages'

/**
 * Short date style per language, kept to each language's own conventions:
 *   en -> "Jun 07, 2026"
 *   de -> "7. Juni 2026", "15. Jan. 2026" (no leading zero; the abbreviation dot is part of the
 *         month name and the dot after the day is the German ordinal marker, so both stay)
 */
const DATE_OPTIONS: Record<Locale, Intl.DateTimeFormatOptions> = {
  en: { day: '2-digit', month: 'short', year: 'numeric' },
  de: { day: 'numeric', month: 'short', year: 'numeric' },
}

const dateFormatters = new Map<Locale, Intl.DateTimeFormat>()
const minuteFormatters = new Map<Locale, Intl.NumberFormat>()

function dateFormatterFor(locale: Locale): Intl.DateTimeFormat {
  let formatter = dateFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(localeCodes[locale], DATE_OPTIONS[locale])
    dateFormatters.set(locale, formatter)
  }
  return formatter
}

function minuteFormatterFor(locale: Locale): Intl.NumberFormat {
  let formatter = minuteFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(localeCodes[locale], {
      style: 'unit',
      unit: 'minute',
      unitDisplay: 'short',
    })
    minuteFormatters.set(locale, formatter)
  }
  return formatter
}

/**
 * Formats an ISO calendar date ("YYYY-MM-DD") as a short, localised date (see DATE_OPTIONS).
 *
 * The date is built from its parts in local time (never parsed as UTC), so the day does not
 * shift in time zones west of Greenwich. Unparseable input is returned unchanged.
 */
export function formatShortDate(isoDate: string, locale: Locale): string {
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  if (!year || !month || !day) return isoDate

  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return isoDate

  return dateFormatterFor(locale).format(date)
}

/**
 * Formats a reading time with the language's short minute unit:
 *   en -> "5 min"      de -> "5 Min."
 */
export function formatReadingTime(minutes: number, locale: Locale): string {
  return minuteFormatterFor(locale).format(minutes)
}
