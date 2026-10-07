<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'

import LockIcon from '@/components/icons/LockIcon.vue'
import { useLocale } from '@/composables/useLocale'
import type { Project } from '@/types/content'
import { formatShortDate } from '@/utils/formatDate'
import { hasHref, isExternalUrl } from '@/utils/links'
import { prefersReducedMotion } from '@/utils/motion'

const props = withDefaults(
  defineProps<{
    project: Project
    featured?: boolean
  }>(),
  { featured: false },
)

const { copy, locale } = useLocale()
const text = computed(() => copy.value.projects)

/** Decorative "log screen" drawn when a project has no cover image (fixed colours, both themes). */
const FALLBACK_LINES = [
  { top: '38%', width: '46%', opacity: 1 },
  { top: '48%', width: '62%', opacity: 0.7 },
  { top: '58%', width: '32%', opacity: 0.48 },
] as const

const isLocked = computed(() => props.project.locked === true)
const isLinked = computed(() => props.project.hasDetails === true && !isLocked.value)

const statusText = computed(() =>
  props.project.status === 'live' ? text.value.liveLabel : text.value.inProgressLabel,
)

/** "01 / category" (either part may be missing). */
const kickerText = computed(() =>
  [props.project.index, props.project.tag].filter((part) => Boolean(part)).join(' / '),
)

const lockedName = computed(() =>
  isLocked.value ? `${props.project.title}. ${statusText.value}. ${text.value.comingSoon}.` : undefined,
)

const topicList = computed(() => (props.project.topics ?? []).filter((topic) => topic.trim() !== ''))

/** Exactly one body block, in priority order: topics → impact (featured) → result summary → nothing. */
const bodyKind = computed<'topics' | 'impact' | 'summary' | 'none'>(() => {
  const impact = props.project.impact
  if (topicList.value.length) return 'topics'
  if (props.featured && (impact?.problem || impact?.result)) return 'impact'
  if (impact?.result) return 'summary'
  return 'none'
})

const repoHref = computed(() => {
  const url = props.project.repoUrl
  return !isLocked.value && hasHref(url) ? url : ''
})

const showComingSoon = computed(
  () => isLocked.value || (!props.project.hasDetails && !hasHref(props.project.repoUrl)),
)

const dateText = computed(() =>
  props.project.publishedAt ? formatShortDate(props.project.publishedAt, locale.value) : '',
)

