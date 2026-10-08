<script setup lang="ts">
import {
  PhArrowUpRight,
  PhBriefcase,
  PhCoffee,
  PhHeart,
  PhLinkSimple,
  PhStar,
} from '@phosphor-icons/vue'
import { computed, onBeforeUnmount, onMounted, ref, type Component } from 'vue'

import GitHubAnalytics from '@/components/GitHubAnalytics.vue'
import ScrambleName from '@/components/ScrambleName.vue'
import { useLocale } from '@/composables/useLocale'
import { site } from '@/config/site'
import { armMailto, EMAIL_LINK, hasEmail, isEmailPlaceholder, revealEmail } from '@/utils/email'
import { hasHref } from '@/utils/links'

const { copy } = useLocale()
const t = computed(() => copy.value.support)

const email = hasEmail ? EMAIL_LINK : ''

/** The visible address is filled in after mount, so it is not in the initial HTML. */
const emailText = ref('')
onMounted(() => (emailText.value = revealEmail()))

/** Arms an email link before it can be followed (see utils/email). */
const mailtoHandlers = {
  pointerenter: armMailto,
  pointerdown: armMailto,
  touchstart: armMailto,
  focus: armMailto,
}
const issuesUrl = site.githubUrl

/** Where "work with me" points: email first, then LinkedIn, then GitHub. */
const hireHref = email || site.linkedinUrl || site.githubUrl

type Way = {
  key: string
  icon: Component
  title: string
  text: string
  action: string
  href?: string
  onClick?: () => void
  primary?: boolean
}

// ----- share: copy the site's address -------------------------------------------------------

type CopyState = 'idle' | 'copied' | 'failed'
const copyState = ref<CopyState>('idle')
let copyTimer: ReturnType<typeof setTimeout> | undefined

async function copyLink(): Promise<void> {
  const url = new URL(import.meta.env.BASE_URL, window.location.origin).href
  try {
    await navigator.clipboard.writeText(url)
    copyState.value = 'copied'
  } catch {
    copyState.value = 'failed'
  }
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => (copyState.value = 'idle'), 2400)
}

onBeforeUnmount(() => clearTimeout(copyTimer))

const shareLabel = computed(() =>
  copyState.value === 'copied'
    ? t.value.shareCopied
    : copyState.value === 'failed'
      ? t.value.shareFailed
      : t.value.shareAction,
)

// ----- support options (cards with an empty link are hidden) ---------------------------------

const ways = computed<Way[]>(() =>
  [
    {
      key: 'sponsor',
      icon: PhHeart,
      title: t.value.sponsorTitle,
      text: t.value.sponsorText,
      action: t.value.sponsorAction,
      href: site.sponsorUrl,
      primary: true,
    },
    {
      key: 'coffee',
      icon: PhCoffee,
      title: t.value.coffeeTitle,
      text: t.value.coffeeText,
      action: t.value.coffeeAction,
      href: site.coffeeUrl,
    },
    {
      key: 'star',
      icon: PhStar,
      title: t.value.starTitle,
      text: t.value.starText,
      action: t.value.starAction,
      href: site.githubUrl,
    },
    {
      key: 'share',
      icon: PhLinkSimple,
      title: t.value.shareTitle,
      text: t.value.shareText,
      action: shareLabel.value,
      onClick: copyLink,
    },
    {
      key: 'hire',
      icon: PhBriefcase,
      title: t.value.hireTitle,
      text: t.value.hireText,
      action: t.value.hireAction,
      href: hireHref,
    },
  ].filter((way) => way.onClick || hasHref(way.href)),
)

const contacts = computed(() =>
  [
    { key: 'email', label: t.value.contactEmail, value: emailText.value, href: email },
    {
      key: 'linkedin',
      label: t.value.contactLinkedIn,
      value: site.linkedinUrl.replace(/^https?:\/\/(www\.)?/, ''),
      href: site.linkedinUrl,
    },
    {
      key: 'github',
      label: t.value.contactGitHub,
      value: issuesUrl.replace(/^https?:\/\//, ''),
      href: issuesUrl,
    },
  ].filter((contact) => hasHref(contact.href)),
)

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href)
}
</script>

