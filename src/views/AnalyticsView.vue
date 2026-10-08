<script setup lang="ts">
import { PhArrowUpRight, PhGitFork, PhStar } from '@phosphor-icons/vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import ScrambleName from '@/components/ScrambleName.vue'
import { useLocale } from '@/composables/useLocale'
import { githubUsername } from '@/config/site'
import { formatShortDate } from '@/utils/formatDate'
import {
  fetchGitHubStats,
  GitHubRateLimitError,
  localDateKey,
  type ActivityDay,
  type GitHubStats,
} from '@/utils/github'

const { copy, locale, localeCode } = useLocale()
const t = computed(() => copy.value.analytics)

type State = 'idle' | 'loading' | 'ready' | 'error' | 'rate-limited'
const state = ref<State>(githubUsername ? 'loading' : 'idle')
const stats = ref<GitHubStats | null>(null)
let controller: AbortController | null = null

async function load(): Promise<void> {
  if (!githubUsername) return
  controller?.abort()
  controller = new AbortController()
  state.value = 'loading'
  try {
    stats.value = await fetchGitHubStats(githubUsername, controller.signal)
    state.value = 'ready'
  } catch (error) {
    if ((error as Error).name === 'AbortError') return
    state.value = error instanceof GitHubRateLimitError ? 'rate-limited' : 'error'
  }
}

onMounted(load)
onBeforeUnmount(() => controller?.abort())

// ----- formatting ------------------------------------------------------------------------------

const numberFormat = computed(() => new Intl.NumberFormat(localeCode.value))
const relativeFormat = computed(
  () => new Intl.RelativeTimeFormat(localeCode.value, { numeric: 'auto', style: 'short' }),
)

function formatNumber(value: number): string {
  return numberFormat.value.format(value)
}

/** "3 days ago" / "vor 3 Tagen", from an ISO timestamp. */
function timeAgo(iso: string | number): string {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeFormat.value.format(Math.round(seconds / size), unit)
  }
  return relativeFormat.value.format(0, 'minute')
}

function dateOf(iso: string): string {
  return formatShortDate(localDateKey(new Date(iso)), locale.value)
}

/** "1 y 4 mo" / "1 J. 4 Mon." since the account was created. */
const accountAge = computed(() => {
  if (!stats.value) return ''
  const created = new Date(stats.value.createdAt)
  const now = new Date()
  let months = (now.getFullYear() - created.getFullYear()) * 12 + now.getMonth() - created.getMonth()
  if (now.getDate() < created.getDate()) months -= 1
  months = Math.max(0, months)
  if (months === 0) {
    const days = Math.max(0, Math.floor((now.getTime() - created.getTime()) / 86_400_000))
    return `${days} ${t.value.days}`
  }
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `${rest} ${t.value.months}`
  return rest === 0 ? `${years} ${t.value.years}` : `${years} ${t.value.years} ${rest} ${t.value.months}`
})

const tiles = computed(() => {
  const s = stats.value
  if (!s) return []
  return [
    { value: formatNumber(s.publicRepos), label: t.value.stats.repos },
    { value: formatNumber(s.totalStars), label: t.value.stats.stars },
    { value: formatNumber(s.totalForks), label: t.value.stats.forks },
    { value: formatNumber(s.followers), label: t.value.stats.followers },
    { value: accountAge.value, label: t.value.stats.accountAge },
  ]
})

// ----- activity heatmap ------------------------------------------------------------------------

/** Monday-first weekday index (0 = Monday). */
function weekday(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return (new Date(y, m - 1, d).getDay() + 6) % 7
}

const activityMax = computed(() => Math.max(0, ...(stats.value?.activity ?? []).map((day) => day.count)))
const activityTotal = computed(() =>
  (stats.value?.activity ?? []).reduce((sum, day) => sum + day.count, 0),
)

/** Sequential scale, one hue: 0 = empty, 1-4 = quarters of the busiest day. */
function level(count: number): number {
  if (count === 0 || activityMax.value === 0) return 0
  return Math.min(4, Math.ceil((count / activityMax.value) * 4))
}

type Cell = (ActivityDay & { level: number; label: string }) | null

/** Leading blanks align the first column with its weekday; the grid flows column by column. */
const cells = computed<Cell[]>(() => {
  const days = stats.value?.activity ?? []
  if (!days.length) return []
  const blanks: Cell[] = Array.from({ length: weekday(days[0].date) }, () => null)
  return blanks.concat(
    days.map((day) => ({
      ...day,
      level: level(day.count),
      label: t.value.activityCell
        .replace('{count}', formatNumber(day.count))
        .replace('{date}', formatShortDate(day.date, locale.value)),
    })),
  )
})

