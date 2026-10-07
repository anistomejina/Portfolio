<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import PreviewRail from '@/components/PreviewRail.vue'
import { useDocumentTitle } from '@/composables/useDocumentTitle'
import { useLocale } from '@/composables/useLocale'
import { pageTitle } from '@/config/site'
import { localeCodes } from '@/i18n/messages'
import { getPostMarkdown } from '@/utils/content'
import { formatShortDate } from '@/utils/formatDate'
import { hasHref } from '@/utils/links'
import { addNewTabHints, renderMarkdownDocument } from '@/utils/renderMarkdown'

/** Hard-coded on purpose (not translated): reads like a terminal path in both languages. */
const NOT_FOUND_CODE = '404 / ~/blog'
const ARCHIVE_PATH = '/blog'

const route = useRoute()
const { copy, locale } = useLocale()
const labels = computed(() => copy.value.posts)

const slug = computed(() => {
  const param = route.params.slug
  return (Array.isArray(param) ? param[0] : param) ?? ''
})

/**
 * Only posts that declare a detail page resolve. `locked` is deliberately not checked: an
 * in-progress post that already has a body can be opened by typing its URL.
 */
const post = computed(
  () => labels.value.items.find((item) => item.hasDetails === true && item.slug === slug.value) ?? null,
)

/** Body in the current language, falling back to another language when it has not been written yet. */
const markdown = computed(() => (post.value ? getPostMarkdown(slug.value, locale.value) : null))
const rendered = computed(() => (markdown.value ? renderMarkdownDocument(markdown.value.source) : null))

// ---- External links in the body: tell screen-reader users they open a new tab ------------------

const articleHtml = computed(() => {
  const html = rendered.value?.html ?? ''
  return html.trim() ? addNewTabHints(html, copy.value.accessibility?.opensInNewTab ?? '') : ''
})

const outline = computed(() => rendered.value?.headings ?? [])

/** When the body is shown in a fallback language, mark it so screen readers switch voice. */
const articleLang = computed(() => {
  const source = markdown.value
  return source && source.locale !== locale.value ? localeCodes[source.locale] : undefined
})

/** The post page exists only with a post entry AND a non-empty rendered body. */
const hasPage = computed(() => post.value !== null && articleHtml.value !== '')

const railLabel = computed(() => (post.value ? `${post.value.title}: ${labels.value.archiveTitle}` : ''))

// ---- Hero meta row: category · date · reading time (missing values are skipped) ----------------

type MetaPart = { key: string; text: string; datetime?: string }

const metaParts = computed((): MetaPart[] => {
  const item = post.value
  if (!item) return []

  const parts: MetaPart[] = []
  if (hasHref(item.category)) parts.push({ key: 'category', text: item.category })
  if (hasHref(item.publishedAt)) {
    parts.push({
      key: 'date',
      text: formatShortDate(item.publishedAt, locale.value),
      datetime: item.publishedAt,
    })
  }
  const minutes = item.readingTimeMinutes
  if (typeof minutes === 'number' && Number.isFinite(minutes) && minutes > 0) {
    parts.push({ key: 'minutes', text: `${minutes} min` })
  }
  return parts
})

// A post without a body still keeps its own title (only unknown slugs read "not found").
// Follows the language; restored when leaving.
useDocumentTitle(() => pageTitle(post.value?.title ?? labels.value.notFoundTitle))
</script>

<template>
  <main class="post-detail-page">
    <template v-if="hasPage && post">
      <PreviewRail :items="outline" :label="railLabel" />

      <RouterLink :to="ARCHIVE_PATH" class="back-link">
        <span aria-hidden="true">←</span>
        {{ labels.backToBlog }}
      </RouterLink>

      <header class="post-hero">
        <div v-if="metaParts.length" class="post-meta">
          <template v-for="(part, position) in metaParts" :key="part.key">
            <span v-if="position > 0" aria-hidden="true">·</span>
            <time v-if="part.datetime" :datetime="part.datetime">{{ part.text }}</time>
            <span v-else>{{ part.text }}</span>
          </template>
        </div>

        <h1 class="post-title">{{ post.title }}</h1>
        <p v-if="post.excerpt" class="post-lead">{{ post.excerpt }}</p>
      </header>

      <!-- Safe: raw HTML inside markdown is escaped by the renderer. -->
      <article class="post-markdown" :lang="articleLang" v-html="articleHtml" />

      <footer class="post-detail-footer">
        <RouterLink :to="ARCHIVE_PATH" class="back-link">
          <span aria-hidden="true">←</span>
          {{ labels.backToBlog }}
        </RouterLink>
      </footer>
    </template>

    <section v-else class="post-not-found" aria-labelledby="post-not-found-title">
      <p class="post-not-found-code">{{ NOT_FOUND_CODE }}</p>
      <h1 id="post-not-found-title" class="post-title">{{ labels.notFoundTitle }}</h1>
      <p v-if="labels.notFoundText" class="post-not-found-text">{{ labels.notFoundText }}</p>
      <RouterLink :to="ARCHIVE_PATH" class="back-link back-action">
        <span aria-hidden="true">←</span>
        {{ labels.backToBlog }}
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
/* 980px column centred in the page: 70px of inset on each side at full width. */
.post-detail-page {
  max-width: 980px;
  margin: 0 auto;
  padding-top: 60px;
}

/* ---- Back links ------------------------------------------------------------------------------ */

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}

.back-link:hover {
  color: var(--signal-text);
}

.back-link:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 4px;
  border-radius: 4px;
}

