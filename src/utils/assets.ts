/**
 * Turns a path inside public/ into a URL that works under the deploy base
 * ("/" locally, "/Portfolio/" on GitHub Pages).
 *
 *   asset('images/cover.svg')  -> '/Portfolio/images/cover.svg'
 *   asset('/images/cover.svg') -> '/Portfolio/images/cover.svg'
 *   asset('https://…')         -> unchanged (also mailto:, data:, //host, #hash)
 *   asset('')                  -> ''
 */
const ABSOLUTE_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i

export function asset(path: string): string {
  if (!path) return ''
  if (ABSOLUTE_URL.test(path)) return path

  const base = import.meta.env.BASE_URL || '/'
  if (base !== '/' && path.startsWith(base)) return path

  return `${base.endsWith('/') ? base : `${base}/`}${path.replace(/^\/+/, '')}`
}
