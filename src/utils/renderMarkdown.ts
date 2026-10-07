import MarkdownIt from 'markdown-it'
import type { MarkdownIt as MarkdownParser, RendererRule, Token } from 'markdown-it'

import { defaultLocale, type Locale } from '@/i18n/messages'
import type { MarkdownHeading, RenderedMarkdown } from '@/types/content'
import { asset } from '@/utils/assets'

/**
 * Markdown -> HTML for project case studies and blog posts.
 *
 * - Raw HTML in markdown is escaped (html: false), so the output is safe for v-html.
 * - Bare URLs become links (linkify) and quotes/dashes/ellipses are prettified (typographer).
 *   Straight quotes become the typographic quotes of the body's language: “English”, „Deutsch“.
 * - http(s) links open in a new tab with rel="noopener noreferrer".
 * - Site-relative links and images ("/images/x.svg") are prefixed with the deploy base.
 * - Images get loading="lazy" and decoding="async".
 * - Tables are wrapped in <div class="md-table"> so they can scroll horizontally on phones.
 * - A leading "# Title" is dropped: the page already renders the title as its <h1>.
 * - Every <h2> gets a slug id and is collected into `headings` (feeds the PreviewRail).
 */
const MARKDOWN_OPTIONS = { html: false, linkify: true, typographer: true } as const

/** Typographer quote pairs per language: double open/close, then single open/close. */
const QUOTES: Record<Locale, string> = {
  en: '“”‘’',
  de: '„“‚‘',
}

/** Renderer (all output rules below are registered on it) and parser for English bodies. */
const md = new MarkdownIt({ ...MARKDOWN_OPTIONS, quotes: QUOTES.en })

/**
 * Smart quotes are applied while parsing, so each language gets its own parser; rendering always
 * goes through `md`, which carries the custom rules. Parsers are created on first use.
 */
const parsers = new Map<Locale, MarkdownParser>([['en', md]])

function parserFor(locale: Locale): MarkdownParser {
  let parser = parsers.get(locale)
  if (!parser) {
    parser = new MarkdownIt({ ...MARKDOWN_OPTIONS, quotes: QUOTES[locale] })
    parsers.set(locale, parser)
  }
  return parser
}

const EXTERNAL_URL = /^https?:\/\//i
const SITE_RELATIVE = /^\/(?!\/)/

const renderDefault: RendererRule = (tokens, idx, options, _env, self) =>
  self.renderToken(tokens, idx, options)

const defaultLinkOpen = md.renderer.rules.link_open ?? renderDefault
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const href = String(token.attrGet('href') ?? '')

  if (EXTERNAL_URL.test(href)) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  } else if (SITE_RELATIVE.test(href)) {
    token.attrSet('href', asset(href))
  }

  return defaultLinkOpen(tokens, idx, options, env, self)
}

const defaultImage = md.renderer.rules.image ?? renderDefault
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const src = String(token.attrGet('src') ?? '')

  if (SITE_RELATIVE.test(src)) token.attrSet('src', asset(src))
  token.attrSet('loading', 'lazy')
  token.attrSet('decoding', 'async')

  return defaultImage(tokens, idx, options, env, self)
}

const defaultTableOpen = md.renderer.rules.table_open ?? renderDefault
md.renderer.rules.table_open = (tokens, idx, options, env, self) =>
  `<div class="md-table">${defaultTableOpen(tokens, idx, options, env, self)}`

const defaultTableClose = md.renderer.rules.table_close ?? renderDefault
md.renderer.rules.table_close = (tokens, idx, options, env, self) =>
  `${defaultTableClose(tokens, idx, options, env, self)}</div>`

/**
 * Outline plain text, taken from an inline token's raw markdown source (not its rendered children):
 * image syntax -> alt text, link syntax -> link text, then every backtick, *, _ and ~ is deleted
 * (underscores inside words included) and whitespace is collapsed. Because typographer replacements
 * only rewrite the children, labels and descriptions keep the author's straight quotes, "--", "..."
 * and "(c)" as typed, and the ids derived from them stay stable.
 */
