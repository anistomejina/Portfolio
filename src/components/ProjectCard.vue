<script setup lang="ts">
import { PhArrowUpRight, PhGithubLogo } from '@phosphor-icons/vue'
import { computed, ref, watch } from 'vue'

import LockIcon from '@/components/icons/LockIcon.vue'
import { useLocale } from '@/composables/useLocale'
import type { Project } from '@/types/content'
import { hasHref } from '@/utils/links'

const props = withDefaults(
  defineProps<{
    project: Project
    variant?: 'featured' | 'compact'
  }>(),
  { variant: 'featured' },
)

const { copy } = useLocale()
const labels = computed(() => copy.value.projects)

/** Non-blank text. */
function filled(value: string | undefined | null): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

const isCompact = computed(() => props.variant === 'compact')
const isLocked = computed(() => Boolean(props.project.locked))
/** A detail page exists and can be opened: the whole card becomes a link to it. */
const opensDetail = computed(() => Boolean(props.project.hasDetails) && !isLocked.value)
const detailPath = computed(() => `/projects/${encodeURIComponent(props.project.slug)}`)
const repoUrl = computed(() =>
  !isLocked.value && hasHref(props.project.repoUrl) ? props.project.repoUrl : '',
)
const showComingSoon = computed(
  () => isLocked.value || (!props.project.hasDetails && !repoUrl.value),
)

const statusLabel = computed(() =>
  props.project.status === 'live' ? labels.value.liveLabel : labels.value.inProgressLabel,
)
const detailLinkLabel = computed(() => `${labels.value.viewProject}: ${props.project.title}`)

/** "01 / CATEGORY" (blank parts are left out). */
const tagLine = computed(() =>
  [props.project.index, props.project.tag?.toUpperCase()].filter(filled).join(' / '),
)

const topics = computed(() => (props.project.topics ?? []).filter(filled))
const summary = computed(() => props.project.impact?.result?.trim() ?? '')
const impactLines = computed(() => {
  const impact = props.project.impact
  if (!impact) return []
  return [
    { key: 'problem', label: labels.value.problemLabel, text: impact.problem },
    { key: 'result', label: labels.value.resultLabel, text: impact.result },
  ].filter((line) => filled(line.text))
})

/** A locked card is a real button (it only shakes); every other card is an article. */
const rootTag = computed(() => (isLocked.value ? 'button' : 'article'))
const rootAttrs = computed(() =>
  isLocked.value
    ? {
        type: 'button',
        'aria-label': `${props.project.title}. ${statusLabel.value}. ${labels.value.comingSoon}.`,
      }
    : {},
)

// Broken cover URLs fall back to the drawn placeholder instead of an empty dark box.
const coverFailed = ref(false)
watch(
  () => props.project.coverImage,
  () => {
    coverFailed.value = false
  },
)
const coverSrc = computed(() =>
  !coverFailed.value && hasHref(props.project.coverImage) ? props.project.coverImage : '',
)
</script>

