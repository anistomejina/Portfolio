/**
 * Content data model.
 *
 * Every list below lives inside the per-locale message tree (src/i18n/messages.ts).
 * Long-form bodies (project case studies and blog posts) live as markdown files under
 * src/content/<kind>/<slug>/<locale>.md.
 *
 * Conventions:
 * - Slugs must be identical in every locale, so switching language on a detail page keeps working.
 * - Dates are ISO calendar dates: "YYYY-MM-DD".
 * - URLs stored in content are final: images/files from public/ are already passed through
 *   `asset()` (src/utils/assets.ts), so components can bind them straight to src/href.
 * - An empty string ('') for a link/href means "not set": the UI hides that link.
 */

/** A small number + caption shown in the hero stats strip. */
export type ProfileStat = {
  value: string
  label: string
}

export type SocialBrand = 'github' | 'linkedin' | 'email'

/** A button in the hero link row. Hidden when `href` is empty. */
export type SocialLink = {
  label: string
  /** Final URL ('' hides the link). mailto: links are allowed. */
  href: string
  /** Text glyph shown before the label when there is no brand icon (the resume uses '↓'). */
  glyph?: string
  /** Picks a brand icon (GitHub / LinkedIn / email). Takes priority over `glyph`. */
  brand?: SocialBrand
  /** Rendered as the filled ink pill. */
  primary?: boolean
  /** When set, the link downloads the file with this suggested name (no new tab). */
  download?: string
}

export type PostCategory =
  | 'writeup'
  | 'learning'
  | 'tutorial'
  | 'notes'
  | 'ctf'
  | 'web-security'
  | 'privacy'

export type Post = {
  slug: string
  title: string
  excerpt: string
  /** Shown raw (CSS uppercases it). Not translated. */
  category: PostCategory
  publishedAt?: string
  readingTimeMinutes?: number
  /** Adds the "featured write-up" pill (unless locked). */
  featured?: boolean
  /** A detail page exists: needs src/content/posts/<slug>/<locale>.md */
  hasDetails?: boolean
  /** "In progress": the card is a non-navigating button with a padlock that shakes when pressed. */
  locked?: boolean
  /** A dashed "coming soon" slot. */
  placeholder?: boolean
}

export type ExperienceEntry = {
  slug: string
  /** Free text, e.g. "Jan 2025 — present · 9 months". */
  period: string
  company: string
  location?: string
  role: string
  description: string
  skills: string[]
}

/** One row of the "technologies & tools" grid. `label` is written as "~/Category". */
export type ToolboxColumn = {
  label: string
  items: string[]
}

export type ProjectStatus = 'live' | 'in-progress'

export type ProjectImpact = {
  problem: string
  result: string
}

export type Project = {
  slug: string
  /** Zero-padded display number ("01", "02"...). The archive sorts by it with a string compare. */
  index: string
  /** Short category label, upper-cased for display. */
  tag: string
  title: string
  impact?: ProjectImpact
  /** When present, topic pills are shown instead of the impact text. */
  topics?: string[]
  publishedAt?: string
  repoUrl?: string
  demoUrl?: string
  status: ProjectStatus
  coverImage?: string
  /** Used by the detail page only (the card cover is decorative). */
  coverAlt?: string
  /** Crops into the cover image on cards. */
  coverZoom?: boolean
  detailImage?: string
  detailImageAlt?: string
  /** A detail page exists: needs src/content/projects/<slug>/<locale>.md */
  hasDetails?: boolean
  locked?: boolean
}

/** One entry of a rendered markdown document's outline (one per h2). Feeds the PreviewRail. */
export type MarkdownHeading = {
  /** The id written onto the rendered <h2>. */
  id: string
  /** Plain-text heading label. */
  label: string
  /** Plain text of the first paragraph after the heading ('' when none). */
  description: string
}

export type RenderedMarkdown = {
  html: string
  headings: MarkdownHeading[]
}