const activitySummary = computed(
  () => `${t.value.activityTitle}: ${formatNumber(activityTotal.value)} ${t.value.activityTotal}`,
)

const tooltip = ref<{ text: string; x: number; y: number } | null>(null)
const heatmapEl = ref<HTMLElement | null>(null)

function showTooltip(event: PointerEvent, cell: Cell): void {
  if (!cell || !heatmapEl.value) return
  const box = heatmapEl.value.getBoundingClientRect()
  const target = (event.currentTarget as HTMLElement).getBoundingClientRect()
  tooltip.value = {
    text: cell.label,
    x: target.left - box.left + target.width / 2,
    y: target.top - box.top,
  }
}

// ----- languages, repos, feed ------------------------------------------------------------------

const languages = computed(() =>
  (stats.value?.languages ?? []).map((row) => ({
    ...row,
    label: row.name || t.value.otherLanguages,
    percent: Math.round(row.share * 100),
    unit: row.repos === 1 ? t.value.repoUnitSingular : t.value.reposUnit,
  })),
)

const feed = computed(() =>
  (stats.value?.recentActivity ?? []).map((item) => ({
    ...item,
    verb: t.value.eventTypes[item.type] ?? t.value.eventTypes.default,
  })),
)

// Relative times ("2 min ago") go stale; refresh them every minute while the page is open.
const tick = ref(0)
let tickTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  tickTimer = setInterval(() => (tick.value += 1), 60_000)
})
onBeforeUnmount(() => clearInterval(tickTimer))
const updatedAgo = computed(() => {
  void tick.value
  return stats.value ? timeAgo(stats.value.fetchedAt) : ''
})

watch(locale, () => (tooltip.value = null))
</script>