function newTabAttrs(href: string) {
  return isExternalUrl(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {}
}

// ---- Locked card: a quick "no" wobble when pressed (pointer, Enter or Space) -------------------

const SHAKE_DURATION_MS = 360
const isShaking = ref(false)
let shakeTimer: number | undefined

function shake(): void {
  if (!isLocked.value || isShaking.value || prefersReducedMotion()) return
  isShaking.value = true
  shakeTimer = window.setTimeout(() => {
    isShaking.value = false
    shakeTimer = undefined
  }, SHAKE_DURATION_MS)
}

// Mouse presses shake at once (like a button's :active). Touch and pen wait for the click, so a
// finger that pans the page across the card (pointercancel, no click) never wobbles it.
let pressPointerType = ''

function onPointerDown(event: PointerEvent): void {
  if (!isLocked.value || event.button !== 0) return
  pressPointerType = event.pointerType
  if (event.pointerType === 'mouse') shake()
}

function onClick(): void {
  if (isLocked.value && pressPointerType !== '' && pressPointerType !== 'mouse') shake()
  pressPointerType = ''
}

function onKeyDown(event: KeyboardEvent): void {
  // Only the locked card itself reacts (keys pressed on links inside linked cards keep their defaults).
  if (!isLocked.value || event.target !== event.currentTarget) return
  if (event.key !== 'Enter' && event.key !== ' ') return
  // Space would otherwise scroll the page.
  event.preventDefault()
  if (!event.repeat) shake()
}

onBeforeUnmount(() => {
  if (shakeTimer !== undefined) window.clearTimeout(shakeTimer)
})
</script>

<template>
  <!-- Locked projects are a focusable button-like card (no navigation); the rest are articles. -->
  <component
    :is="isLocked ? 'div' : 'article'"
    class="archive-card"
    :class="{
      'archive-card--featured': featured,
      'archive-card--locked': isLocked,
      'archive-card--linked': isLinked,
      'archive-card--shaking': isShaking,
    }"
    :role="isLocked ? 'button' : undefined"
    :tabindex="isLocked ? 0 : undefined"
    :aria-label="lockedName"
    @pointerdown="onPointerDown"
    @click="onClick"
    @keydown="onKeyDown"
  >
    <span v-if="isLocked" class="archive-lock" aria-hidden="true">
      <LockIcon :size="14" />
    </span>

    <div class="archive-visual" aria-hidden="true">
      <img
        v-if="project.coverImage"
        class="archive-cover-image"
        :class="{ 'archive-cover-image--zoomed': project.coverZoom }"
        :src="project.coverImage"
        alt=""
        loading="lazy"
        decoding="async"
      />
      <div v-else class="archive-fallback">
        <span
          v-for="(line, lineIndex) in FALLBACK_LINES"
          :key="lineIndex"
          class="archive-fallback__line"
          :style="{ top: line.top, width: line.width, opacity: line.opacity }"
        />
        <span class="archive-fallback__pulse" />
      </div>
    </div>

    <div class="archive-content">
      <div class="archive-kicker">
        <span v-if="featured" class="new-badge">{{ text.newLabel }}</span>
        <span v-if="kickerText">{{ kickerText }}</span>
        <span v-if="kickerText" aria-hidden="true">·</span>
        <span>{{ statusText }}</span>
      </div>

      <h2 class="archive-title">{{ project.title }}</h2>

      <ul v-if="bodyKind === 'topics'" class="archive-topics">
        <li v-for="(topic, topicIndex) in topicList" :key="`${topicIndex}-${topic}`" class="archive-topic">{{ topic }}</li>
      </ul>

      <div v-else-if="bodyKind === 'impact'" class="archive-impact">
        <p v-if="project.impact?.problem">
          <strong>{{ text.problemLabel }}:</strong> {{ project.impact.problem }}
        </p>
        <p v-if="project.impact?.result">
          <strong>{{ text.resultLabel }}:</strong> {{ project.impact.result }}
        </p>
      </div>

      <p v-else-if="bodyKind === 'summary'" class="archive-summary">{{ project.impact?.result }}</p>

      <div class="archive-footer">
        <time v-if="dateText" class="archive-date" :datetime="project.publishedAt">{{ dateText }}</time>

        <div class="archive-actions">
          <a
            v-if="repoHref"
            class="archive-action archive-action--external"
            :href="repoHref"
            v-bind="newTabAttrs(repoHref)"
          >
            {{ text.sourceCode }}
            <span aria-hidden="true">↗</span>
            <span v-if="isExternalUrl(repoHref)" class="sr-only">{{ copy.accessibility.opensInNewTab }}</span>
          </a>

          <!-- Its ::after overlay stretches over the whole card, so the entire surface opens the project. -->
          <RouterLink
            v-if="isLinked"
            class="archive-action archive-action--primary"
            :to="`/projects/${project.slug}`"
            :aria-label="`${text.viewProject}: ${project.title}`"
          >
            {{ text.viewProject }}
            <span aria-hidden="true">→</span>
          </RouterLink>

          <span v-if="showComingSoon" class="archive-action archive-action--disabled" aria-disabled="true">
            {{ text.comingSoon }}
          </span>
        </div>
      </div>
    </div>
  </component>
</template>

<style scoped>
/* ---- Card ------------------------------------------------------------------------------------ */

.archive-card {
  position: relative;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  width: 100%;
  min-width: 0;
  min-height: 170px;
  overflow: hidden;
  color: inherit;
  font: inherit;
  text-align: left;
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 20px;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.archive-card:hover {
  border-color: var(--border-strong);
  box-shadow: 0 18px 44px rgb(20 28 23 / 7%);
  transform: translateY(-2px);
}

.archive-card--linked,
.archive-card--locked {
  cursor: pointer;
}

/* Like the native button it stands in for: repeated presses never highlight the card's text. */
.archive-card--locked {
  -webkit-user-select: none;
  user-select: none;
}

.archive-card--locked:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 4px;
}

/* The animation's transform wins over the hover lift while it runs. */
.archive-card--shaking {
  animation: locked-shake 0.36s ease-in-out;
}

.archive-card--featured {
  grid-template-columns: minmax(250px, 34%) minmax(0, 1fr);
  min-height: 310px;
}

/* ---- Lock badge ------------------------------------------------------------------------------ */

