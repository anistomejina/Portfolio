<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RouterLink } from 'vue-router'

import LockIcon from '@/components/icons/LockIcon.vue'
import { useLocale } from '@/composables/useLocale'
import type { Post } from '@/types/content'
import { formatReadingTime, formatShortDate } from '@/utils/formatDate'
import { hasHref } from '@/utils/links'

const props = defineProps<{
  post: Post
  /** Zero-based position in the list (displayed as index + 1, zero-padded). */
  index: number
  /** Overrides the link target (default /blog/<slug>). */
  linkTo?: string
}>()

const { copy, locale } = useLocale()
const labels = computed(() => copy.value.posts)

const isLocked = computed(() => Boolean(props.post.locked))
const isPlaceholder = computed(() => Boolean(props.post.placeholder))

/** Locked and placeholder cards never navigate. */
const hasLink = computed(
  () =>
    (hasHref(props.linkTo) || Boolean(props.post.hasDetails)) &&
    !isLocked.value &&
    !isPlaceholder.value,
)
const linkTarget = computed(() =>
  hasHref(props.linkTo) ? props.linkTo : `/blog/${encodeURIComponent(props.post.slug)}`,
)

/** The inner element: a button for locked posts, a router link when there is a target, else a div. */
type InnerElement = { tag: string | Component; attrs: Record<string, string> }

const inner = computed((): InnerElement => {
  if (isLocked.value) {
    return {
      tag: 'button',
      attrs: {
        type: 'button',
        'aria-label': `${props.post.title}. ${labels.value.inProgressLabel}. ${labels.value.comingSoon}.`,
      },
    }
  }
  if (hasLink.value) return { tag: RouterLink, attrs: { to: linkTarget.value } }
  return { tag: 'div', attrs: {} }
})

const number = computed(() => String(props.index + 1).padStart(2, '0'))
const metaLabel = computed(() =>
  isPlaceholder.value ? labels.value.placeholderLabel : props.post.category,
)
const pillLabel = computed(() => {
  if (isLocked.value) return labels.value.inProgressLabel
  return props.post.featured ? labels.value.featuredLabel : ''
})

const publishedAt = computed(() => (hasHref(props.post.publishedAt) ? props.post.publishedAt : ''))
const shortDate = computed(() =>
  publishedAt.value ? formatShortDate(publishedAt.value, locale.value) : '',
)
const minutes = computed(() => {
  const value = props.post.readingTimeMinutes
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
})
const readingTime = computed(() => (minutes.value > 0 ? formatReadingTime(minutes.value, locale.value) : ''))
const hasFooter = computed(() => isLocked.value || Boolean(publishedAt.value) || minutes.value > 0)
</script>

<template>
  <article
    :id="`publication-${post.slug}`"
    class="publication-card"
    :class="{
      'publication-card--locked': isLocked,
      'publication-card--placeholder': isPlaceholder,
    }"
  >
    <span v-if="isLocked" class="publication-lock" aria-hidden="true">
      <LockIcon :size="14" :stroke-width="1.7" />
    </span>

    <component
      :is="inner.tag"
      v-bind="inner.attrs"
      class="publication-link"
      :class="{
        'publication-link--static': !hasLink,
        'publication-link--locked': isLocked,
        'publication-link--placeholder': isPlaceholder,
      }"
    >
      <span class="publication-index" aria-hidden="true">{{ number }}</span>

      <div class="publication-content">
        <div class="publication-meta">
          <span>{{ metaLabel }}</span>
          <span v-if="pillLabel" class="publication-featured">{{ pillLabel }}</span>
        </div>

        <h3 class="publication-title">{{ post.title }}</h3>
        <p v-if="post.excerpt" class="publication-excerpt">{{ post.excerpt }}</p>

        <div v-if="hasFooter" class="publication-footer">
          <span v-if="isLocked">{{ labels.comingSoon }}</span>
          <template v-else>
            <time v-if="publishedAt" :datetime="publishedAt">{{ shortDate }}</time>
            <span v-if="publishedAt && minutes" aria-hidden="true">·</span>
            <span v-if="minutes">{{ readingTime }}</span>
          </template>
        </div>
      </div>

      <span v-if="isPlaceholder" class="publication-placeholder-mark" aria-hidden="true">•••</span>
      <template v-if="hasLink">
        <span class="publication-arrow" aria-hidden="true">↗</span>
        <span class="sr-only">{{ labels.readArticle }}</span>
      </template>
    </component>
  </article>
</template>

<style scoped>
/* ---- Card ------------------------------------------------------------------------------------ */