<template>
  <main class="analytics-page">
    <p class="eyebrow">{{ t.eyebrow }}</p>
    <div class="page-title">
      <ScrambleName :key="t.pageTitle" :text="t.pageTitle" />
    </div>

    <div class="intro-row">
      <p class="intro">{{ t.intro }}</p>
      <a
        v-if="stats"
        :href="stats.profileUrl"
        class="profile-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ t.viewProfile }}
        <PhArrowUpRight :size="12" aria-hidden="true" />
      </a>
    </div>
    <p v-if="state === 'ready' && stats" class="updated">
      <span class="dot" aria-hidden="true" /> {{ t.updatedLabel }} {{ updatedAgo }}
    </p>

    <p v-if="state === 'idle'" class="notice">{{ t.noUsername }}</p>

    <div v-else-if="state === 'loading'" class="skeleton" aria-busy="true">
      <p class="sr-only">{{ t.loading }}</p>
      <div class="skeleton-strip" />
      <div class="skeleton-block" />
      <div class="skeleton-block skeleton-block--short" />
    </div>

    <div v-else-if="state === 'error' || state === 'rate-limited'" class="notice notice--error" role="alert">
      <p class="notice-title">{{ t.errorTitle }}</p>
      <p>{{ state === 'rate-limited' ? t.rateLimitText : t.errorText }}</p>
      <button type="button" class="retry" @click="load">{{ t.retry }}</button>
    </div>

    <template v-else-if="stats">
      <section class="tiles" :aria-label="t.pageTitle">
        <div v-for="tile in tiles" :key="tile.label" class="tile">
          <span class="tile-value">{{ tile.value }}</span>
          <span class="tile-label">{{ tile.label }}</span>
        </div>
      </section>

      <section class="block" aria-labelledby="activity-title">
        <header class="block-head">
          <h2 id="activity-title" class="block-title">{{ t.activityTitle }}</h2>
          <p class="block-meta">
            <strong>{{ formatNumber(activityTotal) }}</strong> {{ t.activityTotal }}
          </p>
        </header>

        <div ref="heatmapEl" class="heatmap-wrap" @pointerleave="tooltip = null">
          <div class="heatmap" role="img" :aria-label="activitySummary">
            <span
              v-for="(cell, index) in cells"
              :key="cell?.date ?? `blank-${index}`"
              class="cell"
              :class="cell ? `cell--l${cell.level}` : 'cell--blank'"
              @pointerenter="showTooltip($event, cell)"
            />
          </div>
          <div
            v-if="tooltip"
            class="tooltip"
            :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
            aria-hidden="true"
          >
            {{ tooltip.text }}
          </div>
        </div>

        <div class="heatmap-foot">
          <p class="block-note">{{ t.activityNote }}</p>
          <div class="legend" aria-hidden="true">
            <span>{{ t.less }}</span>
            <span v-for="n in 5" :key="n" class="cell" :class="`cell--l${n - 1}`" />
            <span>{{ t.more }}</span>
          </div>
        </div>
      </section>

      <div class="columns">
        <section class="block" aria-labelledby="languages-title">
          <header class="block-head">
            <h2 id="languages-title" class="block-title">{{ t.languagesTitle }}</h2>
          </header>
          <ul v-if="languages.length" class="bars">
            <li v-for="row in languages" :key="row.label" class="bar-row">
              <div class="bar-text">
                <span class="bar-name">{{ row.label }}</span>
                <span class="bar-value">{{ row.repos }} {{ row.unit }} · {{ row.percent }}%</span>
              </div>
              <div class="bar-track">
                <span class="bar-fill" :class="{ 'bar-fill--other': !row.name }" :style="{ width: `${Math.max(row.percent, 2)}%` }" />
              </div>
            </li>
          </ul>
          <p v-else class="empty">{{ t.noLanguages }}</p>
          <p class="block-note">{{ t.languagesNote }}</p>
        </section>

        <section class="block" aria-labelledby="feed-title">
          <header class="block-head">
            <h2 id="feed-title" class="block-title">{{ t.activityFeedTitle }}</h2>
          </header>
          <ol v-if="feed.length" class="feed">
            <li v-for="(item, index) in feed" :key="`${item.createdAt}-${index}`" class="feed-item">
              <span class="feed-text">
                {{ item.verb }}
                <a :href="item.url" target="_blank" rel="noopener noreferrer" class="feed-repo">{{ item.repo }}</a>
                <span v-if="item.type === 'PushEvent'" class="feed-count">
                  · {{ item.count }} {{ item.count === 1 ? t.commitUnitSingular : t.commitsUnit }}</span
                >
              </span>
              <time class="feed-time" :datetime="item.createdAt">{{ timeAgo(item.createdAt) }}</time>
            </li>
          </ol>
          <p v-else class="empty">{{ t.noActivity }}</p>
        </section>
      </div>

      <section class="block" aria-labelledby="repos-title">
        <header class="block-head">
          <h2 id="repos-title" class="block-title">{{ t.reposTitle }}</h2>
        </header>
        <ul v-if="stats.recentRepos.length" class="repos">
          <li v-for="repo in stats.recentRepos" :key="repo.name">
            <a :href="repo.url" class="repo" target="_blank" rel="noopener noreferrer">
              <span class="repo-head">
                <span class="repo-name">{{ repo.name }}</span>
                <PhArrowUpRight class="repo-arrow" :size="14" aria-hidden="true" />
              </span>
              <span v-if="repo.description" class="repo-desc">{{ repo.description }}</span>
              <span class="repo-meta">
                <span v-if="repo.language" class="repo-lang"><span class="lang-dot" aria-hidden="true" />{{ repo.language }}</span>
                <span class="repo-stat"><PhStar :size="12" aria-hidden="true" />{{ formatNumber(repo.stars) }}</span>
                <span class="repo-stat"><PhGitFork :size="12" aria-hidden="true" />{{ formatNumber(repo.forks) }}</span>
                <span>{{ t.updated }} {{ dateOf(repo.pushedAt) }}</span>
              </span>
            </a>
          </li>
        </ul>
        <p v-else class="empty">{{ t.noRepos }}</p>
      </section>
    </template>
  </main>
</template>

<style scoped>
.eyebrow {
  margin-bottom: 20px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--signal-text);
}

.page-title {
  margin-bottom: 20px;
}

.intro-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px 24px;
}

.intro {
  max-width: 620px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
}

.profile-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--signal-text);
  text-decoration: none;
  transition: gap 0.2s ease, color 0.2s ease;
}

.profile-link:hover {
  gap: 10px;
  color: var(--signal);
}

.updated {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--signal);
}

/* ----- states ----- */
.notice {
  margin-top: 36px;
  padding: 22px 24px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
}

.notice-title {
  margin-bottom: 6px;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
}

.retry {
  margin-top: 14px;
  padding: 8px 16px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--signal-text);
  background: transparent;
  border: 0.5px solid var(--signal);
  border-radius: 999px;
  cursor: pointer;
}

.retry:hover {
  background: var(--signal-soft);
}

.skeleton {
  display: grid;
  gap: 20px;
  margin-top: 36px;
}

