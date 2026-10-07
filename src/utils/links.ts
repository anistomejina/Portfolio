import type { SocialLink } from '@/types/content'

/** True for absolute web URLs, which open in a new tab. */
export function isExternalUrl(href: string | undefined | null): boolean {
  return typeof href === 'string' && /^https?:\/\//i.test(href.trim())
}

/** True when a URL field is filled in. Empty or whitespace-only URLs mean "hide this link". */
export function hasHref(href: string | undefined | null): href is string {
  return typeof href === 'string' && href.trim().length > 0
}

/** The social links that should actually be rendered (empty hrefs are hidden). */
export function visibleLinks<T extends Pick<SocialLink, 'href'>>(links: readonly T[]): T[] {
  return links.filter((link) => hasHref(link.href))
}
