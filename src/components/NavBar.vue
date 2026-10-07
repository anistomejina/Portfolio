<script setup lang="ts">
import { HalfMoon, IconoirProvider, SunLight } from '@iconoir/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useLocale } from '@/composables/useLocale'
import { useTheme } from '@/composables/useTheme'
import { availableLocales, localeNames, navigationItems } from '@/i18n/messages'

const route = useRoute()
const { locale, copy, setLocale } = useLocale()
const { theme, toggleTheme } = useTheme()

const isDark = computed(() => theme.value === 'dark')

const themeIconProps = {
  width: 16,
  height: 16,
  'stroke-width': 1.7,
  'aria-hidden': 'true',
}

const links = computed(() =>
  navigationItems.map((item) => ({
    ...item,
    label: copy.value.navigation[item.key],
    // Exact match only: detail pages (/projects/slug, /blog/slug) highlight nothing.
    active: route.path === item.path,
  })),
)

const themeLabel = computed(() =>
  isDark.value
    ? copy.value.accessibility.switchToLightTheme
    : copy.value.accessibility.switchToDarkTheme,
)
</script>

<template>
  <div class="nav-wrap">
    <nav class="nav" :aria-label="copy.accessibility.mainNavigation">
      <RouterLink
        v-for="link in links"
        :key="link.key"
        :to="link.path"
        class="nav-link"
        :class="{ 'nav-link--active': link.active }"
        :aria-current="link.active ? 'page' : undefined"
      >
        {{ link.label }}
      </RouterLink>

      <span class="divider" aria-hidden="true" />

      <div class="locale-switch" role="group" :aria-label="copy.accessibility.languageSelector">
        <button
          v-for="code in availableLocales"
          :key="code"
          type="button"
          class="locale-option"
          :class="{ 'locale-option--active': locale === code }"
          :aria-label="localeNames[code]"
          :title="localeNames[code]"
          :aria-pressed="locale === code"
          @click="setLocale(code)"
        >
          {{ code.toUpperCase() }}
        </button>
      </div>

      <button type="button" class="theme-btn" :aria-label="themeLabel" @click="toggleTheme">
        <!-- The icon shows the theme you will switch to. -->
        <IconoirProvider :icon-props="themeIconProps">
          <SunLight v-if="isDark" class="theme-icon" />
          <HalfMoon v-else class="theme-icon" />
        </IconoirProvider>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.nav-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 88px;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 12px 24px;
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 999px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.03em;
  text-decoration: none;
}

.nav-link--active {
  color: var(--ink);
  font-weight: 700;
}

.nav-link--active::before {
  content: '•';
  color: var(--signal);
}

.divider {
  width: 1px;
  height: 16px;
  background: var(--border-strong);
}

.locale-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

.locale-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: none;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.locale-option:hover,
.locale-option--active {
  background: var(--signal-soft);
  color: var(--ink);
}

.locale-option--active {
  font-weight: 700;
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0.5px solid var(--border-strong);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
}

.theme-icon {
  display: block;
  width: 16px;
  height: 16px;
  stroke: currentColor;
}

.nav-link:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 3px;
  border-radius: 4px;
}

.locale-option:focus-visible,
.theme-btn:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 3px;
}

@media (max-width: 720px) {
  .nav {
    gap: 12px;
    padding: 10px 16px;
    border-radius: 24px;
  }

  .divider {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .locale-option {
    transition: none;
  }
}
</style>
