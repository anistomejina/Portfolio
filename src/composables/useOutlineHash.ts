import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useLocale } from '@/composables/useLocale'
import { availableLocales, type Locale } from '@/i18n/messages'
import type { MarkdownHeading } from '@/types/content'
import type { MarkdownSource } from '@/utils/content'
import { renderMarkdownDocument } from '@/utils/renderMarkdown'

type Outline = readonly MarkdownHeading[]

/** The URL hash without "#", decoded ('' when there is none). */
function currentHash(): string {
  const raw = window.location.hash.slice(1)
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/** Id of the section at the same position in `to` as `id` has in `from` (null when unknown). */
function sameSection(from: Outline, to: Outline, id: string): string | null {
  if (from.length !== to.length) return null
  const index = from.findIndex((heading) => heading.id === id)
  return index >= 0 ? to[index].id : null
}

/**
 * Keeps section links (#overview) working across languages on a detail page.
 *
 * Heading ids come from the heading text, so one section is #overview in English and #uberblick in
 * German. Sections are matched by position: both language files need the same "## " headings in
 * the same order (when the counts differ, the hash is left alone).
 *
 * - Language switch: a hash naming a section of the previous outline is replaced in place by the
 *   same section of the new outline (no scroll, no history entry).
 * - Arriving with another language's hash (a shared link): it is replaced by this language's id of
 *   that section, and the router scrolls there as for any section link.
 *
 *   useOutlineHash(() => outline.value, (code) => getPostMarkdown(slug.value, code))
 */
export function useOutlineHash(
  outline: () => Outline,
  markdownFor: (locale: Locale) => MarkdownSource | null,
): void {
  if (typeof window === 'undefined') return
  const router = useRouter()
  const { locale } = useLocale()

  watch([outline, locale], ([next, nextLocale], [previous, previousLocale]) => {
    // Only a language switch maps sections (another page's outline has nothing to do with this one).
    if (nextLocale === previousLocale) return
    const hash = currentHash()
    if (!hash || next.some((heading) => heading.id === hash)) return
    const id = sameSection(previous, next, hash)
    if (!id) return
    try {
      // Same approach as the outline rail: the router's own state object is kept.
      window.history.replaceState(window.history.state, '', `#${encodeURIComponent(id)}`)
    } catch {
      // Some sandboxed contexts refuse history updates; the old hash simply stays.
    }
  })

  onMounted(() => {
    const hash = currentHash()
    const current = outline()
    if (!hash || current.some((heading) => heading.id === hash)) return
    for (const code of availableLocales) {
      if (code === locale.value) continue
      const source = markdownFor(code)
      if (!source) continue
      const id = sameSection(renderMarkdownDocument(source.source, source.locale).headings, current, hash)
      if (id) {
        void router.replace({ hash: `#${id}` })
        return
      }
    }
  })
}