<template>
  <component
    :is="rootTag"
    v-bind="rootAttrs"
    class="project-card"
    :class="[
      `project-card--${variant}`,
      {
        'project-card--locked': isLocked,
        'project-card--linked': opensDetail,
      },
    ]"
  >
    <span v-if="isLocked" class="project-lock" aria-hidden="true">
      <LockIcon :size="13" :stroke-width="1.7" />
    </span>

    <!-- Decorative cover: the detail page carries the descriptive alt text. -->
    <div class="project-cover" aria-hidden="true">
      <img
        v-if="coverSrc"
        class="project-cover-image"
        :class="{ 'project-cover-image--zoomed': project.coverZoom }"
        :src="coverSrc"
        alt=""
        loading="lazy"
        decoding="async"
        @error="coverFailed = true"
      />
      <div v-else class="project-cover-fallback">
        <span class="fallback-bar fallback-bar--first" />
        <span class="fallback-bar fallback-bar--second" />
        <span class="fallback-bar fallback-bar--third" />
        <span class="fallback-alert" />
      </div>
    </div>

    <div class="project-body">
      <div class="project-meta">
        <p v-if="tagLine" class="project-tag">{{ tagLine }}</p>
        <span v-if="project.status === 'in-progress'" class="project-status">
          {{ statusLabel }}
        </span>
      </div>

      <h3 class="project-title">{{ project.title }}</h3>

      <ul v-if="topics.length" class="project-topics">
        <li v-for="(topic, position) in topics" :key="`${position}-${topic}`" class="project-topic">
          {{ topic }}
        </li>
      </ul>
      <p v-else-if="isCompact && summary" class="project-summary">{{ summary }}</p>
      <p v-else-if="!isCompact && impactLines.length" class="project-impact">
        <span v-for="line in impactLines" :key="line.key">
          <strong>{{ line.label }}:</strong> {{ line.text }}
        </span>
      </p>

      <!-- Compact: one small link, stretched over the whole card. -->
      <RouterLink
        v-if="isCompact && opensDetail"
        :to="detailPath"
        class="project-inline-link"
        :aria-label="detailLinkLabel"
      >
        {{ labels.viewProject }}
        <PhArrowUpRight :size="12" aria-hidden="true" focusable="false" />
      </RouterLink>

      <div v-if="!isCompact" class="project-actions">
        <RouterLink
          v-if="opensDetail"
          :to="detailPath"
          class="action-btn action-btn--demo"
          :aria-label="detailLinkLabel"
        >
          {{ labels.viewProject }}
          <PhArrowUpRight :size="12" aria-hidden="true" focusable="false" />
        </RouterLink>

        <a
          v-if="repoUrl"
          :href="repoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="action-btn action-btn--external"
        >
          <PhGithubLogo :size="13" aria-hidden="true" focusable="false" />
          {{ labels.sourceCode }}
          <span class="sr-only">{{ copy.accessibility.opensInNewTab }}</span>
        </a>

        <span v-if="showComingSoon" class="action-btn action-btn--disabled" aria-disabled="true">
          <span aria-hidden="true">○</span>
          {{ labels.comingSoon }}
        </span>
      </div>
    </div>
  </component>
</template>

<style scoped>
/* ---- Card shell (shared by <article> and the locked <button>) -------------------------------- */

.project-card {
  position: relative;
  display: grid;
  overflow: hidden;
  width: 100%;
  min-width: 0;
  padding: 0;
  color: inherit;
  background-color: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 20px;
  font: inherit;
  text-align: left;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.project-card:hover {
  border-color: var(--border-strong);
  box-shadow: 0 18px 44px rgb(20 28 23 / 7%);
  transform: translateY(-2px);
}

.project-card--linked,
.project-card--locked {
  cursor: pointer;
}

/* Pressing a locked card answers with a short "no" wobble. */
.project-card--locked:active {
  animation: locked-shake 0.36s ease-in-out;
}

.project-card--locked:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 4px;
}

.project-card--featured {
  grid-template-columns: minmax(160px, 34%) minmax(0, 1fr);
  min-height: 286px;
}

.project-card--compact {
  grid-template-columns: 116px minmax(0, 1fr);
  min-height: 133px;
}

/* ---- Lock badge ------------------------------------------------------------------------------ */

.project-lock {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  color: var(--signal-text);
  background-color: var(--surface);
  border: 0.5px solid var(--border-strong);
  border-radius: 7px;
  box-shadow: 0 6px 18px rgb(20 28 23 / 8%);
}

.project-lock svg {
  display: block;
}

/* ---- Cover ----------------------------------------------------------------------------------- */

.project-cover {
  overflow: hidden;
  min-width: 0;
  min-height: 100%;
  background-color: #111813;
}

.project-cover-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Crops into a detail of the artwork. */
.project-cover-image--zoomed {
  object-position: 54% 48%;
  transform: scale(1.36);
  transform-origin: 56% 48%;
}

/* The wide featured cover always frames the centre (the zoom scale still applies). */
.project-card--featured .project-cover-image {
  object-position: center;
}

/* Drawn placeholder: a tiny dark dashboard on an 18px grid (same in both themes). */
.project-cover-fallback {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  min-height: 130px;
  background-color: #111820;
  background-image:
    linear-gradient(to bottom, rgb(255 255 255 / 3%) 1px, transparent 1px),
    linear-gradient(to right, rgb(255 255 255 / 3%) 1px, transparent 1px);
  background-size: 18px 18px;
}

.fallback-bar {
  position: absolute;
  left: 18px;
  height: 2px;
  background-color: #4a8bc1;
  border-radius: 999px;
}

