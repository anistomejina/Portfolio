<script setup lang="ts">
import { computed } from 'vue'

import GitHubIcon from '@/components/icons/GitHubIcon.vue'
import GmailIcon from '@/components/icons/GmailIcon.vue'
import LinkedInIcon from '@/components/icons/LinkedInIcon.vue'
import ProfileStatItem from '@/components/ProfileStatItem.vue'
import ScrambleName from '@/components/ScrambleName.vue'
import { useLocale } from '@/composables/useLocale'
import { site } from '@/config/site'
import { techStack } from '@/i18n/messages'
import type { SocialLink } from '@/types/content'
import { armMailto, isEmailPlaceholder } from '@/utils/email'
import { hasHref, isExternalUrl, visibleLinks } from '@/utils/links'

const { copy } = useLocale()

const profile = computed(() => copy.value.profile)

const stack = computed(() => techStack.filter((tech) => tech.trim().length > 0))
const stats = computed(() => profile.value.stats ?? [])

type HeroLink = SocialLink & {
  key: string
  target?: '_blank'
  rel?: string
  newTab: boolean
}

/** Buttons with an href, plus the attributes each one needs (download vs. new tab vs. same tab). */
const heroLinks = computed<HeroLink[]>(() =>
  visibleLinks(profile.value.socialLinks ?? []).map((link, position) => {
    const downloads = hasHref(link.download)
    const newTab = !downloads && isExternalUrl(link.href)
    return {
      ...link,
      key: `${position}-${link.brand ?? link.label}`,
      target: newTab ? '_blank' : undefined,
      rel: newTab ? 'noopener noreferrer' : undefined,
      newTab,
    }
  }),
)

/** Arms an email link before it can be followed (see utils/email). */
const mailtoHandlers = {
  pointerenter: armMailto,
  pointerdown: armMailto,
  touchstart: armMailto,
  focus: armMailto,
}

type RolePart = { text: string; strong: boolean }

/** roleStart <strong>focusPrimary</strong> roleConnector <strong>focusSecondary</strong>. (blank parts skipped) */
const roleParts = computed<RolePart[]>(() => {
  const { roleStart, focusPrimary, roleConnector, focusSecondary } = profile.value
  const parts: RolePart[] = []
  if (roleStart) parts.push({ text: roleStart, strong: false })
  if (focusPrimary) parts.push({ text: focusPrimary, strong: true })
  if (focusPrimary && focusSecondary && roleConnector) {
    parts.push({ text: roleConnector, strong: false })
  }
  if (focusSecondary) parts.push({ text: focusSecondary, strong: true })
  return parts
})
</script>

<template>
  <div class="intro">
    <p class="whoami">$ whoami</p>

    <ScrambleName :text="site.ownerName" />

    <p v-if="roleParts.length" class="role-line">
      <template v-for="(part, position) in roleParts" :key="position">{{ position > 0 ? ' ' : '' }}<strong v-if="part.strong">{{ part.text }}</strong><template v-else>{{ part.text }}</template></template>.
    </p>

    <ul v-if="stack.length" class="stack-row" :aria-label="copy.accessibility.techStack">
      <li v-for="(tech, position) in stack" :key="`${position}-${tech}`" class="stack-pill">
        {{ tech }}
      </li>
    </ul>

    <div
      v-if="stats.length"
      class="proof-row"
      role="group"
      :aria-label="copy.accessibility.activityIndicators"
    >
      <ProfileStatItem v-for="(stat, position) in stats" :key="position" :stat="stat" />
    </div>

    <div v-if="heroLinks.length" class="links">
      <a
        v-for="link in heroLinks"
        :key="link.key"
        class="link-btn"
        :class="[{ 'link-btn--primary': link.primary }, link.brand ? `link-btn--${link.brand}` : '']"
        :href="link.href"
        :download="link.download || undefined"
        :target="link.target"
        :rel="link.rel"
        v-on="isEmailPlaceholder(link.href) ? mailtoHandlers : {}"
      >
        <GitHubIcon v-if="link.brand === 'github'" class="link-icon" :size="15" />
        <LinkedInIcon v-else-if="link.brand === 'linkedin'" class="link-icon" :size="16" />
        <GmailIcon v-else-if="link.brand === 'email'" class="link-icon" :size="16" />
        <span v-else-if="link.glyph" class="link-icon" aria-hidden="true">{{ link.glyph }}</span>
        {{ link.label }}
        <span v-if="link.newTab" class="sr-only">{{ copy.accessibility.opensInNewTab }}</span>
      </a>
    </div>

    <p v-if="profile.availability" class="availability">
      <span class="availability-dot" aria-hidden="true" />
      {{ profile.availability }}
    </p>
  </div>
