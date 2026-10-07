<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import PreviewRail from '@/components/PreviewRail.vue'
import { useDocumentTitle } from '@/composables/useDocumentTitle'
import { useLocale } from '@/composables/useLocale'
import { pageTitle } from '@/config/site'
import { localeCodes } from '@/i18n/messages'
import { getProjectMarkdown } from '@/utils/content'
import { formatShortDate } from '@/utils/formatDate'
import { hasHref, isExternalUrl } from '@/utils/links'
import { addNewTabHints, renderMarkdownDocument } from '@/utils/renderMarkdown'

const route = useRoute()
const { copy, locale } = useLocale()
const text = computed(() => copy.value.projects)

const slug = computed(() => {
  const param = route.params.slug
  return (Array.isArray(param) ? param[0] : param) ?? ''
})

/** Only projects that declare a detail page resolve; everything else is a 404. */
const project = computed(
  () => text.value.items.find((item) => item.hasDetails === true && item.slug === slug.value) ?? null,
)

const markdown = computed(() => getProjectMarkdown(slug.value, locale.value))

/** Rendered once per (slug, language): `{ html, headings }`. */
const documentBody = computed(() => (markdown.value ? renderMarkdownDocument(markdown.value.source) : null))
/** External links in the body also tell screen-reader users that they open a new tab. */
const articleHtml = computed(() =>
  addNewTabHints(documentBody.value?.html ?? '', copy.value.accessibility?.opensInNewTab ?? ''),
)
const outline = computed(() => documentBody.value?.headings ?? [])

/** When the body fell back to another language, say so to screen readers and hyphenation. */
const articleLang = computed(() => {
  const source = markdown.value
  return source && source.locale !== locale.value ? localeCodes[source.locale] : undefined
})

const hasPage = computed(() => project.value !== null && articleHtml.value.trim() !== '')

const statusText = computed(() =>
  project.value?.status === 'live' ? text.value.liveLabel : text.value.inProgressLabel,
)

const metaPrefix = computed(() =>
  [project.value?.index, project.value?.tag].filter((part) => Boolean(part)).join(' / '),
)

const dateText = computed(() =>
  project.value?.publishedAt ? formatShortDate(project.value.publishedAt, locale.value) : '',
)

const heroImage = computed(() => project.value?.detailImage || project.value?.coverImage || '')
const heroImageAlt = computed(() => {
  const item = project.value
  return item?.detailImageAlt || item?.coverAlt || item?.title || ''
})

const repoHref = computed(() => (hasHref(project.value?.repoUrl) ? project.value.repoUrl : ''))
const demoHref = computed(() => (hasHref(project.value?.demoUrl) ? project.value.demoUrl : ''))

const railLabel = computed(() => (project.value ? `${project.value.title}: ${text.value.sectionTitle}` : ''))

function newTabAttrs(href: string) {
  return isExternalUrl(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {}
}

// A project without a body still keeps its own title (only unknown slugs read "not found").
useDocumentTitle(() => pageTitle(project.value?.title ?? text.value.notFoundTitle))
</script>

<template>
  <main class="project-detail-page">
    <template v-if="hasPage && project">
      <PreviewRail :items="outline" :label="railLabel" />

      <RouterLink to="/projects" class="back-link">
        <span aria-hidden="true">←</span>
        {{ text.backToProjects }}
      </RouterLink>

      <header class="project-hero">
        <div class="project-hero-meta">
          <template v-if="metaPrefix">
            <span>{{ metaPrefix }}</span>
            <span aria-hidden="true">·</span>
          </template>
          <span>{{ statusText }}</span>
          <template v-if="dateText">
            <span aria-hidden="true">·</span>
            <time :datetime="project.publishedAt">{{ dateText }}</time>
          </template>
        </div>

        <h1>{{ project.title }}</h1>

        <p v-if="project.impact?.result" class="project-lead">{{ project.impact.result }}</p>

        <!-- Always present (even empty) so its top margin keeps the spacing above the image. -->
        <div class="project-hero-actions">
          <a v-if="repoHref" class="hero-action hero-action--primary" :href="repoHref" v-bind="newTabAttrs(repoHref)">
            {{ text.sourceCode }}
            <span aria-hidden="true">↗</span>
            <span v-if="isExternalUrl(repoHref)" class="sr-only">{{ copy.accessibility.opensInNewTab }}</span>
          </a>
          <a v-if="demoHref" class="hero-action" :href="demoHref" v-bind="newTabAttrs(demoHref)">
            {{ text.viewDemo }}
            <span aria-hidden="true">↗</span>
            <span v-if="isExternalUrl(demoHref)" class="sr-only">{{ copy.accessibility.opensInNewTab }}</span>
          </a>
        </div>
      </header>

      <figure v-if="heroImage" class="project-hero-image">
        <img :src="heroImage" :alt="heroImageAlt" decoding="async" />
      </figure>

      <!-- Safe: the renderer escapes raw HTML in the markdown source. -->
      <article class="project-markdown" :lang="articleLang" v-html="articleHtml" />

      <footer class="project-detail-footer">
        <RouterLink to="/projects" class="back-link">
          <span aria-hidden="true">←</span>
          {{ text.backToProjects }}
        </RouterLink>
      </footer>
    </template>

    <section v-else class="project-not-found">
      <p class="project-not-found-code">404 / ~/projects</p>
      <h1>{{ text.notFoundTitle }}</h1>
      <p class="project-not-found-text">{{ text.notFoundText }}</p>
      <RouterLink to="/projects" class="hero-action hero-action--primary">
        <span aria-hidden="true">←</span>
        {{ text.backToProjects }}
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.project-detail-page {
  max-width: 980px;
  margin: 0 auto;
  padding-top: 60px;
}

/* ---- Back link ------------------------------------------------------------------------------- */

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

.back-link:focus-visible,
.hero-action:focus-visible,
.project-markdown :deep(a:focus-visible) {
  outline: 2px solid var(--signal);
  outline-offset: 4px;
  border-radius: 4px;
}

/* ---- Hero ------------------------------------------------------------------------------------ */

.project-hero {
  max-width: 820px;
  padding: 44px 0 36px;
}

.project-hero-meta {
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

.project-hero h1,
.project-not-found h1 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(32px, 6vw, 58px);
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -0.045em;
  color: var(--ink);
  text-wrap: balance;
}

.project-lead {
  max-width: 720px;
  margin-top: 24px;
  font-size: clamp(15px, 2vw, 18px);
  line-height: 1.7;
  color: var(--text-secondary);
}

.project-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}