const OUTLINE_CLEANUP: ReadonlyArray<readonly [RegExp, string]> = [
  [/!\[([^\]]*)\]\([^)]+\)/g, '$1'],
  [/\[([^\]]+)\]\([^)]+\)/g, '$1'],
  [/[`*_~]/g, ''],
  [/\s+/g, ' '],
]

function inlineSourceText(token: Token | undefined): string {
  return OUTLINE_CLEANUP.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    token?.content ?? '',
  ).trim()
}

/**
 * Heading text -> ASCII id: "Überblick & Straßen-Setup!" -> "uberblick-strassen-setup"
 * ('' when nothing is left). Accents and umlaut dots are dropped (é -> e, ü -> u), ß / ẞ become
 * "ss", and every other run of non-alphanumerics becomes one "-". Ids are plain ASCII, so hash
 * links (#uberblick) need no percent-encoding.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Plain text of the first paragraph after tokens[start], stopping at the next heading. */
function firstParagraphAfter(tokens: Token[], start: number): string {
  for (let i = start; i < tokens.length; i += 1) {
    const token = tokens[i]
    if (token.type === 'heading_open') return ''
    if (token.type === 'paragraph_open') return inlineSourceText(tokens[i + 1])
  }
  return ''
}

function dropLeadingTitle(tokens: Token[]): Token[] {
  const first = tokens[0]
  if (first?.type === 'heading_open' && first.tag === 'h1') {
    const closeIndex = tokens.findIndex((token) => token.type === 'heading_close')
    return tokens.slice(closeIndex + 1)
  }
  return tokens
}

/**
 * Renders markdown to HTML and extracts the h2 outline ({ id, label, description }).
 * `locale` is the language the source is written in (it picks the typographic quotes).
 */
export function renderMarkdownDocument(source: string, locale: Locale = defaultLocale): RenderedMarkdown {
  const env = {}
  const tokens = dropLeadingTitle(parserFor(locale).parse(source ?? '', env))
  const headings: MarkdownHeading[] = []
  const usedIds = new Map<string, number>()

  tokens.forEach((token, index) => {
    if (token.type !== 'heading_open' || token.tag !== 'h2') return

    const label = inlineSourceText(tokens[index + 1])
    const baseId = slugify(label) || 'section'
    const seen = usedIds.get(baseId) ?? 0
    usedIds.set(baseId, seen + 1)
    const id = seen === 0 ? baseId : `${baseId}-${seen + 1}`

    token.attrSet('id', id)
    headings.push({ id, label, description: firstParagraphAfter(tokens, index + 3) })
  })

  return { html: md.renderer.render(tokens, md.options, env), headings }
}

/** Convenience: HTML only. */
export function renderMarkdown(source: string, locale: Locale = defaultLocale): string {
  return renderMarkdownDocument(source, locale).html
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character)
}

/**
 * Every http(s) link gets target="_blank" from the renderer. Raw HTML in the source is escaped,
 * so a literal "<a ...>" can only come from the renderer itself and links never nest.
 */
const NEW_TAB_LINK = /(<a\s[^>]*\btarget="_blank"[^>]*>)([\s\S]*?)(<\/a>)/g

/**
 * Appends a visually hidden note (e.g. "(opens in a new tab)") inside every link of rendered
 * markdown that opens a new tab. Kept separate from rendering so the note can follow the UI
 * language without re-parsing the document. An empty note returns the html unchanged.
 */
export function addNewTabHints(html: string, note: string): string {
  if (!note.trim()) return html
  const hint = `<span class="sr-only"> ${escapeHtml(note)}</span>`
  return html.replace(NEW_TAB_LINK, (_match, open: string, body: string, close: string) => `${open}${body}${hint}${close}`)
}
