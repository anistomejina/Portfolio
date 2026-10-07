<script setup lang="ts">
import { PhCaretDown } from '@phosphor-icons/vue'
import { computed } from 'vue'

import { useLocale } from '@/composables/useLocale'
import type { ExperienceEntry } from '@/types/content'

const props = defineProps<{
  entry: ExperienceEntry
  isOpen: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const { copy } = useLocale()

const triggerId = computed(() => `experience-trigger-${props.entry.slug}`)
const panelId = computed(() => `experience-panel-${props.entry.slug}`)

const skills = computed(() => (props.entry.skills ?? []).filter((skill) => skill.trim() !== ''))
const skillsLabel = computed(() => copy.value.experience.skillsLabel || 'Skills')
</script>

<template>
  <article class="entry" :class="{ 'entry--open': isOpen }">
    <button
      :id="triggerId"
      type="button"
      class="entry-head"
      :aria-expanded="isOpen"
      :aria-controls="panelId"
      @click="emit('toggle')"
    >
      <span class="entry-heading">
        <span class="entry-role">{{ entry.role }}</span>
        <span v-if="entry.period" class="entry-period">{{ entry.period }}</span>
        <span v-if="entry.company" class="entry-company">{{ entry.company }}</span>
      </span>
      <PhCaretDown class="entry-sign" :size="16" weight="regular" color="currentColor" aria-hidden="true" />
    </button>

    <!--
      Collapses with the grid-rows technique (0fr ↔ 1fr), so no height is measured. Once collapsed the
      panel is also visibility:hidden, which keeps its content out of the tab order and the a11y tree.
    -->
    <div
      :id="panelId"
      class="entry-body"
      role="region"
      :aria-labelledby="triggerId"
      :aria-hidden="!isOpen"
    >
      <div class="entry-body-shell">
        <div class="entry-body-inner">
          <p v-if="entry.location" class="entry-location">{{ entry.location }}</p>
          <p v-if="entry.description" class="entry-description">{{ entry.description }}</p>
          <ul v-if="skills.length" class="entry-skills" :aria-label="skillsLabel">
            <li v-for="(skill, index) in skills" :key="`${index}-${skill}`" class="skill-chip">{{ skill }}</li>
          </ul>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* ---- Header button --------------------------------------------------------------------------- */

.entry-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px;
  align-items: start;
  gap: 24px;
  width: 100%;
  padding: 20px 4px 22px 0;
  font-family: inherit;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  /* Only visible as the shape of the focus ring. */
  border-radius: 10px;
  cursor: pointer;
}

.entry-head:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 4px;
}

.entry-heading {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.entry-role {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 400;
  line-height: 1.35;
  color: var(--ink);
}

.entry-period {
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-muted);
}

.entry-company {
  font-size: 13px;
  color: var(--text-muted);
}

.entry-sign {
  justify-self: end;
  margin-top: 4px;
  color: var(--text-muted);
  transition:
    color 160ms ease,
    transform 160ms ease;
}

.entry--open .entry-sign {
  color: var(--signal-text);
  transform: rotate(180deg);
}

/* ---- Collapsible body ------------------------------------------------------------------------ */

/* Closing: rows shrink and the content fades; visibility flips only after the 250ms collapse. */
.entry-body {
  display: grid;
  grid-template-rows: 0fr;
  visibility: hidden;
  opacity: 0;
  transition:
    grid-template-rows 250ms ease,
    opacity 180ms ease,
    visibility 0s linear 250ms;
}

/* Opening: visible at once while the rows grow and the content fades in. */
.entry--open .entry-body {
  grid-template-rows: 1fr;
  visibility: visible;
  opacity: 1;
  transition-delay: 0s;
}

.entry-body-shell {
  min-height: 0;
  overflow: hidden;
}

.entry-body-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  /* The right padding keeps the text clear of the caret column. */
  padding: 0 44px 30px 0;
}

.entry-location {
  /* Pulls the description up to an 8px gap. */
  margin: 0 0 -8px;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-muted);
}

.entry-description {
  max-width: 760px;
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.entry-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
}

.skill-chip {
  padding: 6px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.3;
  white-space: nowrap;
  color: var(--text-muted);
  border: 0.5px solid var(--border-strong);
  border-radius: 999px;
}

/* ---- Responsive ------------------------------------------------------------------------------ */

@media (max-width: 900px) {
  .entry-head {
    gap: 20px;
  }
}

@media (max-width: 640px) {
  .entry-head {
    gap: 16px;
    padding: 18px 0 20px;
  }

  .entry-role {
    font-size: 16px;
  }

  .entry-body-inner {
    padding: 0 0 26px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .entry-sign,
  .entry-body,
  .entry--open .entry-body {
    transition: none;
  }
}
</style>
