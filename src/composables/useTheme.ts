import { nextTick, readonly, ref, watch } from 'vue'

import { prefersReducedMotion } from '@/utils/motion'

export type Theme = 'light' | 'dark'

/** localStorage key. Only an explicit toggle is stored; otherwise the OS preference is followed. */
export const THEME_STORAGE_KEY = 'portfolio-theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'
const REVEAL_DURATION_MS = 700
const REVEAL_EASING = 'cubic-bezier(0.76, 0, 0.24, 1)'

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

function readStoredTheme(): Theme | null {
  if (!isBrowser) return null
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

function writeStoredTheme(value: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, value)
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). The choice then lasts for this visit.
  }
}

function systemTheme(): Theme {
  if (!isBrowser || typeof window.matchMedia !== 'function') return 'light'
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

const storedTheme = readStoredTheme()
let followsSystem = storedTheme === null
let transitionRunning = false

// App-wide singleton state, initialised once when the module is first imported (before mount).
const theme = ref<Theme>(storedTheme ?? systemTheme())

watch(
  theme,
  (value) => {
    if (isBrowser) document.documentElement.dataset.theme = value
  },
  { immediate: true },
)

// Keep following the OS setting until the visitor picks a theme explicitly.
if (isBrowser && typeof window.matchMedia === 'function') {
  window.matchMedia(DARK_QUERY).addEventListener('change', (event) => {
    if (followsSystem) theme.value = event.matches ? 'dark' : 'light'
  })
}

function commit(value: Theme): void {
  followsSystem = false
  theme.value = value
  writeStoredTheme(value)
}

/**
 * Switches to `next`, flooding the new theme in as a circle that grows from the top-right corner
 * of the viewport (View Transitions API). Falls back to an instant swap when the API is missing or
 * reduced motion is preferred. Calls made while a transition is running are ignored.
 */
async function applyThemeWithTransition(next: Theme): Promise<void> {
  if (transitionRunning || next === theme.value) return

  if (!isBrowser || typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
    commit(next)
    return
  }

  const root = document.documentElement
  transitionRunning = true
  root.classList.add('theme-transitioning')

  try {
    const transition = document.startViewTransition(async () => {
      commit(next)
      await nextTick()
    })

    await transition.ready

    const radius = Math.hypot(window.innerWidth, window.innerHeight)
    root.animate(
      { clipPath: ['circle(0px at 100% 0%)', `circle(${radius}px at 100% 0%)`] },
      {
        duration: REVEAL_DURATION_MS,
        easing: REVEAL_EASING,
        fill: 'forwards',
        pseudoElement: '::view-transition-new(root)',
      },
    )

    await transition.finished
  } catch {
    commit(next)
  } finally {
    root.classList.remove('theme-transitioning')
    transitionRunning = false
  }
}

export function useTheme() {
  function toggleTheme(): Promise<void> {
    return applyThemeWithTransition(theme.value === 'dark' ? 'light' : 'dark')
  }

  function setTheme(value: Theme): Promise<void> {
    return applyThemeWithTransition(value)
  }

  return {
    /** Current theme (read-only). */
    theme: readonly(theme),
    /** Animated switch to the opposite theme; persisted. */
    toggleTheme,
    /** Animated switch to a given theme; persisted. */
    setTheme,
  }
}