/* Soft green button on the not-found page (Mono 700: Inter is only loaded up to 600). */
.back-action {
  min-height: 39px;
  padding: 9px 14px;
  font-weight: 700;
  color: var(--signal-text);
  background-color: var(--signal-soft);
  border: 0.5px solid var(--signal);
  border-radius: 9px;
}

.back-action:focus-visible {
  border-radius: 9px;
}

/* ---- Hero (left-aligned in the column; the body below is centred) --------------------------- */

.post-hero {
  max-width: 820px;
  padding: 44px 0 52px;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--signal-text);
}

/* Shared by the post title and the not-found title: 32px below 533px, 58px from 967px. */
.post-title {
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(32px, 6vw, 58px);
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -0.045em;
  color: var(--ink);
  text-wrap: balance;
}

.post-lead {
  max-width: 720px;
  margin: 24px 0 0;
  font-size: clamp(15px, 2vw, 18px);
  line-height: 1.7;
  color: var(--text-secondary);
}

/* ---- Markdown body ---------------------------------------------------------------------------- */

.post-markdown {
  max-width: 760px;
  margin: 0 auto;
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.post-markdown :deep(h1),
.post-markdown :deep(h2) {
  margin: 54px 0 16px;
  font-family: var(--font-mono);
  font-size: clamp(21px, 3vw, 28px);
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.025em;
  color: var(--ink);
  scroll-margin-top: 32px;
}

.post-markdown :deep(h1:first-child),
.post-markdown :deep(h2:first-child) {
  margin-top: 0;
}

.post-markdown :deep(h3) {
  margin: 34px 0 12px;
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
  color: var(--ink);
}

.post-markdown :deep(h4) {
  margin: 24px 0 8px;
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 500;
  color: var(--ink);
}

.post-markdown :deep(p) {
  margin: 0 0 18px;
}

.post-markdown :deep(strong) {
  font-weight: 600;
  color: var(--ink);
}

/* Even spacing between items; nested lists follow the same rules. */
.post-markdown :deep(ul),
.post-markdown :deep(ol) {
  display: grid;
  gap: 8px;
  margin: 0 0 22px;
  padding-left: 24px;
}

.post-markdown :deep(li::marker) {
  font-family: var(--font-mono);
  color: var(--signal-text);
}

.post-markdown :deep(a) {
  color: var(--signal-text);
  text-decoration-color: color-mix(in srgb, var(--signal) 55%, transparent);
  text-underline-offset: 3px;
}

.post-markdown :deep(a:focus-visible) {
  outline: 2px solid var(--signal);
  outline-offset: 4px;
  border-radius: 4px;
}

.post-markdown :deep(code) {
  padding: 2px 5px;
  font-family: var(--font-mono);
  font-size: 0.88em;
  color: var(--signal-text);
  background-color: var(--signal-soft);
  border-radius: 5px;
}

/* A dark terminal panel in both themes; long lines scroll instead of wrapping. */
.post-markdown :deep(pre) {
  margin: 24px 0;
  padding: 20px;
  overflow-x: auto;
  line-height: 1.65;
  color: #dce8df;
  background-color: #111813;
  border: 0.5px solid rgb(255 255 255 / 8%);
  border-radius: 14px;
}

.post-markdown :deep(pre code) {
  padding: 0;
  color: inherit;
  background: transparent;
}

.post-markdown :deep(blockquote) {
  margin: 28px 0;
  padding: 4px 0 4px 20px;
  color: var(--text-muted);
  border-left: 2px solid var(--signal);
}

.post-markdown :deep(hr) {
  margin: 48px 0;
  border: 0;
  border-top: 0.5px solid var(--border);
}

.post-markdown :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 28px 0 8px;
  border: 0.5px solid var(--border);
  border-radius: 14px;
}

/* Tables arrive wrapped in div.md-table, which scrolls sideways on narrow screens. */
.post-markdown :deep(.md-table) {
  margin: 0 0 22px;
  overflow-x: auto;
}

.post-markdown :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

/* Column alignment written in markdown arrives as an inline style and still wins. */
.post-markdown :deep(th),
.post-markdown :deep(td) {
  padding: 10px 12px;
  text-align: left;
  vertical-align: top;
  border-bottom: 0.5px solid var(--border);
}

.post-markdown :deep(th) {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  color: var(--ink);
}

/* ---- Footer (aligned with the article) ------------------------------------------------------ */

.post-detail-footer {
  max-width: 760px;
  margin: 58px auto 0;
  padding-top: 24px;
  border-top: 0.5px solid var(--border);
}

/* ---- Not found ------------------------------------------------------------------------------- */

.post-not-found {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  max-width: 720px;
  min-height: 52vh;
}

.post-not-found-code {
  margin: 0 0 18px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--signal-text);
}

.post-not-found-text {
  max-width: 560px;
  margin: 20px 0 28px;
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* The button keeps its own colour on hover. */
.back-action:hover {
  color: var(--signal-text);
}

/* ---- Phones ---------------------------------------------------------------------------------- */

@media (max-width: 640px) {
  .post-detail-page {
    padding-top: 42px;
  }

  .post-hero {
    padding: 34px 0 40px;
  }

  /* 37.5px at 375px wide, 43px from 430px. */
  .post-title {
    font-size: clamp(30px, 10vw, 43px);
    text-wrap: pretty;
  }

  .post-markdown {
    font-size: 14px;
    line-height: 1.75;
  }

  .post-markdown :deep(h1),
  .post-markdown :deep(h2) {
    margin-top: 42px;
  }

  .post-markdown :deep(h1:first-child),
  .post-markdown :deep(h2:first-child) {
    margin-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-link {
    transition: none;
  }
}
</style>
