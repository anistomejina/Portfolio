<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { MarkdownHeading } from '@/types/content'
import { prefersReducedMotion } from '@/utils/motion'

const props = defineProps<{
  items: MarkdownHeading[]
  /** Accessible name of the nav, e.g. "<title>: <section title>". */
  label: string
}>()

// ---- Selection (hover beats keyboard focus) ----------------------------------------------------

const hoveredId = ref<string | null>(null)
const focusedId = ref<string | null>(null)

/** Section currently being read, and the reading position as a fractional section index (2.4 = 40% into §3→§4). */
const currentId = ref<string | null>(null)
const readingIndex = ref(0)

const selectedId = computed(() => hoveredId.value ?? focusedId.value)
const selectedIndex = computed(() =>
  selectedId.value === null ? -1 : props.items.findIndex((item) => item.id === selectedId.value),
)
const selectedItem = computed(() => (selectedIndex.value >= 0 ? props.items[selectedIndex.value] : undefined))

/** Where the magnifier bulge is centred: the selected tick, otherwise the live reading position. */
const focusPoint = computed(() => (selectedIndex.value >= 0 ? selectedIndex.value : readingIndex.value))

/**
 * Dock-style magnification: piecewise-linear falloff with the distance (in ticks) from the focus point.
 * distance 0 → 1, 1 → 0.68, 2 → 0.44, 3 and beyond → 0.25.
 */
const FALLOFF: ReadonlyArray<readonly [start: number, base: number, slope: number]> = [
  [0, 1, 0.32],
  [1, 0.68, 0.24],
  [2, 0.44, 0.19],
]
const MIN_SCALE = 0.25

function magnification(index: number): number {
  const distance = Math.abs(focusPoint.value - index)
  for (const [start, base, slope] of FALLOFF) {
    if (distance <= start + 1) return base - slope * (distance - start)
  }
  return MIN_SCALE
}

/** Leaving one tick must not clear a selection another tick has already taken over. */
function endHover(id: string): void {
  if (hoveredId.value === id) hoveredId.value = null
}

function endFocus(id: string): void {
  if (focusedId.value === id) focusedId.value = null
}

function previewNumber(index: number): string {
  return String(index + 1).padStart(2, '0')
}

// ---- Scroll tracking ---------------------------------------------------------------------------

const BOTTOM_TOLERANCE = 2

/** The line (from the viewport top) a heading must cross to become the current section. */
function activationLine(): number {
  return Math.min(300, Math.max(140, window.innerHeight * 0.36))
}

function measure(): void {
  const headings: { id: string; top: number }[] = []
  for (const item of props.items) {
    const element = document.getElementById(item.id)
    if (element) headings.push({ id: item.id, top: element.getBoundingClientRect().top + window.scrollY })
  }

  if (headings.length === 0) {
    currentId.value = null
    return
  }

  const lastIndex = headings.length - 1
  const viewportBottom = window.scrollY + window.innerHeight

  // At the very bottom the last section wins, so short final sections can still become current.
  if (viewportBottom >= document.documentElement.scrollHeight - BOTTOM_TOLERANCE) {
    currentId.value = headings[lastIndex].id
    readingIndex.value = lastIndex
    return
  }

  const reading = window.scrollY + activationLine()

  // The first section is current even above its heading.
  let current = 0
  while (current < lastIndex && headings[current + 1].top <= reading) current += 1

  currentId.value = headings[current].id

  const here = headings[current].top
  const next = headings[current + 1]?.top
  readingIndex.value =
    next === undefined || reading <= here ? current : current + Math.min(1, (reading - here) / (next - here))
}

let pendingFrame: number | null = null

/** Coalesces bursts of scroll/resize events into one measurement per animation frame. */
function requestMeasure(): void {
  if (pendingFrame !== null) return
  pendingFrame = window.requestAnimationFrame(() => {
    pendingFrame = null
    measure()
  })
}

let bodyObserver: ResizeObserver | null = null

onMounted(() => {
  measure()
  window.addEventListener('scroll', requestMeasure, { passive: true })
  window.addEventListener('resize', requestMeasure)

  // Late-loading images and fonts move the headings without any scroll/resize event.
  if (typeof ResizeObserver !== 'undefined') {
    bodyObserver = new ResizeObserver(requestMeasure)
    bodyObserver.observe(document.body)
  }
})

// New outline (other document or language): measure once the new article is in the DOM.
watch(() => props.items, measure, { flush: 'post' })

onBeforeUnmount(() => {
  window.removeEventListener('scroll', requestMeasure)
  window.removeEventListener('resize', requestMeasure)
  bodyObserver?.disconnect()
  bodyObserver = null
  if (pendingFrame !== null) window.cancelAnimationFrame(pendingFrame)
  pendingFrame = null
})