.publication-card {
  position: relative;
  overflow: hidden;
  min-height: 230px;
  /* Faint green glow in the top-right corner (fixed colour in both themes). */
  background:
    radial-gradient(circle at 88% 18%, rgb(43 138 96 / 8%), transparent 28%),
    var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 22px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

/* Accent strip on the left edge, grown upward on hover. */
.publication-card::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  content: '';
  background-color: var(--signal);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.publication-card:hover {
  border-color: var(--border-strong);
  box-shadow: 0 20px 50px rgb(20 28 23 / 7%);
  transform: translateY(-2px);
}

.publication-card:hover::before {
  transform: scaleY(1);
}

.publication-card--locked {
  cursor: pointer;
}

/* :active bubbles up from the inner button, so the whole card wobbles. */
.publication-card--locked:active {
  animation: locked-shake 0.36s ease-in-out;
}

/* Dashed "coming soon" slot: no fill, no strip, no lift. */
.publication-card--placeholder {
  background: transparent;
  border-style: dashed;
}

.publication-card--placeholder::before {
  display: none;
}

.publication-card--placeholder:hover {
  border-color: var(--border-strong);
  box-shadow: none;
  transform: none;
}

.publication-lock {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 3;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  color: var(--signal-text);
  background-color: var(--surface);
  border: 0.5px solid var(--border-strong);
  border-radius: 8px;
  box-shadow: 0 6px 18px rgb(20 28 23 / 8%);
}

.publication-lock svg {
  display: block;
}

/* ---- Inner element (button, link or div: all look the same) --------------------------------- */

.publication-link {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 44px;
  align-items: start;
  gap: 20px;
  min-height: 230px;
  padding: 30px 32px;
  color: inherit;
  background: transparent;
  border: 0;
  font: inherit;
  text-align: left;
  text-decoration: none;
}

.publication-link--locked {
  width: 100%;
  cursor: pointer;
}

/* No link: no arrow column. */
.publication-link--static {
  grid-template-columns: 48px minmax(0, 1fr);
}

/* ...except placeholders, which need the third column for the "•••" mark. */
.publication-link--static.publication-link--placeholder {
  grid-template-columns: 48px minmax(0, 1fr) 44px;
}

/* Faint 22px graph paper. */
.publication-link--placeholder {
  background-image:
    linear-gradient(to bottom, color-mix(in srgb, var(--border) 15%, transparent) 1px, transparent 1px),
    linear-gradient(to right, color-mix(in srgb, var(--border) 15%, transparent) 1px, transparent 1px);
  background-size: 22px 22px;
}

/* Drawn inside the card so the clipping wrappers never cut it off. */
.publication-link:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: -5px;
  border-radius: 22px;
}

/* ---- Content --------------------------------------------------------------------------------- */

.publication-index {
  padding-top: 3px;
  color: var(--signal-text);
  font-family: var(--font-mono);
  font-size: 13px;
}

/* Stretched to the row height so the footer can sit at the bottom of the card. */
.publication-content {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  min-width: 0;
}

.publication-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: var(--signal-text);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.publication-featured {
  padding: 3px 7px;
  color: var(--text-secondary);
  background-color: var(--signal-soft);
  border-radius: 999px;
  letter-spacing: 0;
  text-transform: none;
}

.publication-title {
  max-width: 800px;
  margin: 0;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: clamp(21px, 2.4vw, 30px);
  font-weight: 500;
  line-height: 1.24;
  text-wrap: balance;
}

.publication-card--placeholder .publication-title {
  color: var(--text-secondary);
}

.publication-excerpt {
  max-width: 720px;
  margin: 13px 0 24px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.65;
}

.publication-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
  margin-top: auto;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
}

.publication-arrow {
  display: grid;
  place-items: center;
  justify-self: end;
  width: 38px;
  height: 38px;
  color: var(--signal-text);
  border: 0.5px solid var(--border-strong);
  border-radius: 50%;
  font-size: 17px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.25s ease;
}

/* Hovering the card fills the arrow and nudges it up and to the right. */
.publication-card:hover .publication-arrow {
  color: var(--surface);
  background-color: var(--signal);
  border-color: var(--signal);
  transform: translate(2px, -2px);
}

.publication-placeholder-mark {
  grid-column: 3;
  grid-row: 1 / span 2;
  align-self: center;
  justify-self: end;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 17px;
  letter-spacing: 0.16em;
}

/* ---- Phones ---------------------------------------------------------------------------------- */

@media (max-width: 640px) {
  .publication-card,
  .publication-link {
    min-height: 0;
  }

  /* Index on its own row, then content | arrow. */
  .publication-link {
    grid-template-columns: minmax(0, 1fr) 36px;
    gap: 14px;
    padding: 23px 21px 24px;
  }

  .publication-link--static {
    grid-template-columns: minmax(0, 1fr);
  }

  .publication-link--static.publication-link--placeholder {
    grid-template-columns: minmax(0, 1fr) 36px;
  }

  .publication-index {
    grid-column: 1 / -1;
    padding: 0;
    font-size: 11px;
  }

  .publication-content {
    grid-column: 1;
  }

  .publication-arrow {
    grid-column: 2;
    grid-row: 2;
    width: 34px;
    height: 34px;
    font-size: 15px;
  }

  .publication-placeholder-mark {
    grid-column: 2;
    grid-row: 2;
  }

  .publication-meta {
    margin-bottom: 10px;
  }

  .publication-title {
    font-size: 19px;
    line-height: 1.3;
    text-wrap: pretty;
  }

  .publication-excerpt {
    display: -webkit-box;
    overflow: hidden;
    margin: 11px 0 20px;
    font-size: 13px;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .publication-card,
  .publication-card::before,
  .publication-arrow {
    transition: none;
  }

  .publication-card--locked:active {
    animation: none;
  }
}
</style>