<template>
  <main class="support-page">
    <p class="eyebrow">{{ t.eyebrow }}</p>
    <div class="page-title">
      <ScrambleName :key="t.pageTitle" :text="t.pageTitle" />
    </div>
    <p class="intro">{{ t.intro }}</p>

    <section class="block" aria-labelledby="ways-title">
      <header class="block-head">
        <h2 id="ways-title" class="block-title">{{ t.waysTitle }}</h2>
      </header>

      <ul class="ways">
        <li v-for="(way, index) in ways" :key="way.key" class="way" :class="{ 'way--primary': way.primary }">
          <span class="way-index" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="way-icon" aria-hidden="true">
            <component :is="way.icon" :size="18" weight="regular" />
          </span>
          <h3 class="way-title">{{ way.title }}</h3>
          <p class="way-text">{{ way.text }}</p>

          <button
            v-if="way.onClick"
            type="button"
            class="way-action"
            :class="{ 'way-action--done': copyState === 'copied' }"
            aria-live="polite"
            @click="way.onClick"
          >
            {{ way.action }}
          </button>
          <a
            v-else-if="way.href"
            :href="way.href"
            class="way-action"
            :target="isExternal(way.href) ? '_blank' : undefined"
            :rel="isExternal(way.href) ? 'noopener noreferrer' : undefined"
            v-on="isEmailPlaceholder(way.href) ? mailtoHandlers : {}"
          >
            {{ way.action }}
            <PhArrowUpRight :size="12" aria-hidden="true" />
          </a>
        </li>
      </ul>
    </section>

    <section v-if="contacts.length" class="block" aria-labelledby="contact-title">
      <header class="block-head">
        <h2 id="contact-title" class="block-title">{{ t.contactTitle }}</h2>
        <p class="block-meta">{{ t.contactNote }}</p>
      </header>

      <ul class="contacts">
        <li v-for="contact in contacts" :key="contact.key">
          <a
            :href="contact.href"
            class="contact"
            :target="isExternal(contact.href) ? '_blank' : undefined"
            :rel="isExternal(contact.href) ? 'noopener noreferrer' : undefined"
            v-on="isEmailPlaceholder(contact.href) ? mailtoHandlers : {}"
          >
            <span class="contact-label">{{ contact.label }}</span>
            <span class="contact-value">{{ contact.value }}</span>
            <PhArrowUpRight class="contact-arrow" :size="14" aria-hidden="true" />
          </a>
        </li>
      </ul>
    </section>

    <GitHubAnalytics />
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

.intro {
  max-width: 640px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
}

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
  font-size: 12px;
  color: var(--text-muted);
}

/* ----- support cards ----- */
.ways {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  list-style: none;
}

.way {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px 22px 20px;
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.way:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
}

.way--primary {
  border-color: color-mix(in srgb, var(--signal) 45%, var(--border));
}

.way-index {
  position: absolute;
  top: 22px;
  right: 22px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.way-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--signal-text);
  background: var(--signal-soft);
  border-radius: 10px;
}

.way-title {
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.way-text {
  flex: 1;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-secondary);
}

.way-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  margin-top: 6px;
  padding: 8px 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink);
  text-decoration: none;
  background: transparent;
  border: 0.5px solid var(--border-strong);
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.way-action:hover,
.way--primary .way-action {
  color: var(--signal-text);
  background: var(--signal-soft);
  border-color: var(--signal);
}

.way-action--done {
  color: var(--signal-text);
  border-color: var(--signal);
}

.way-action:focus-visible,
.contact:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 3px;
}

/* ----- contact rows ----- */
.contacts {
  list-style: none;
}

.contact {
  display: grid;
  grid-template-columns: minmax(120px, 200px) minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  color: inherit;
  text-decoration: none;
  border-bottom: 0.5px solid var(--border);
}

.contact-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.contact-value {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--ink);
  overflow-wrap: anywhere;
}

.contact-arrow {
  color: var(--text-muted);
  transition: color 0.2s ease, transform 0.2s ease;
}

.contact:hover .contact-value,
.contact:hover .contact-arrow {
  color: var(--signal-text);
}

.contact:hover .contact-arrow {
  transform: translate(2px, -2px);
}

@media (max-width: 640px) {
  .contact {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px 12px;
  }

  .contact-label {
    grid-column: 1 / -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .way,
  .way-action,
  .contact-arrow {
    transition: none;
  }

  .way:hover {
    transform: none;
  }
}
</style>
