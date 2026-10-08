/**
 * Spam-bot protection for the email address.
 *
 * The address is stored encoded in src/config/site.ts (reversed, then base64), so it never appears
 * in plain text in the HTML or the JavaScript bundle. Links start with the EMAIL_LINK placeholder
 * and only get their real mailto: href when a person interacts with them (pointer, touch, focus),
 * which is always before the click that follows.
 */
import { site } from '@/config/site'

/** Placeholder href for email links until they are armed. */
export const EMAIL_LINK = '#email'

export const hasEmail = site.emailEncoded.trim().length > 0

let decoded: string | null = null

/** The plain address, decoded on demand ('' when none is set or it cannot be decoded). */
export function revealEmail(): string {
  if (decoded !== null) return decoded
  try {
    const bytes = Uint8Array.from(atob(site.emailEncoded.trim()), (c) => c.charCodeAt(0))
    decoded = [...new TextDecoder().decode(bytes)].reverse().join('')
  } catch {
    decoded = ''
  }
  return decoded
}

/** Event handler: swaps the placeholder href for the real mailto: link. */
export function armMailto(event: Event): void {
  const link = event.currentTarget as HTMLAnchorElement | null
  const address = revealEmail()
  if (link && address && !link.href.startsWith('mailto:')) link.href = `mailto:${address}`
}

/** True for hrefs that must be armed before use. */
export function isEmailPlaceholder(href: string | undefined): boolean {
  return href === EMAIL_LINK
}