.fallback-bar--first {
  top: 38px;
  width: 54px;
}

.fallback-bar--second {
  top: 54px;
  width: 72px;
  opacity: 0.7;
}

.fallback-bar--third {
  top: 70px;
  width: 42px;
  opacity: 0.5;
}

.fallback-alert {
  position: absolute;
  top: 52px;
  right: 18px;
  width: 7px;
  height: 7px;
  background-color: #d36d5f;
  border-radius: 50%;
  box-shadow: 0 0 0 5px rgb(211 109 95 / 12%);
}

/* ---- Body ------------------------------------------------------------------------------------ */

.project-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  padding: 28px;
}

.project-card--compact .project-body {
  justify-content: center;
  padding: 18px 20px;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
}

.project-card--compact .project-meta {
  margin-bottom: 6px;
}

.project-tag {
  margin: 0;
  color: var(--signal-text);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.project-card--compact .project-tag {
  font-size: 9px;
}

.project-status {
  padding: 3px 7px;
  color: var(--signal-text);
  background-color: var(--signal-soft);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 9px;
  line-height: 1.2;
}

.project-title {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
  line-height: 1.3;
}

.project-card--compact .project-title {
  font-size: 14px;
}

/* Problem / Result, one labelled line each. */
.project-impact {
  display: grid;
  gap: 4px;
  max-width: 560px;
  margin: 14px 0 20px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.55;
}

.project-impact strong {
  color: var(--text-secondary);
  font-weight: 600;
}

.project-summary {
  display: -webkit-box;
  overflow: hidden;
  margin: 7px 0 0;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.project-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 20px;
  padding: 0;
  list-style: none;
}

.project-topic {
  padding: 6px 12px;
  color: var(--text-secondary);
  background-color: var(--surface);
  border: 0.5px solid var(--border-strong);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.2;
}

/* ---- Links ----------------------------------------------------------------------------------- */

.project-inline-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  color: var(--signal-text);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  text-decoration: none;
}

/* Stretched link: an empty overlay makes the whole card open the detail page. */
.project-inline-link::after,
.action-btn--demo::after {
  position: absolute;
  inset: 0;
  content: '';
}

.project-inline-link svg {
  transition: transform 0.15s ease;
}

/* The overlay belongs to the link, so this also fires while hovering anywhere on the card. */
.project-inline-link:hover svg {
  transform: translateX(3px);
}

.project-inline-link:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 4px;
  border-radius: 3px;
}

.project-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 7px 12px;
  color: var(--text-secondary);
  background-color: var(--canvas);
  border: 0.5px solid var(--border-strong);
  border-radius: 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  text-decoration: none;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

a.action-btn:hover {
  border-color: var(--signal);
}

.action-btn:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 3px;
}

.action-btn--demo {
  color: var(--signal-text);
  background-color: var(--signal-soft);
  border-color: var(--signal);
  font-weight: 600;
}

/* Sits above the stretched overlay so the repository stays separately clickable. */
.action-btn--external {
  position: relative;
  z-index: 1;
}

.action-btn--disabled {
  opacity: 0.5;
}

/* ---- Responsive ------------------------------------------------------------------------------ */

@media (max-width: 1040px) {
  .project-card--featured {
    grid-template-columns: minmax(150px, 31%) minmax(0, 1fr);
  }

  .project-body {
    padding: 24px;
  }
}

@media (max-width: 860px) {
  .project-card--featured {
    min-height: 270px;
  }

  .project-card--compact {
    min-height: 144px;
  }
}

@media (max-width: 640px) {
  /* Featured: cover banner stacked over the body. */
  .project-card--featured {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
  }

  .project-card--featured .project-cover {
    min-height: 0;
    aspect-ratio: 16 / 8;
  }

  /* Compact: keeps a narrower side thumbnail. */
  .project-card--compact {
    grid-template-columns: 94px minmax(0, 1fr);
    min-height: 124px;
  }

  .project-body {
    padding: 22px;
  }

  .project-card--compact .project-body {
    padding: 16px;
  }

  .project-title {
    font-size: 17px;
  }

  .project-actions {
    margin-top: 4px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-card,
  .project-inline-link svg,
  .action-btn {
    transition: none;
  }

  .project-card--locked:active {
    animation: none;
  }
}
</style>