.archive-lock {
  position: absolute;
  z-index: 2;
  top: 18px;
  right: 18px;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  color: var(--signal-text);
  background: var(--surface);
  border: 0.5px solid var(--border-strong);
  border-radius: 8px;
  box-shadow: 0 6px 18px rgb(20 28 23 / 8%);
}

/* ---- Media well ------------------------------------------------------------------------------ */

.archive-visual {
  min-width: 0;
  min-height: 100%;
  overflow: hidden;
  background: #111813;
}

.archive-cover-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Crops in around a point slightly right of centre (for cover art with wide empty margins). */
.archive-cover-image--zoomed {
  object-position: 54% 48%;
  transform: scale(1.36);
  transform-origin: 56% 48%;
}

.archive-fallback {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 170px;
  background-color: #101821;
  background-image:
    linear-gradient(to bottom, rgb(255 255 255 / 3%) 1px, transparent 1px),
    linear-gradient(to right, rgb(255 255 255 / 3%) 1px, transparent 1px);
  background-size: 22px 22px;
}

.archive-fallback__line {
  position: absolute;
  left: 18%;
  height: 2px;
  background: #579ed5;
  border-radius: 999px;
}

.archive-fallback__pulse {
  position: absolute;
  top: calc(48% - 3px);
  right: 19%;
  width: 8px;
  height: 8px;
  background: #d36d5f;
  border-radius: 50%;
  box-shadow: 0 0 0 7px rgb(211 109 95 / 13%);
}

/* ---- Content --------------------------------------------------------------------------------- */

.archive-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  padding: 27px 31px;
}

.archive-card--featured .archive-content {
  padding: 36px 40px;
}

.archive-kicker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 13px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--signal-text);
}

.new-badge {
  padding: 5px 10px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  color: var(--signal-text);
  background: var(--signal-soft);
  border-radius: 999px;
}

.archive-title {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 21px;
  font-weight: 500;
  line-height: 1.3;
  color: var(--ink);
  text-wrap: balance;
}

.archive-card--featured .archive-title {
  font-size: clamp(25px, 3vw, 34px);
}

.archive-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 720px;
  margin: 16px 0 24px;
  list-style: none;
}

.archive-topic {
  padding: 6px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.2;
  color: var(--text-secondary);
  background: var(--surface);
  border: 0.5px solid var(--border-strong);
  border-radius: 999px;
}

.archive-impact,
.archive-summary {
  max-width: 720px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
}

.archive-impact {
  display: grid;
  gap: 6px;
  margin: 18px 0 24px;
}

.archive-impact strong {
  font-weight: 600;
  color: var(--text-secondary);
}

.archive-summary {
  margin: 10px 0 20px;
}

/* ---- Footer: date left, actions right, pinned to the bottom ---------------------------------- */

.archive-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px 24px;
  width: 100%;
  margin-top: auto;
}

.archive-date {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
}

.archive-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.archive-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 7px 12px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-secondary);
  text-decoration: none;
  background: var(--canvas);
  border: 0.5px solid var(--border-strong);
  border-radius: 8px;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.archive-action:not(.archive-action--disabled):hover {
  color: var(--signal-text);
  border-color: var(--signal);
}

.archive-action:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 3px;
}

.archive-action--primary {
  font-weight: 700;
  color: var(--signal-text);
  background: var(--signal-soft);
  border-color: var(--signal);
}

/* Stretched link: the link itself is static, so the overlay resolves to the (relative) card. */
.archive-action--primary::after {
  content: '';
  position: absolute;
  inset: 0;
}

/* Sits above the stretched overlay so it stays independently clickable. */
.archive-action--external {
  position: relative;
  z-index: 1;
}

.archive-action--disabled {
  opacity: 0.55;
}

/* ---- Responsive ------------------------------------------------------------------------------ */

@media (max-width: 760px) {
  .archive-card,
  .archive-card--featured {
    grid-template-columns: minmax(0, 1fr);
  }

  .archive-visual {
    min-height: 0;
    aspect-ratio: 16 / 7;
  }

  .archive-card--featured .archive-visual {
    aspect-ratio: 16 / 9;
  }

  .archive-content,
  .archive-card--featured .archive-content {
    padding: 25px 23px;
  }

  .archive-title,
  .archive-card--featured .archive-title {
    font-size: clamp(20px, 6vw, 27px);
    text-wrap: pretty;
  }

  .archive-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .archive-card,
  .archive-action {
    transition: none;
  }

  .archive-card--shaking {
    animation: none;
  }
}
</style>