</template>

<style scoped>
/* Lets the grid column keep its 1.05fr share even if a very long word would not fit. */
.intro {
  min-width: 0;
}

/* Shell prompt above the name. */
.whoami {
  margin-bottom: 18px;
  color: var(--signal-text);
  font-family: var(--font-mono);
  font-size: 13px;
}

/* The h1 above is inline: this line starts on the next line, spaced by the h1's own line box. */
.role-line {
  margin-bottom: 16px;
  color: var(--text-secondary);
  font-size: 16px;
}

.role-line strong {
  color: var(--ink);
  font-weight: 600;
}

/* ---- Tech pills (not interactive) ---------------------------------------------------------- */

.stack-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  list-style: none;
}

.stack-pill {
  padding: 6px 12px;
  color: var(--text-secondary);
  background-color: var(--surface);
  border: 0.5px solid var(--border-strong);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 11px;
}

/* ---- Stats strip ----------------------------------------------------------------------------- */

.proof-row {
  display: flex;
  overflow: hidden;
  margin-bottom: 28px;
  border: 0.5px solid var(--border);
  border-radius: 16px;
}

/* ---- Link buttons ---------------------------------------------------------------------------- */

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 22px;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 11px 18px;
  color: var(--ink);
  background-color: transparent;
  border: 0.5px solid var(--border-strong);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 12px;
  text-decoration: none;
  transition:
    color 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease;
}

/*
 * Brand colours on hover, keyboard focus and tap (:active covers touch screens, where hover
 * does not exist). Each button fills with its brand colour and the label turns light.
 */
.link-btn--linkedin {
  --brand: #0a66c2;
  --brand-ink: #ffffff;
}

.link-btn--github {
  --brand: #24292f;
  --brand-ink: #ffffff;
}

.link-btn--email {
  /* Google-style white button, so the multicolour Gmail logo stays visible. */
  --brand: #ffffff;
  --brand-ink: #3c4043;
}

/* White on the pale page needs an edge: Google's grey border plus a soft lift. */
@media (hover: hover) {
  .link-btn--email:hover {
    border-color: #dadce0 !important;
    box-shadow: 0 1px 3px rgba(60, 64, 67, 0.25);
  }
}

.link-btn--email:focus-visible,
.link-btn--email:active {
  border-color: #dadce0 !important;
  box-shadow: 0 1px 3px rgba(60, 64, 67, 0.25);
}

:root[data-theme='dark'] .link-btn--github {
  /* GitHub's own dark-mode inversion: a light button on the dark page. */
  --brand: #f0f6fc;
  --brand-ink: #0d1117;
}

@media (hover: hover) {
  .link-btn[class*='link-btn--']:not(.link-btn--primary):hover {
    color: var(--brand-ink);
    background-color: var(--brand);
    border-color: var(--brand);
  }
}

.link-btn[class*='link-btn--']:not(.link-btn--primary):focus-visible,
.link-btn[class*='link-btn--']:not(.link-btn--primary):active {
  color: var(--brand-ink);
  background-color: var(--brand);
  border-color: var(--brand);
}

/* Filled ink pill: dark with light text in the light theme, inverted in the dark theme. */
.link-btn--primary {
  color: var(--canvas);
  background-color: var(--ink);
  border-color: var(--ink);
  font-weight: 700;
}

.link-btn:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 3px;
}

.link-icon {
  display: block;
  flex: none;
}

/* ---- Availability ---------------------------------------------------------------------------- */

.availability {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.availability-dot {
  flex: none;
  width: 8px;
  height: 8px;
  background-color: var(--signal);
  border-radius: 50%;
}
</style>

@media (prefers-reduced-motion: reduce) {
  .link-btn {
    transition: none;
  }
}
