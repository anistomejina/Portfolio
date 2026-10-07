import { defaultLocale, type Locale } from '@/i18n/messages'

/**
 * Markdown bodies, bundled at build time as raw strings.
 *   src/content/projects/<slug>/<locale>.md
 *   src/content/posts/<slug>/<locale>.md
 */
const projectFiles = import.meta.glob<string>('../content/projects/*/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const postFiles = import.meta.glob<string>('../content/posts/*/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

export type MarkdownSource = {
  /** Raw markdown text. */
  source: string
  /** The locale the text is actually written in (differs from the request when a fallback was used). */
  locale: Locale
}

const FALLBACK_ORDER: readonly Locale[] = [defaultLocale, 'en', 'pt']

function lookup(
  files: Record<string, string>,
  kind: 'projects' | 'posts',
  slug: string,
  locale: Locale,
): MarkdownSource | null {
  if (!slug) return null

  for (const candidate of [locale, ...FALLBACK_ORDER]) {
    const source = files[`../content/${kind}/${slug}/${candidate}.md`]
    if (typeof source === 'string' && source.trim()) return { source, locale: candidate }
  }
  return null
}

/** Markdown body of a project: requested locale, then English, then Portuguese; null when none. */
export function getProjectMarkdown(slug: string, locale: Locale): MarkdownSource | null {
  return lookup(projectFiles, 'projects', slug, locale)
}

/** Markdown body of a blog post: requested locale, then English, then Portuguese; null when none. */
export function getPostMarkdown(slug: string, locale: Locale): MarkdownSource | null {
  return lookup(postFiles, 'posts', slug, locale)
}
