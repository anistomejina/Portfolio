<script setup lang="ts">
/**
 * A faint tail of monospace "0" / "1" glyphs left behind the mouse pointer on the home page.
 *
 * - Only for real mice / trackpads, and never under reduced motion (both media queries are watched
 *   live: the layer is built or torn down as they flip).
 * - Painted on a fixed, full-viewport layer at z-index -1. #app isolates stacking, so the glyphs sit
 *   above the page background but under every piece of content (cards and the nav pill hide them).
 * - Drawn with tsParticles (lazy-loaded the first time the trail is needed). The whole instance is
 *   rebuilt when the theme changes so it picks up the new glyph colour and peak opacity.
 */
import type { Container, ISourceOptions } from '@tsparticles/engine'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useTheme, type Theme } from '@/composables/useTheme'
import { REDUCED_MOTION_QUERY } from '@/utils/motion'
import { loadParticlesEngine } from '@/utils/particles'

const LAYER_ID = 'binary-cursor-trail'
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)'

/** At most one glyph every 65ms (about 15 per second). */
const SPAWN_INTERVAL_MS = 65
/** Glyphs appear just below and to the right of the arrow cursor's tip, like a tail. */
const TAIL_OFFSET = { x: 11, y: 17 } as const

/** Glyphs start this opaque and fade linearly; dark mode is gentler. */
const PEAK_OPACITY: Record<Theme, number> = { light: 0.86, dark: 0.62 }
/** A glyph is removed once it has faded down to this opacity. */
const FLOOR_OPACITY = 0.1
const FALLBACK_GLYPH_COLOR = '#777a74'

const { theme } = useTheme()

const enabled = ref(false)
const layer = ref<HTMLDivElement | null>(null)

let instance: Container | null = null
/** Bumped by every build and teardown, so a slow async load can tell it has been superseded. */
let generation = 0
let lastSpawnAt = Number.NEGATIVE_INFINITY

function glyphColor(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim()
  return value || FALLBACK_GLYPH_COLOR
}

function trailOptions(color: string, peakOpacity: number): ISourceOptions {
  return {
    fullScreen: false,
    detectRetina: true,
    fpsLimit: 45,
    pauseOnBlur: true,
    pauseOnOutsideViewport: false,
    resize: { enable: true, delay: 0.3 },
    particles: {
      // Nothing spawns on its own: every glyph comes from pointer movement.
      number: { value: 0 },
      shape: {
        type: 'text',
        options: {
          text: { value: ['0', '1'], font: 'JetBrains Mono', weight: '500', style: '' },
        },
      },
      // Radius 4–6, drawn at twice that: 8–12px glyphs.
      size: { value: { min: 4, max: 6 } },
      paint: {
        fill: { enable: true, color: { value: color }, opacity: 0.95 },
      },
      opacity: {
        value: { min: FLOOR_OPACITY, max: peakOpacity },
        animation: {
          enable: true,
          mode: 'decrease',
          startValue: 'max',
          destroy: 'min',
          // Same linear fade for every glyph: about 0.33 opacity per second.
          speed: 0.55,
          sync: true,
        },
      },
      // A slow, steady drift in a random direction; glyphs leaving the viewport are dropped.
      move: {
        enable: true,
        direction: 'none',
        straight: false,
        speed: { min: 0.08, max: 0.24 },
        outModes: { default: 'destroy' },
      },
    },
  }
}

function disposeInstance(): void {
  instance?.destroy()
  instance = null
}

function teardown(): void {
  generation += 1
  disposeInstance()
  lastSpawnAt = Number.NEGATIVE_INFINITY
}

async function build(): Promise<void> {
  const ticket = ++generation
  disposeInstance()

  try {
    const engine = await loadParticlesEngine()
    const host = layer.value
    if (ticket !== generation || !enabled.value || !host?.isConnected) return

    const created = await engine.load({
      element: host,
      options: trailOptions(glyphColor(), PEAK_OPACITY[theme.value]),
    })

    // Disabled, unmounted or rebuilt while the instance was starting: drop it.
    if (ticket !== generation) {
      created?.destroy()
      return
    }
    instance = created ?? null
  } catch {
    // Purely decorative: if the engine cannot load, the page simply has no trail.
  }
}

function spawnGlyph(event: PointerEvent): void {
  if (event.pointerType === 'touch') return

  const live = instance
  if (!live || live.destroyed) return

  const now = performance.now()
  if (now - lastSpawnAt < SPAWN_INTERVAL_MS) return

  const canvas = live.canvas.domElement
  if (!canvas) return

  // Pointer coordinates are CSS px; the particle system works in backing-store px.
  const bounds = canvas.getBoundingClientRect()
  const ratio = live.retina.pixelRatio
  live.particles.push(1, {
    x: (event.clientX - bounds.left + TAIL_OFFSET.x) * ratio,
    y: (event.clientY - bounds.top + TAIL_OFFSET.y) * ratio,
  })
  lastSpawnAt = now
}

// Post flush: when switching on, the layer element must already be in the DOM.
watch(
  enabled,
  (on) => {
    if (on) void build()
    else teardown()
  },
  { flush: 'post' },
)

// New colour and peak opacity: rebuild (glyphs in flight disappear at that moment).
watch(
  theme,
  () => {
    if (enabled.value) void build()
  },
  { flush: 'post' },
)

let finePointer: MediaQueryList | null = null
let reducedMotion: MediaQueryList | null = null

function syncEnabled(): void {
  enabled.value = Boolean(finePointer?.matches) && !reducedMotion?.matches
}

onMounted(() => {
  if (typeof window.matchMedia !== 'function') return

  finePointer = window.matchMedia(FINE_POINTER_QUERY)
  reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY)
  finePointer.addEventListener('change', syncEnabled)
  reducedMotion.addEventListener('change', syncEnabled)
  window.addEventListener('pointermove', spawnGlyph, { passive: true })
  syncEnabled()
})

onBeforeUnmount(() => {
  finePointer?.removeEventListener('change', syncEnabled)
  reducedMotion?.removeEventListener('change', syncEnabled)
  finePointer = null
  reducedMotion = null
  window.removeEventListener('pointermove', spawnGlyph)
  teardown()
})
</script>

<template>
  <div v-if="enabled" :id="LAYER_ID" ref="layer" class="binary-cursor-trail" aria-hidden="true" />
</template>

<style scoped>
.binary-cursor-trail {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

/* The canvas is created by the particle engine inside the layer. */
.binary-cursor-trail :deep(canvas) {
  display: block;
  pointer-events: none;
}
</style>
