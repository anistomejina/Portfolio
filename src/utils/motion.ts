export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Current reduced-motion preference (false outside the browser). */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(REDUCED_MOTION_QUERY).matches
    : false
}