.skeleton-strip,
.skeleton-block {
  height: 82px;
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton-block {
  height: 180px;
}

.skeleton-block--short {
  height: 120px;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ----- stat tiles: same strip as the hero stats ----- */
.tiles {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin-top: 36px;
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
}

.tile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 18px 20px;
  border-right: 0.5px solid var(--border);
}

.tile:last-child {
  border-right: 0;
}

.tile-value {
  font-family: var(--font-mono);
  font-size: 24px;
  color: var(--ink);
  white-space: nowrap;
}

.tile-label {
  font-size: 11px;
  color: var(--text-muted);
  overflow-wrap: break-word;
}

/* ----- blocks ----- */
.block {
  margin-top: clamp(40px, 6vw, 56px);
}

.block-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 16px;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 0.5px solid var(--border-strong);
}

.block-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink);
}

.block-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}

.block-meta strong {
  color: var(--ink);
}

.block-note {
  margin-top: 14px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-muted);
}

.empty {
  font-size: 13px;
  color: var(--text-muted);
}

/* ----- heatmap: one hue, light -> dark ----- */
.heatmap-wrap {
  position: relative;
  overflow-x: auto;
  padding-bottom: 4px;
}

.heatmap {
  display: grid;
  grid-template-rows: repeat(7, 14px);
  grid-auto-flow: column;
  grid-auto-columns: 14px;
  gap: 4px;
  width: max-content;
}

.cell {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.cell--blank {
  visibility: hidden;
}

.cell--l0 {
  background: var(--border);
}

.cell--l1 {
  background: color-mix(in srgb, var(--signal) 30%, var(--surface));
}

.cell--l2 {
  background: color-mix(in srgb, var(--signal) 55%, var(--surface));
}

.cell--l3 {
  background: color-mix(in srgb, var(--signal) 78%, var(--surface));
}

.cell--l4 {
  background: var(--signal);
}

.heatmap .cell:not(.cell--blank):hover {
  outline: 2px solid var(--ink);
  outline-offset: 1px;
}

.tooltip {
  position: absolute;
  z-index: 2;
  transform: translate(-50%, calc(-100% - 8px));
  padding: 6px 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  white-space: nowrap;
  color: var(--canvas);
  background: var(--ink);
  border-radius: 6px;
  pointer-events: none;
}

.heatmap-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 24px;
}

.legend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 14px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
}

.legend span:first-child {
  margin-right: 4px;
}

.legend span:last-child {
  margin-left: 4px;
}

.legend .cell {
  width: 11px;
  height: 11px;
  border-radius: 3px;
}

/* ----- languages + feed side by side ----- */
.columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 clamp(32px, 5vw, 64px);
}

.bars {
  display: grid;
  gap: 14px;
  list-style: none;
}

.bar-text {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.bar-name {
  color: var(--ink);
}

.bar-value {
  color: var(--text-muted);
  white-space: nowrap;
}

.bar-track {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  display: block;
  height: 100%;
  background: var(--signal);
  border-radius: 4px;
}

.bar-fill--other {
  background: var(--text-muted);
}

.feed {
  display: grid;
  list-style: none;
}

.feed-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding: 10px 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
  border-bottom: 0.5px solid var(--border);
}

.feed-item:first-child {
  padding-top: 0;
}

.feed-repo {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.feed-repo:hover {
  color: var(--signal-text);
  text-decoration: underline;
}

.feed-count {
  color: var(--text-muted);
}

.feed-time {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}

/* ----- repositories ----- */
.repos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  list-style: none;
}

.repo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  padding: 20px 22px;
  color: inherit;
  text-decoration: none;
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.repo:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
}

.repo:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 3px;
}

.repo-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.repo-name {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  overflow-wrap: anywhere;
}

.repo-arrow {
  flex-shrink: 0;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.repo:hover .repo-arrow {
  color: var(--signal-text);
}

.repo-desc {
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-secondary);
}

.repo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: auto;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}

.repo-lang,
.repo-stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.lang-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--signal);
}

@media (max-width: 860px) {
  .tiles {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tile:nth-child(3) {
    border-right: 0;
  }

  .tile:nth-child(n + 4) {
    border-top: 0.5px solid var(--border);
  }

  .columns {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .tiles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tile {
    padding: 14px 16px;
  }

  .tile:nth-child(3) {
    border-right: 0.5px solid var(--border);
  }

  .tile:nth-child(2n) {
    border-right: 0;
  }

  .tile:nth-child(n + 3) {
    border-top: 0.5px solid var(--border);
  }

  .tile:last-child {
    grid-column: 1 / -1;
  }

  .tile-value {
    font-size: 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-strip,
  .skeleton-block {
    animation: none;
  }

  .repo,
  .profile-link {
    transition: none;
  }

  .repo:hover {
    transform: none;
  }
}
</style>