.hero-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 39px;
  padding: 9px 14px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
  text-decoration: none;
  background: var(--surface);
  border: 0.5px solid var(--border-strong);
  border-radius: 9px;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.hero-action:hover {
  border-color: var(--signal);
}

.hero-action--primary {
  font-weight: 700;
  color: var(--signal-text);
  background: var(--signal-soft);
  border-color: var(--signal);
}

/* Full 980px width (wider than the hero text). */
.project-hero-image {
  margin: 0 0 54px;
  overflow: hidden;
  background: #111813;
  border: 0.5px solid var(--border);
  border-radius: 22px;
  box-shadow: 0 24px 70px rgb(20 28 23 / 9%);
}

.project-hero-image img {
  display: block;
  width: 100%;
  max-height: 620px;
  object-fit: cover;
}

/* ---- Markdown body (centred 760px column; the hero above stays left-aligned) ----------------- */

.project-markdown {
  max-width: 760px;
  margin: 0 auto;
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.project-markdown :deep(h2) {
  margin: 54px 0 16px;
  font-family: var(--font-mono);
  font-size: clamp(21px, 3vw, 28px);
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.025em;
  color: var(--ink);
  scroll-margin-top: 32px;
}

.project-markdown :deep(h2:first-child) {
  margin-top: 0;
}

.project-markdown :deep(h3) {
  margin: 34px 0 12px;
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
  color: var(--ink);
}

.project-markdown :deep(h4) {
  margin: 24px 0 8px;
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 500;
  color: var(--ink);
}

.project-markdown :deep(p) {
  margin: 0 0 18px;
}

.project-markdown :deep(strong) {
  font-weight: 600;
  color: var(--ink);
}

.project-markdown :deep(ul),
.project-markdown :deep(ol) {
  display: grid;
  gap: 8px;
  margin: 0 0 22px;
  padding-left: 24px;
}

.project-markdown :deep(li::marker) {
  font-family: var(--font-mono);
  color: var(--signal-text);
}

.project-markdown :deep(a) {
  color: var(--signal-text);
  text-decoration-color: color-mix(in srgb, var(--signal) 55%, transparent);
  text-underline-offset: 3px;
}

.project-markdown :deep(code) {
  padding: 2px 5px;
  font-family: var(--font-mono);
  font-size: 0.88em;
  color: var(--signal-text);
  background: var(--signal-soft);
  border-radius: 5px;
}

/* Code blocks stay dark in both themes; no syntax highlighting. */
.project-markdown :deep(pre) {
  margin: 24px 0;
  padding: 20px;
  overflow-x: auto;
  line-height: 1.65;
  color: #dce8df;
  background: #111813;
  border: 0.5px solid rgb(255 255 255 / 8%);
  border-radius: 14px;
}

.project-markdown :deep(pre code) {
  padding: 0;
  color: inherit;
  background: transparent;
}

/* White backing for transparent charts/screenshots. */
.project-markdown :deep(img) {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  margin: 28px 0 8px;
  background: #fff;
  border: 0.5px solid var(--border);
  border-radius: 16px;
}

.project-markdown :deep(blockquote) {
  margin: 28px 0;
  padding: 4px 0 4px 20px;
  color: var(--text-muted);
  border-left: 2px solid var(--signal);
}

.project-markdown :deep(hr) {
  margin: 48px 0;
  border: 0;
  border-top: 0.5px solid var(--border);
}

/* Tables (wrapped in div.md-table by the renderer) scroll sideways on phones. */
.project-markdown :deep(.md-table) {
  margin: 0 0 22px;
  overflow-x: auto;
}

.project-markdown :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.project-markdown :deep(th),
.project-markdown :deep(td) {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 0.5px solid var(--border);
}

.project-markdown :deep(th) {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--ink);
}

/* ---- Footer ---------------------------------------------------------------------------------- */

.project-detail-footer {
  max-width: 760px;
  margin: 58px auto 0;
  padding-top: 24px;
  border-top: 0.5px solid var(--border);
}

/* ---- Not found ------------------------------------------------------------------------------- */

.project-not-found {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  max-width: 720px;
  min-height: 52vh;
}

.project-not-found-code {
  margin: 0 0 18px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--signal-text);
}

.project-not-found-text {
  max-width: 560px;
  margin: 20px 0 28px;
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* ---- Responsive ------------------------------------------------------------------------------ */

@media (max-width: 640px) {
  .project-detail-page {
    padding-top: 42px;
  }

  .project-hero {
    padding: 34px 0 28px;
  }

  .project-hero h1,
  .project-not-found h1 {
    font-size: clamp(30px, 10vw, 43px);
    text-wrap: pretty;
  }

  .project-hero-image {
    margin-bottom: 40px;
    border-radius: 15px;
  }

  .project-markdown {
    font-size: 14px;
    line-height: 1.75;
  }

  .project-markdown :deep(h2) {
    margin-top: 42px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-link,
  .hero-action {
    transition: none;
  }
}
</style>