// ---- Click: glide to the section without a router navigation ----------------------------------

function jumpTo(event: MouseEvent, id: string): void {
  const target = document.getElementById(id)
  if (!target) return // let the browser follow the plain #anchor

  event.preventDefault()
  target.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })

  // Update the hash in place: no history entry, and the router's own state object is kept.
  try {
    window.history.replaceState(window.history.state, '', `#${encodeURIComponent(id)}`)
  } catch {
    // Some sandboxed contexts refuse history updates; scrolling already happened.
  }

  currentId.value = id
}
</script>

<template>
  <nav
    v-if="items.length"
    class="preview-rail"
    :class="{ 'preview-rail--interacting': selectedId !== null }"
    :aria-label="label"
  >
    <ol class="preview-rail__list">
      <li v-for="(item, index) in items" :key="item.id">
        <a
          class="preview-rail__link"
          :href="`#${item.id}`"
          :aria-label="item.label"
          :aria-current="currentId === item.id ? 'location' : undefined"
          @mouseenter="hoveredId = item.id"
          @mouseleave="endHover(item.id)"
          @focus="focusedId = item.id"
          @blur="endFocus(item.id)"
          @click="jumpTo($event, item.id)"
        >
          <span
            class="preview-rail__tick"
            :class="{
              'preview-rail__tick--current': currentId === item.id,
              'preview-rail__tick--active': selectedId === item.id,
            }"
            :style="{ '--tick-scale': magnification(index) }"
            aria-hidden="true"
          />
        </a>
      </li>
    </ol>

    <!-- Keyed by id: moving between ticks fades the old card out while the new one fades in. -->
    <Transition name="preview-card">
      <div v-if="selectedItem" :key="selectedItem.id" class="preview-rail__card" aria-hidden="true">
        <span class="preview-rail__card-index">{{ previewNumber(selectedIndex) }}</span>
        <strong>{{ selectedItem.label }}</strong>
        <p>{{ selectedItem.description }}</p>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.preview-rail {
  position: fixed;
  z-index: 20;
  top: 50%;
  left: 18px;
  display: flex;
  align-items: center;
  transform: translateY(-50%);
}

.preview-rail__list {
  display: grid;
  gap: 4px;
  width: 34px;
  padding: 10px 0;
  list-style: none;
}

/* Generous 34×12 hit area around a 2px tick. */
.preview-rail__link {
  display: flex;
  align-items: center;
  width: 34px;
  height: 12px;
  color: var(--text-muted);
  text-decoration: none;
}

.preview-rail__link:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 2px;
  border-radius: 4px;
}

.preview-rail__tick {
  display: block;
  width: 28px;
  height: 2px;
  background: currentColor;
  border-radius: 999px;
  opacity: 0.52;
  transform: scaleX(var(--tick-scale, 0.25));
  transform-origin: left center;
  /* Near-instant follow of the scroll position. */
  transition:
    color 0.18s ease,
    opacity 0.18s ease,
    transform 80ms linear;
}

/* Expo-out glide when the bulge jumps to a hovered/focused tick. */
.preview-rail--interacting .preview-rail__tick {
  transition:
    color 0.18s ease,
    opacity 0.18s ease,
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.preview-rail__tick--current {
  color: var(--signal-text);
  opacity: 0.82;
}

/* Declared after --current so a tick that is both selected and current stays fully green. */
.preview-rail__tick--active {
  color: var(--signal);
  opacity: 1;
}

/* ---- Preview card (centred on the whole rail, not on the hovered tick) ----------------------- */

.preview-rail__card {
  position: absolute;
  top: 50%;
  left: 45px;
  width: min(290px, calc(100vw - 82px));
  padding: 15px 17px 16px;
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  border: 0.5px solid var(--border-strong);
  border-radius: 12px;
  box-shadow: 0 16px 45px rgb(20 28 23 / 12%);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  transform: translateY(-50%);
  pointer-events: none;
}

.preview-rail__card-index {
  display: block;
  margin-bottom: 7px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  color: var(--signal-text);
}

.preview-rail__card strong {
  display: block;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--ink);
}

.preview-rail__card p {
  display: -webkit-box;
  margin-top: 7px;
  overflow: hidden;
  font-size: 11px;
  line-height: 1.55;
  color: var(--text-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.preview-card-enter-active,
.preview-card-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.2s ease;
}

.preview-card-enter-from,
.preview-card-leave-to {
  opacity: 0;
  transform: translate(7px, -50%);
}

/* No room in the gutter on narrow screens. */
@media (max-width: 900px) {
  .preview-rail {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-rail__tick,
  .preview-rail--interacting .preview-rail__tick,
  .preview-card-enter-active,
  .preview-card-leave-active {
    transition: none;
  }
}
</style>
