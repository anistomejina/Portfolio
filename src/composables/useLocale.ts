import { computed, readonly, ref, watch } from 'vue'

import {
  availableLocales,
  defaultLocale,
  isLocale,
  localeCodes,
  messages,
  type Locale,
} from '@/i18n/messages'

/** localStorage key for an explicit language choice. */
export const LOCALE_STORAGE_KEY = 'portfolio-locale'

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

function readStoredLocale(): Locale | null {
  if (!isBrowser) return null
  try {
    const value = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(value) ? value : null
  } catch {
    return null
  }
}

function writeStoredLocale(value: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, value)
  } catch {
    // Storage unavailable: the choice lasts for this visit only.
  }
}

/** The browser's primary language (first two letters of navigator.language), when supported. */
function detectBrowserLocale(): Locale | null {
  if (!isBrowser) return null
  const candidate = navigator.language?.slice(0, 2).toLowerCase()
  return isLocale(candidate) ? candidate : null
}

// App-wide singleton: saved choice -> browser language -> default (en).
const locale = ref<Locale>(readStoredLocale() ?? detectBrowserLocale() ?? defaultLocale)

watch(
  locale,
  (value) => {
    if (isBrowser) document.documentElement.lang = localeCodes[value]
  },
  { immediate: true },
)

const copy = computed(() => messages[locale.value])
const localeCode = computed(() => localeCodes[locale.value])

export function useLocale() {
  function setLocale(value: Locale): void {
    if (!availableLocales.includes(value)) return
    locale.value = value
    writeStoredLocale(value)
  }

  return {
    /** Current locale (read-only). */
    locale: readonly(locale),
    /** Message tree of the current locale. */
    copy,
    /** BCP 47 code of the current locale ("en-US" / "pt-BR"). */
    localeCode,
    /** Switch language instantly (persisted). */
    setLocale,
  }
}
