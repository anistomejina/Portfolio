import { localeCodes, type Locale } from '@/i18n/messages'

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(code: string): Intl.DateTimeFormat {
  let formatter = formatters.get(code)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(code, { day: '2-digit', month: 'short', year: 'numeric' })
    formatters.set(code, formatter)
  }
  return formatter
}

/**
 * Formats an ISO calendar date ("YYYY-MM-DD") as a short, localised date.
 *   en -> "Jun 07, 2026"      pt -> "07 de jun de 2026"
 *
 * The date is built from its parts in local time (never parsed as UTC), so the day does not
 * shift in time zones west of Greenwich. The first "." is removed because Portuguese short
 * month names carry an abbreviation dot. Unparseable input is returned unchanged.
 */
export function formatShortDate(isoDate: string, locale: Locale): string {
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  if (!year || !month || !day) return isoDate

  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return isoDate

  return formatterFor(localeCodes[locale]).format(date).replace('.', '')
}
